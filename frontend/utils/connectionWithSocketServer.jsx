import { store } from "../store/store"
import { setSocketId, setRoomId, setParticipants } from "../store/actions"
import { prepareNewPeerConnection } from "./prepareNewPeerConnection"
import { io } from 'socket.io-client'
import {W3CWebSocket} from "websocket"

const handleDisconnectedUser = (peers, socketId) => {
    const VideoGrid = document.getElementById('VideoGrid')


    const remotevideo = document.getElementById(`v_${socketId}`)
    if (remotevideo) {
        const tracks = remotevideo.srcObject.getTracks()
        tracks.forEach(t => t.stop())

        remotevideo.srcObject = null
        remotevideo.muted = true
        VideoGrid.removeChild(remotevideo)
    }
    if (peers.current[socketId]) {
        peers.current[socketId].destroy();
    }
    delete peers.current[socketId]
    const numVideos = localStorage.getItem('participants_length') - 1 || 1;

    let columns = 1;
    if (numVideos === 1) columns = 1
    else if (numVideos > 1 && numVideos <= 4) columns = 2;
    else if (numVideos > 4 && numVideos <= 9) columns = 3;
    else if (numVideos > 9 && numVideos <= 16) columns = 4;
    else if (numVideos > 16 && numVideos <= 25) columns = 5;
    VideoGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}



const handleSignallingData = (peers, data) => {
    peers.current[data.connUserSocketId].signal(data.signal)
}



export const connectionWithSocketServer = (socket, peers, ScreenSharingStream, localStream, worker, setGotFile, FileNameRef, FileSentBy, setProgress, isDrawing, Transcript) => {
    socket.current = new WebSocket('wss://www.pradeeps-video-conferencing.store/ws/chat/')
    console.log(socket.current)
    socket.current.onopen = () => {
        console.log('web socket connection opened')
    }
    socket.current.onmessage = (message) => {
        console.log(message)
        const data = JSON.parse(message.data)
        const type = data['type']
        if (type === "room-update") {
            alert('room-update')
            console.log('connected Users')
            const { connectedUsers } = data;
            console.log('room-update', connectedUsers)
            localStorage.setItem('participants_length', connectedUsers.length)
            store.dispatch(setParticipants(connectedUsers))
        }
        else if (type == "conn-prepare") {
            alert('conn-prepare')
            const { connUserSocketId } = data
            prepareNewPeerConnection(socket, peers, connUserSocketId, false, ScreenSharingStream, localStream, worker, setGotFile, FileNameRef, FileSentBy, setProgress, isDrawing, Transcript)
            socket.current.send(JSON.stringify({
                "type": 'conn-init',
                data: {
                    connUserSocketId: connUserSocketId
                }
            }))
        }
        else if (type == "conn-signal") {
            const { signal, connUserSocketId } = data
            handleSignallingData(peers, data)
        }
        else if (type === "conn-init") {
            const { connUserSocketId } = data
            prepareNewPeerConnection(socket, peers, connUserSocketId, true, ScreenSharingStream, localStream, worker, setGotFile, FileNameRef, FileSentBy, setProgress, isDrawing, Transcript)
        }

    }





    // socket.current.onclose = () => {
    //     handleDisconnectedUser(peers, socketId)
    // }


}


