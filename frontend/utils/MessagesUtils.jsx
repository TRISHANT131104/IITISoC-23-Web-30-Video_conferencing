import { setMessages } from "../store/actions"
import { store } from "../store/store"
export const handleSendMessage = (peers,setmessage,message,event) => {
    if (event.keyCode === 13) {
        event.preventDefault()
        sendMessage(peers,setmessage,message)
    }
}


export const sendMessage = (peers,setmessage,message) => {
    if (message.length > 0) {
        sendMessageUsingDataChannel(peers,message)
        setmessage('')
    }

}

const appendNewMessage = (message) => {
    const messages = store.getState().messages
    store.dispatch(setMessages([...messages, message]))


}


const sendMessageUsingDataChannel = (peers,messageContent) => {
    const identity = store.getState().identity
    const localMessageData = {
        content: messageContent,
        identity: identity,
        messageCreatedByMe: true
    }

    appendNewMessage(localMessageData)

    const messageData = {

        content: messageContent,
        identity: identity,
    }
    const stringifiedMessageData = JSON.stringify({ action: "message", messageData: messageData })
    for (let socketId in peers.current) {
        const peer = peers.current[socketId]
        peer.send(stringifiedMessageData)
    }
}