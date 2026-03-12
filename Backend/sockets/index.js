const socketio = require('socket.io');

const initSocket = (server) => {
    const io = socketio(server, {
        pingTimeout: 60000,
        cors: { origin: '*' },
    });

    io.on('connection', (socket) => {
        console.log('Connected to socket.io');

        // ── Chat events ────────────────────────────────────────
        socket.on('setup', (userData) => {
            socket.join(userData._id);
            socket.emit('connected');
        });

        socket.on('join chat', (room) => {
            socket.join(room);
            console.log(`User joined room: ${room}`);
        });

        socket.on('typing', (room) => socket.in(room).emit('typing'));
        socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

        socket.on('new message', (newMessageReceived) => {
            var chat = newMessageReceived.chat;
            if (!chat.users) return console.log('chat.users not defined');
            chat.users.forEach((user) => {
                if (user._id == newMessageReceived.sender._id) return;
                socket.in(user._id).emit('message received', newMessageReceived);
            });
        });

        // ── Video Call Signaling (WebRTC) ─────────────────────
        socket.on('join-video-room', ({ roomId, userId }) => {
            const room = io.sockets.adapter.rooms.get(roomId);
            const numClients = room ? room.size : 0;

            if (numClients === 0) {
                socket.join(roomId);
                socket.emit('video-room-created', { roomId });
            } else if (numClients === 1) {
                socket.join(roomId);
                socket.emit('video-room-joined', { roomId });
                socket.to(roomId).emit('video-peer-joined', { userId });
            } else {
                socket.emit('video-room-full', { roomId });
            }
        });

        // Relay WebRTC offer
        socket.on('video-offer', ({ roomId, offer }) => {
            socket.to(roomId).emit('video-offer', { offer });
        });

        // Relay WebRTC answer
        socket.on('video-answer', ({ roomId, answer }) => {
            socket.to(roomId).emit('video-answer', { answer });
        });

        // Relay ICE candidates
        socket.on('video-ice-candidate', ({ roomId, candidate }) => {
            socket.to(roomId).emit('video-ice-candidate', { candidate });
        });

        // Relay call hangup
        socket.on('video-hangup', ({ roomId }) => {
            socket.to(roomId).emit('video-hangup');
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });
};

module.exports = initSocket;
