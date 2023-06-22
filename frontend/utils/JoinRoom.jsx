import axios from "axios"
import { setIdentity, setRoomId } from "../store/actions"
import { setIsRoomHost } from "../store/actions"
import { store } from "../store/store"
export const JoinRoom = (socket,auth, roomID, isRoomHost) => {
    console.log(auth)
    console.log('hello')
    axios.post('https://www.pradeeps-video-conferencing.store/api/v1/GetRoomDetails/',{roomID:roomID},{
        headers:{
            Authorization:"Bearer " + auth.access.toString()
        }
    }).then((response)=>{
        store.dispatch(setIdentity(auth.username))
        auth.username===response.data.created_by?store.dispatch(setIsRoomHost(true)):store.dispatch(setIsRoomHost(false))
        store.dispatch(setRoomId(response.data.room_id))
    })
    const data = {
        roomID:roomID,
        username:auth.username,
    }
    socket.current.send(JSON.stringify({
        "type":"join-room",
        "data":data
    }))
}