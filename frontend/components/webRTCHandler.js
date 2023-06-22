import * as wss from './wss'
import Peer from 'simple-peer'
import React, { useEffect, useContext } from 'react'
import { store } from '../store/store'
import axios from 'axios'
import Context from '../context/Context'
import { useState } from 'react'
import socket from './wss'
import { setMessages } from '../store/actions'
const state = store.getState()
let screenShare;
export default function VideoGrid({ screenSharingStream }) {
    const { roomID, number } = useContext(Context)
    screenShare = screenSharingStream

    useEffect(() => {



        const localVideo = document.getElementById('my_video')
        localVideo.srcObject = localStream;

        localStream.getAudioTracks()[0].enabled = false;
        localStream.getVideoTracks()[0].enabled = false;


        localVideo.className = "w-full h-full"
        localVideo.style.borderRadius = "10px";
        localVideo.style.objectFit = "cover"
        localVideo.id = "my_video";

        const VideoGrid = document.getElementById('VideoGrid');
        VideoGrid.append(localVideo);
        localVideo.onloadedmetadata = () => {
            localVideo.play();

            console.log('streams length', streams);
        };


        const AllVideos = document.querySelectorAll('video')
        console.log(AllVideos.length)

    }, [])

    console.log(number)

    return (
        <div id="VideoGrid" className={` w-full rounded-md my-auto items-center  grid gap-4`}>
            <video id="my_video"></video>
            <style jsx>
                {`
                #VideoGrid {
                height:100%;
       
    }

                #VideoGrid video {
                width: 100%;
                height: 100%;
                border-radius:10px;
                object-fit: cover;
                border: 1px solid #ccc;
    }
                `}

            </style>
        </div>
    )
}

const defaultControls = {
    audio: true,
    video: { width: 1080, height: 360 },
}

let localStream;
export const getLocalPreviewAndInitRoomConnection = (isRoomHost, identity, roomID, setoverlay) => {
    console.log(isRoomHost, identity, roomID)
    navigator.mediaDevices.getUserMedia(defaultControls).then((stream) => {
        console.log('getLocalPreviewAndInitRoomConnection Called')
        localStream = stream;

        setoverlay(false)
        console.log(isRoomHost)
        isRoomHost ? wss.createNewRoom(identity, roomID, isRoomHost) : wss.JoinRoom(identity, roomID, isRoomHost)
    }).catch(err => {
        console.log(err)
        alert('error in navigatore.mediaDevices')
    })
}




let peers = {};
let streams = [];

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
const messengerChannel = "messenger"
export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
    const configuration = getConfiguration()

    peers[connUserSocketId] = new Peer({
        initiator: isInitiator,
        config: configuration,
        stream: localStream,
        channelName: messengerChannel
    })


    peers[connUserSocketId].on('signal', (data) => {
        //here we have the sdp offer,sdp answer and also the  information about the ice candidates
        const SignalData = {
            signal: data,
            connUserSocketId: connUserSocketId
        }
        wss.SignalPeerData(SignalData)
    })


    peers[connUserSocketId].on('stream', (stream) => {
        if (isInitiator && screenShare) {
            addStream(screenShare, connUserSocketId); // Answer with screen sharing stream
            streams = streams.concat(screenShare);
        } else {
            addStream(stream, connUserSocketId);
            streams = streams.concat(stream);
        }
    })

    peers[connUserSocketId].on('data', (peerdata) => {
        const data = JSON.parse(peerdata)
        if(data.action==="message"){
            const messageData = data.messageData
            appendNewMessage(messageData)
        }
        
    })

}

export const handleSignallingData = (data) => {
    peers[data.connUserSocketId].signal(data.signal)
}



const addStream = (stream, connUserSocketId) => {
    //display incoming stream

    socket.on('user-length', (data) => {
        alert(data)
        length = length
    })
    const remoteVideo = document.createElement('video')
    remoteVideo.id = `v_${connUserSocketId}`
    const VideoGrid = document.getElementById('VideoGrid')
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true
    const div = document.createElement('div')
    remoteVideo.srcObject = stream;
    remoteVideo.muted = true
    remoteVideo.className = "w-full h-full"
    remoteVideo.style.borderRadius = "10px"
    remoteVideo.style.objectFit = "cover"
    remoteVideo.classList.add("rounded-md")
    const numVideos = localStorage.getItem('participants_length') || 1;
    let columns = 1;
    if (numVideos === 1) columns = 1
    else if (numVideos > 1 && numVideos <= 4) columns = 2;
    else if (numVideos > 4 && numVideos <= 9) columns = 3;
    else if (numVideos > 9 && numVideos <= 16) columns = 4;
    else if (numVideos > 16 && numVideos <= 25) columns = 5;
    VideoGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    // Decrease width by half for local video

    VideoGrid.append(remoteVideo)
    length = length + 1

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

export const handleDisconnectedUser = (socketId) => {
    const VideoGrid = document.getElementById('VideoGrid')


    const remotevideo = document.getElementById(`v_${socketId}`)
    if (remotevideo) {
        const tracks = remotevideo.srcObject.getTracks()
        tracks.forEach(t => t.stop())

        remotevideo.srcObject = null
        remotevideo.muted = true
        VideoGrid.removeChild(remotevideo)
    }
    if (peers[socketId]) {
        peers[socketId].destroy();
    }
    delete peers[socketId]
    const numVideos = localStorage.getItem('participants_length') - 1 || 1;

    let columns = 1;
    if (numVideos === 1) columns = 1
    else if (numVideos > 1 && numVideos <= 4) columns = 2;
    else if (numVideos > 4 && numVideos <= 9) columns = 3;
    else if (numVideos > 9 && numVideos <= 16) columns = 4;
    else if (numVideos > 16 && numVideos <= 25) columns = 5;
    VideoGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}


//////////////////////// buttons Logic /////////////////////////

export const ToggleMic = (MicOn) => {
    localStream.getAudioTracks()[0].enabled = MicOn ? false : true
}

export const ToggleCamera = (CamOn) => {
    localStream.getVideoTracks()[0].enabled = CamOn ? false : true
}

export const ToggleScreenShare = (
    isScreenSharingActive,
    screenSharingStream = null
) => {
    for (let socketId in peers) {
        const peer = peers[socketId];
        const sender = peer.getSenders().find((s) => s.track.kind === 'video');

        if (isScreenSharingActive) {
            if (screenSharingStream) {
                const screenSharingVideoTrack = screenSharingStream.getVideoTracks()[0];
                if (sender && screenSharingVideoTrack) {
                    sender.replaceTrack(screenSharingVideoTrack);
                }
            }
        } else {
            const localVideoTrack = localStream.getVideoTracks()[0];
            if (sender && localVideoTrack) {
                sender.replaceTrack(localVideoTrack);
            }
        }
    }
};

export const LeaveRoom = () => {

    for (let socketId in peers) {
        const peer = peers[socketId]
        peer.destroy()
    }
    peers = {}
    localStream.getTracks().forEach(t => t.stop())
    localStream = null
    window.location.href = '/CreateRoomPage'
}


//////////////// Messages ///////////////////

const appendNewMessage = (message) => {
    const messages = store.getState().messages
    store.dispatch(setMessages([...messages, message]))

}


export const sendMessageUsingDataChannel = (messageContent) => {
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
    const stringifiedMessageData = JSON.stringify({action:"message",messageData:messageData})
    for (let socketId in peers) {
        const peer = peers[socketId]
        peer.send(stringifiedMessageData)
    }
}


///////////////////////// file transfer ////////////////////////
function handleReceiveData(data){

}

function download(){

}

function selectFile(e){

}

function sendFile(){

}