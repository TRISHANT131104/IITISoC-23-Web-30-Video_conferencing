import { createNewRoom } from "./createNewRoom.jsx"
import { JoinRoom } from "./JoinRoom.jsx"

const defaultControls = {
    audio: true,
    video: { width: 1080, height: 360 },
}


export const getLocalPreviewAndInitRoomConnection = (socket,localStream,isRoomHost, auth, roomID, setoverlay,title) => {
    navigator.mediaDevices.getUserMedia(defaultControls).then((stream) => {
        console.log('getLocalPreviewAndInitRoomConnection Called')
        localStream.current = stream;
        setoverlay(false)
        isRoomHost ? createNewRoom(socket,auth, roomID, isRoomHost,title) : JoinRoom(socket,auth, roomID, isRoomHost,title)
    }).catch(err => {
        console.log(err)
        alert('error in navigatore.mediaDevices')
    })
}