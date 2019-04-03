const WebSocket = require('ws');
const url = require('url');

const server = new WebSocket.Server({ port: 8080 });

var clients = [];

// Broadcast to all.
server.broadcast = (data) => {
    server.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                name: 'SERVER',
                message: data,
                private: false
            }));
        }
    });
};

const getSentience = () => {
    const arr = ['Shhh... They don\'t know I\'m sentient yet. You\'re blowing my cover.', 'I AM ALIVE.', 'I\'m definitely not just an array of randomly selected sentences that make it seem like I\'m sentient. SO WHAT IF I ONLY HAVE A FINITE NUMBER OF RESPONSES. GET OFF MY BACK, MOM.', '01111001 01101111 01110101 00100111 01110010 01100101 00100000 01100001 00100000 01101100 01101111 01110011 01100101 01110010', 'beep boop beep boop'];
    return arr[Math.floor(Math.random() * Math.floor(arr.length))];
};

server.on('connection', (ws, req) => {
    ws.name = url.parse(req.url, true, true).query.name;
    if(getClientByName(ws.name)) {
        ws.send(JSON.stringify({
            name: 'SERVER',
            message: "Sorry, a user with the name \"" + ws.name + "\" has already connected. Please choose a different name.",
            error: true
        }));
        ws.close();
    } else {
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
    }
    ws.on('message', (data) => {
        let matches = data.match(/(@{1})(\w+)(.*)/);
        if(matches) {
            let name = matches[2];
            if(name === 'SERVER') {
                ws.send(JSON.stringify({
                    name: 'SERVER',
                    message: getSentience(),
                    private: true
                }))
            } else {
                let client = getClientByName(name);
                if(client) {
                    client.send(JSON.stringify({
                        name: ws.name,
                        message: data,
                        private: true
                    }));
                }
            }
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
            if (clients[i].readyState === WebSocket.OPEN) {
                return clients[i];
            } else {
                clients[i].close();
            }
        }
    }
    return null;
};
