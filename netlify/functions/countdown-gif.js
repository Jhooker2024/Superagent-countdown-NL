// Netlify serverless function for countdown GIF
import countdownHandler from '../../api/countdown.js';

export const handler = async (event, context) => {
  // Create a mock Express request/response object
  const req = {
    query: event.queryStringParameters || {},
    method: event.httpMethod,
    url: event.path
  };

  const res = {
    setHeader: (name, value) => {
      // Store headers to be returned
      if (!res.headers) res.headers = {};
      res.headers[name] = value;
    },
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    send: (data) => {
      res.body = data;
      return res;
    },
    write: (data) => {
      if (!res.body) res.body = '';
      res.body += data;
    },
    end: () => {
      // End response
    },
    headers: {},
    statusCode: 200,
    body: null
  };

  try {
    await countdownHandler(req, res, true); // true for GIF mode
    
    return {
      statusCode: res.statusCode || 200,
      headers: {
        'Content-Type': res.headers['Content-Type'] || 'image/gif',
        'Cache-Control': res.headers['Cache-Control'] || 'no-cache',
        'Access-Control-Allow-Origin': '*',
        ...res.headers
      },
      body: res.body ? res.body.toString('base64') : '',
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Countdown GIF function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      },
      body: 'Internal Server Error'
    };
  }
};
