import { store } from "../store/store"

const state = store.getState()
export const SendImageDataToPeers = (base64,peers) =>{
    for(let socketId in peers.current){
        let peer = peers.current[socketId]
        peer.send(JSON.stringify({base64:base64,identity:state.identity,image:true}))
    }
}


export const UpdateBoardCanvas = (base64,isDrawing) =>{
    const image = new Image()
    const canvas = document.querySelector('#paint')
    const ctx = canvas.getContext('2d')
    image.onload = () =>{
        ctx.drawImage(image,0,0)
    }
    image.src = base64
}