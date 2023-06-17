import { setIdentity, setIsRoomHost } from "../store/actions"
import { store } from "../store/store"
export const JoinRoom = (socket,identity, roomID, isRoomHost) => {
    const data = {
        roomID,
        identity,
        isRoomHost
    }
    store.dispatch(setIdentity(identity))
    store.dispatch(setIsRoomHost(isRoomHost))
    socket.current.emit('join-room', data)
}