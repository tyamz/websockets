const WebSocket = require('ws');
const url = require('url');

const server = new WebSocket.Server({ port: 8080 });

var clients = [];

// Broadcast to all.
server.broadcast = (data) => {
    server.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

server.on('connection', (ws, req) => {
    ws.name = url.parse(req.url, true, true).query.name;
    clients.push(ws);
    server.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                name: 'SERVER',
                message: (ws.name + ' has connected.'),
                private: false
            }));
        }
    });
    ws.on('message', (data) => {
        let matches = data.match(/(@{1})(\w+)(.*)/);
        if(matches) {
            let name = matches[2];
            let client = getClientByName(name);
            client.send(JSON.stringify({
                name: ws.name,
                message: data,
                private: true
            }));
        } else {
            // Broadcast to everyone else.
            server.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        name: ws.name,
                        message: data,
                        private: false
                    }));
                }
            });
        }
    });
});

var getClientByName = (name) => {
    for(var i = 0; i < clients.length; i++) {
        if(clients[i].name === name) {
            return clients[i];
        }
    }
};
