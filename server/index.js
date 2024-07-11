const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Define the PORT variable, default to 3000 if not set
const PORT = process.env.PORT || 3000;

// Create an HTTP server instance
const server = http.createServer(app);

// Create a new instance of Socket.IO server attached to the HTTP server
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for demonstration purposes, change as needed
        methods: ['GET', 'POST'],
    },
});

app.get('/', (req, res) => {
    res.send('Hello World');
});
// Socket.IO event handling
io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('room:join', (data) => {
        const { email, room } = data;
        socket.join(room);
        io.to(room).emit('user:joined', { email, id: socket.id });
        io.to(socket.id).emit('room:join', data);
    });

    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit('incoming:call', { from: socket.id, offer });
    });

    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans });
    });

    socket.on('peer:nego:needed', ({ to, offer }) => {
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
    });

    socket.on('peer:nego:done', ({ to, ans }) => {
        io.to(to).emit('peer:nego:final', { from: socket.id, ans });
    });
});

// Start the HTTP server listening on the defined PORT
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
