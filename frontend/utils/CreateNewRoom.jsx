import { store } from "../store/store"
import { setIdentity,setIsRoomHost, setRoomId } from "../store/actions"

export const createNewRoom = (socket,auth, roomID, isRoomHost,title) => {
    const data = {
        username:auth.username,
        roomID,
        isRoomHost,
        title
    }
    store.dispatch(setRoomId(roomID))
    store.dispatch(setIdentity(auth.username))
    store.dispatch(setIsRoomHost(isRoomHost))
    socket.current.send(JSON.stringify({
        "type":"create-new-room",
        "data":data
    }))
}