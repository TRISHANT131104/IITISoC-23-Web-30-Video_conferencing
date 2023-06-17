import { createNewRoom } from "./CreateNewRoom"
import { JoinRoom } from "./JoinRoom"
const getLocalPreviewAndInitRoomConnection = (localstream,socket,isRoomHost, identity, roomID, setoverlay) => {
    console.log(isRoomHost, identity, roomID)
    navigator.mediaDevices.getUserMedia(defaultControls).then((stream) => {
        console.log('getLocalPreviewAndInitRoomConnection Called')
        localStream.current = stream;

        setoverlay(false)
        console.log(isRoomHost)
        isRoomHost ? createNewRoom(socket,identity, roomID, isRoomHost) : JoinRoom(socket,identity, roomID, isRoomHost)
    }).catch(err => {
        console.log(err)
        alert('error in navigatore.mediaDevices')
    })
}