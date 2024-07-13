const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080'); // Replace with your WebSocket server URL

ws.on('open', function open() {
  const payload = Buffer.from("4c040000490000000a08457665726c616e6412136c6976652d7374726573732d746573742d31621a216d6f636b65645f6163636573735f746f6b656e5f666f725f63686172616374657220e487f39b8a32", 'hex');
  ws.send(payload);
  console.log('Sent:', payload);
});

ws.on('message', function incoming(data) {
  const receivedData = data.toString('hex'); // Convert to hex string
  console.log('Received:', receivedData);
});
