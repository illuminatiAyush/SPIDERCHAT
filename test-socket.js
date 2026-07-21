const { io } = require('socket.io-client');
const http = require('http');

// We will mock 2 users logging in and connecting sockets.
// But we can't easily get the HttpOnly cookie in a Node script without fetching it.
// Let's just read the code closely.
