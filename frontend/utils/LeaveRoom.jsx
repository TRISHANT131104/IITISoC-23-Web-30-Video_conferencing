export const LeaveRoom = (peers,localStream) => {

    for (let socketId in peers.current) {
        const peer = peers.current[socketId]
        peer.destroy()
    }
    peers.current = {}
    localStream.current.getTracks().forEach(t => t.stop())
    localStream.current = null
    window.location.href = '/CreateRoomPage'
}