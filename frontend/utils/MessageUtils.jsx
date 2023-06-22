import { setMessages } from "../store/actions"
import { store } from "../store/store"


export const sendMessage = (message,setmessage,peers) => {
    if (message.length > 0) {
        sendMessageUsingDataChannel(message,peers)
        setmessage(null)
    }

}

export const appendNewMessage = (message) => {
    const messages = store.getState().messages
    store.dispatch(setMessages([...messages, message]))


}


const sendMessageUsingDataChannel = (messageContent,peers) => {
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
    const stringifiedMessageData = JSON.stringify({message:true,action: "message", messageData: messageData })
    for (let socketId in peers.current) {
        const peer = peers.current[socketId]
        peer.send(stringifiedMessageData)
    }
}