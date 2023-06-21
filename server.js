import express from 'express';
import { Server } from "socket.io";
import cors from 'cors'
import { v4 as uuidv4 } from "uuid";
import bodyParser from 'body-parser';
import { Configuration, OpenAIApi } from 'openai';
const app = express()
app.use(bodyParser.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(cors())
const config = new Configuration({
    apiKey: "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"
})
const openai = new OpenAIApi(config)

var server = app.listen(4000, () => {
    console.log('listening to port 4000')
})
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET','POST']
    }
});



var connectedUsers = [];
var rooms = []
io.on("connection", (socket) => {
    console.log('user connected : ', socket.id)
    socket.on('create-new-room', (data) => {
        CreateNewRoomHandler(data, socket)
    })
    socket.on('join-room', (data) => {
        JoinRoomHandler(data, socket)
    })
    socket.on('disconnect', () => {
        disconnectHandler(socket);
    })
    socket.on('conn-signal', data => {
        SignallingHandler(data, socket)
    })
    socket.on('conn-init', (data) => {
        initialConnectionHandler(data, socket)
    })
    socket.on('user-length', (roomID) => {
        io.to(roomID).emit('user-length', rooms.find(x => x.id === roomID).connectedUsers.length)
    })
    socket.on("update-peers", (data) => {
        const { socketId, peer } = data
        io.to(socketId).emit('update-peers', data)
    })

})




const CreateNewRoomHandler = (data, socket) => {
    console.log('host is creating a new room')
    console.log(data)
    const { identity, roomID, isRoomHost } = data

    //create a new user
    const newUser = {
        identity,
        id: `user-${uuidv4()}`,
        socketId: socket.id,
        roomID: roomID,
        isRoomHost: isRoomHost
    }

    //push the user to the connectedUsers
    connectedUsers = [...connectedUsers, newUser]

    //create new room
    const newRoom = {
        id: roomID,
        connectedUsers: [newUser]
    }
    console.log(connectedUsers)
    //join socket.io room
    socket.join(roomID)

    //push the new room to the rooms array
    rooms = [...rooms, newRoom]

    //emit to that client which created that room roomID
    socket.emit('room-id', { roomID })


    //emit an event to all users connected to that room about the new users which are right in this room
    socket.emit('room-update', { connectedUsers: newRoom.connectedUsers })
}


const JoinRoomHandler = (data, socket) => {
    const { identity, roomID, isRoomHost } = data

    const newUser = {
        identity,
        id: `user-${uuidv4()}`,
        socketId: socket.id,
        roomID: roomID,
        isRoomHost: isRoomHost
    }

    //join room as user which is just joining the room by passing the roomID
    const room = rooms.find(room => room.id === roomID)
    if (room) {
        room.connectedUsers = [...room.connectedUsers, newUser];
    }

    //join the socket io room
    socket.join(roomID)

    //emit to all new users to ask them to be prepared for a new connection
    room.connectedUsers.forEach((user) => {
        if (user.socketId !== socket.id) {
            const data = {
                connUserSocketId: socket.id,
                connUserIdentity: newUser.identity,
                connUserId: newUser.id
            }

            io.to(user.socketId).emit("conn-prepare", data)
        }
    })
    //add the user to connected user array
    connectedUsers = [...connectedUsers, newUser]

    io.to(roomID).emit('room-update', { connectedUsers: room.connectedUsers })
}


const disconnectHandler = (socket) => {
    //if user has been register , if yes remote him from rooms and connectedUsers array
    const user = connectedUsers.find((user) => user.socketId === socket.id)
    if (user) {
        //remove user from the rooms array
        const room = rooms.find(room => room.id === user.roomID)
        room.connectedUsers = room.connectedUsers.filter(user => user.socketId !== socket.id)
        socket.leave(user.roomID)
        io.to(room.id).emit('user-disconnected', { socketId: socket.id })
        io.to(room.id).emit('room-update', { connectedUsers: room.connectedUsers })
    }


    //emit an event to the rest of the users which left in the room

}



const SignallingHandler = (data, socket) => {
    const { signal, connUserSocketId } = data
    const signallingData = { signal, connUserSocketId: socket.id }
    io.to(connUserSocketId).emit('conn-signal', signallingData)
}


const initialConnectionHandler = (data, socket) => {
    const { connUserSocketId } = data
    const initData = { connUserSocketId: socket.id }
    io.to(connUserSocketId).emit('conn-init', initData)
}


