export const SendYourSpokenDataToOtherPeers = (transcript,peers) =>{
    alert('called sysdtop')
    for(let socketId in peers.current){
        let peer = peers.current[socketId]
        peer.send(JSON.stringify({SpokenData:true,transcript:transcript}))
    }
}


export const updateTranscript = (transcript,Transcript) =>{
    Transcript.current = Transcript.current + transcript
}