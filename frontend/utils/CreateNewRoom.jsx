import { setIdentity, setIsRoomHost } from "../store/actions"
import { store } from "../store/store"

export const createNewRoom = (socket,identity, roomID, isRoomHost) => {
    //emit an event to server to create a new room

    const data = {
        identity,
        roomID,
        isRoomHost
    }
    store.dispatch(setIdentity(identity))
    store.dispatch(setIsRoomHost(isRoomHost))
    socket.current.emit('create-new-room', data)
    // ws.send(JSON.stringify({
    //     "type":"create-new-room",
    //     "data":data
    // }))
}