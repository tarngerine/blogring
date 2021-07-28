const express = require('express'),
  http = require('http'),
  app = express(),
  server = http.createServer(app),
  path = require('path'),
  WebSocket = require('ws');

const wss = new WebSocket.Server({ server, path: '/ws' });

const clients = {}; // Record<UUID, WebSocket>

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    // console.log('received: %s', message);

    // When a new user joins, pick another user to sync data over
    const payload = JSON.parse(message);
    // console.log(payload);
    if (payload.event === 'join') {
      // store client by client generated ID
      clients[payload.id] = ws;

      // use array.some like a forEach with break
      for (var i = 0; i < wss.clients.length; i++) {
        const client = wss.clients[i];
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
          // console.log('SYNCER selected', client);
          break;
        }
      }
    }

    // The user that receives 'join' payload will sync back data to new user
    if (payload.event === 'sync') {
      // console.log('SYNC', payload);
      clients[payload.id].send(message);
    }

    wss.clients.forEach(function each(client) {
      // dont send to same client
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
  // res.json({'hi': 123})

  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.NODE_ENV === 'production' ? 3000 : 3001;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
