import {io} from 'socket.io-client'
import { setIdentity, setIsRoomHost, setParticipants, setRoomId, setSocketId } from '../store/actions';
import * as webRTCHandler from './webRTCHandler'
import Cookies from 'js-cookie'
import {store} from '../store/store'
const SERVER = "http://localhost:4000"
let socket = io(SERVER);
export default socket
const connectionWithSocketServer = (ContextData) =>{
    console.log('ContextData',ContextData)
    // ws.onopen = () =>{
    //     alert('websocket connected')
    // }
    socket.on('connect',()=>{
        console.log('socket connected in the client side with the socket id : ',socket.id)
        store.dispatch(setSocketId(socket.id))
    })
    // ws.onmessage = (message) =>{
    //     console.log('message',message)
    //     const data = JSON.parse(message.data)
    //     const type = data['type']
    //     if(type=="room-id"){
    //         console.log(data)
    //         const {roomID} = data
    //         store.dispatch(setRoomId(roomID))
    //     }
    //     else if(type==='room-update'){
    //         console.log('room update data',data)
    //     const {connectedUsers} = data
            
    //         store.dispatch(setParticipants(data.connectedUsers))
    //     }
    // }
    socket.on('room-id',(data)=>{
        console.log(data)
        const {roomID} = data
        store.dispatch(setRoomId(roomID))
        
    })

    socket.on('room-update',(data)=>{
        const {connectedUsers} = data;
        console.log('room-update',connectedUsers)
        localStorage.setItem('participants_length',connectedUsers.length)
        Cookies.set('participants_length',connectedUsers.length)
        store.dispatch(setParticipants(connectedUsers))
    })

    socket.on('conn-prepare',(data)=>{
        
        const {connUserSocketId} = data
        
         webRTCHandler.prepareNewPeerConnection(connUserSocketId,false)  
         //inform the user who has just joined saying that be prepared for incomming connection
         socket.emit('conn-init',{connUserSocketId:connUserSocketId})
    })
    socket.on('conn-signal',(data)=>{
        const {signal,connUserSocketId} = data
        
        webRTCHandler.handleSignallingData(data)
    })

    socket.on('conn-init',(data)=>{
        const {connUserSocketId} = data
        console.log('user socket id in conn-init : ',connUserSocketId)
        webRTCHandler.prepareNewPeerConnection(connUserSocketId,true)
    })
    socket.on('user-disconnected',({socketId})=>{
        console.log('user-disconnected',socketId)
        webRTCHandler.handleDisconnectedUser(socketId)
    })
}

export const createNewRoom = (identity,roomID,isRoomHost) =>{
    //emit an event to server to create a new room
    
    const data = {
        identity,
        roomID,
        isRoomHost
    }
    store.dispatch(setIdentity(identity))
    store.dispatch(setIsRoomHost(isRoomHost))
    socket.emit('create-new-room',data)
    // ws.send(JSON.stringify({
    //     "type":"create-new-room",
    //     "data":data
    // }))
}

export const JoinRoom = (identity,roomID,isRoomHost) =>{
    
    //event to the server an event saying that u would like to join a room
    const data = {
        roomID,
        identity,
        isRoomHost
    }
    store.dispatch(setIdentity(identity))
    store.dispatch(setIsRoomHost(isRoomHost))
    socket.emit('join-room',data)
    // ws.send(JSON.stringify({
    //     "type":"join-room",
    //     "data":data
    // }))
}

export const SignalPeerData = (data) =>{
    socket.emit('conn-signal',data)
}