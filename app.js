const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;
const io = socketio(server, { cors: { origin: "*" } });

// Socket connection
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room ${room}`);
    });


    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        console.log(`Client ${socket.id} left room ${room}`);
    });

    socket.on('demo',(name)=>{
        console.log("name",name);
        socket.emit('demo1',name);
    })
   

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

// console.log("ioo0000000000000000",io)


module.exports = io;

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(express.json());



// Routes
const TransectionRoute = require('./routes/TransectionRoute');
const ProductRoute = require('./routes/ProductRoute');
const UserRoute = require('./routes/UserRoute');
const CartRoute = require('./routes/CartRoute');
const CategoryRoute = require('./routes/CategoryRoute')

// Initialize routes with io

// app.use((req, res, next) => {
//     req.io = io;
//     next();
// });

app.use(TransectionRoute);
app.use('/product', ProductRoute);
app.use(CartRoute);
app.use(UserRoute);
app.use(CategoryRoute);

// Public folder
app.use('/uploads', express.static(__dirname + "/uploads"));


// MongoDB connection
const MONGODB_URL = "mongodb://127.0.0.1:27017/BUYZA";
mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log(`${MONGODB_URL} Connection Successfully`);
    })
    .catch((err) => {
        console.log('Error in connection to MongoDB:', err.message);
    });