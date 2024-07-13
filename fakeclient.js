const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:81'); // Replace with your WebSocket server URL

ws.on('open', function open() {
  const payload = Buffer.from("4d0400000e00000008d196a5c18a3210d196a5c18a32", 'hex');
  ws.send(payload);
  console.log('Sent:', payload);
});

ws.on('message', function incoming(data) {
  const receivedData = data.toString('hex'); // Convert to hex string
  console.log('Received:', receivedData);
});
