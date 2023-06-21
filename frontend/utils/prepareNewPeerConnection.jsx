import Peer from 'simple-peer'
import { handleReceiveData } from './ShareFileUtils'
import { appendNewMessage } from './MessageUtils'
import { UpdateBoardCanvas } from './BoardUtils'
import { updateTranscript } from './SpokenData'
const getConfiguration = () => {
    return {
        iceServers: [
            {
                "urls": "stun:stun.l.google.com:19302"
            },
            {
                "urls": "stun:stun1.l.google.19302"
            }
        ]
    }
}


const handleOnPeerData = (worker,setGotFile,FileNameRef,peerdata,FileSentBy,setProgress,isDrawing,Transcript) => {
    if (peerdata.toString().includes('file')) {
        
        handleReceiveData(worker, setGotFile, FileNameRef, peerdata,FileSentBy,setProgress) 
    }
    else if (peerdata.toString().includes('message')) {
        const data = JSON.parse(peerdata);
        appendNewMessage(data.messageData)
    }
    else if(peerdata.toString().includes('image')){
        const data = JSON.parse(peerdata);
        console.log(data)
        const base64 = data.base64;
        UpdateBoardCanvas(base64,isDrawing)
    }
    else if(peerdata.toString().includes('SpokenData')){
        alert('spoken data')
        const data = JSON.parse(peerdata);
        console.log(data)
        const transcript = data.transcript;
        updateTranscript(transcript,Transcript)
    }
}

const addStream = (stream, connUserSocketId) => {

    const remoteVideo = document.createElement('video')
    remoteVideo.id = `v_${connUserSocketId}`
    const VideoGrid = document.getElementById('VideoGrid')
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true
    remoteVideo.srcObject = stream;
    remoteVideo.muted = true
    remoteVideo.className = "w-full h-full rounded-md cursor-pointer transition-all duration-500 ease-in-out hover:scale-110 hover:shadow-2xl shadow-lg"
    remoteVideo.style.borderRadius = "10px"
    remoteVideo.style.objectFit = "cover"


    const numVideos = localStorage.getItem('participants_length') || 1;
    let columns = 1;
    if (numVideos === 1) columns = 1
    else if (numVideos > 1 && numVideos <= 4) columns = 2;
    else if (numVideos > 4 && numVideos <= 9) columns = 3;
    else if (numVideos > 9 && numVideos <= 16) columns = 4;
    else if (numVideos > 16 && numVideos <= 25) columns = 5;
    VideoGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    VideoGrid.append(remoteVideo)

    remoteVideo.onloadedmetadata = () => {
        remoteVideo.play()
    }
    remoteVideo.addEventListener('click', () => {
        if (remoteVideo.classList.contains("full_screen")) {
            remoteVideo.classList.remove("full_screen")
        }
        else {
            remoteVideo.classList.add("full_screen")
        }
    })
}



const SignalPeerData = (socket,data) => {
    socket.current.send(JSON.stringify({type:'conn-signal', data:data}))
}


export const prepareNewPeerConnection = (socket,peers,connUserSocketId,isInitiator,ScreenSharingStream,localStream,worker,setGotFile,FileNameRef,FileSentBy,setProgress,isDrawing,Transcript) => {
   
    const configuration = getConfiguration()

    const streamToUse = ScreenSharingStream.current ? ScreenSharingStream.current : localStream.current;
    const peer = new Peer({
        initiator: isInitiator,
        config: configuration,
        stream: streamToUse,
    })
    
    peers.current[connUserSocketId] = peer


    peers.current[connUserSocketId].on('signal', (data) => {
       
        //here we have the sdp offer,sdp answer and also the  information about the ice candidates
        const SignalData = {
            signal: data,
            connUserSocketId: connUserSocketId
        }
        SignalPeerData(socket,SignalData)
    })


    peers.current[connUserSocketId].on('stream', (stream) => {
       
        addStream(stream, connUserSocketId);
    })
    peers.current[connUserSocketId].on('data', (peerdata) => {
        
        handleOnPeerData(worker,setGotFile,FileNameRef,peerdata,FileSentBy,setProgress,isDrawing,Transcript)

    });
    peers.current[connUserSocketId].on('error', err => {
        console.error('An error occurred:', err);
    });
}



