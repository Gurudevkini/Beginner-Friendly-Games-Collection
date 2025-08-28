const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/socket.io', // The path for all socket.io traffic
    createProxyMiddleware({
      target: 'http://localhost:3001', // Backend server
      ws: true, // enable proxying for WebSockets
    })
  );
};