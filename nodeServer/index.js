const app = require('express')();
const httpServer = require('http').createServer(app);
const io = require("socket.io")(httpServer, { cors: { origin: "*" } })
io.on('connection', (socket) => {
    console.log('Client connected');
    // Handle canvas data synchronization here

    socket.on('updateCanvas', (data) => {
        // Broadcast the updated data to all connected clients
        io.emit('updateCanvas', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
// Start the server
httpServer.listen(3000, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});
