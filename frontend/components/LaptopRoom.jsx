import React, { useContext, useEffect, useRef, useState, useLayoutEffect } from "react";
import { io } from 'socket.io-client';
import Peer from 'simple-peer'
import {
	BsCameraVideoFill,
	BsCameraVideo,
	BsFullscreen,
	BsChatLeftDotsFill,
	BsFillCameraVideoOffFill,
	BsChatLeftDots,
	BsPeopleFill,
	BsPeople,
	BsClipboard2Fill,
	BsClipboard2XFill,
	BsFillMicFill,
	BsFillMicMuteFill,
	BsFillSendFill
} from "react-icons/bs";
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { GiSpeaker, GiVideoCamera } from "react-icons/gi";
import { LuScreenShareOff, LuScreenShare } from 'react-icons/lu'
import { ImPhoneHangUp } from 'react-icons/im'
import { IoExit } from 'react-icons/io5'
import { GrAttachment } from 'react-icons/gr'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { v4 as uuidv4 } from 'uuid';
import $ from 'jquery'
// import { w3cwebsocket.current as W3CWebSocket } from "websocket.current";
import Context from "../context/Context";
import { useRouter } from "next/router";
import VideoGrid from "./VideoGrid";
import LocalScreenSharePreview from "./LocalScreenSharePreview";
import { store } from "../store/store";
import EachMessage from "./EachMessage";
import { connect } from 'react-redux';
import ParticipantsList from "./ParticipantsList";
import { setIdentity, setIsRoomHost, setMessages, setParticipants, setRoomId, setSocketId } from "../store/actions";
import streamSaver from 'streamsaver'
const worker = new Worker("/worker.js")
function LaptopRoom(props) {
	console.log('props', props.messages)
	const router = useRouter()

	const roomID = router.query.EachRoom
	const [LeftNavOpen, setLeftNavOpen] = useState(true)
	const { auth, isHost, identity, overlay, setoverlay } = useContext(Context)
	const [isLoaded, setIsLoaded] = useState(false);
	const [isPageLoaded, setIsPageLoaded] = useState(false); //this helps
	const [MicOn, setMicOn] = useState(false)
	const [CamOn, setCamOn] = useState(false)
	const [ScreenShareOn, setScreenShareOn] = useState(false)
	let ScreenSharingStream = useRef()
	const [message, setmessage] = useState(null)
	const [File, setFile] = useState(null)
	let peers = useRef([])
	let peersRef = useRef([])
	let localStream = useRef()
	let socket = useRef()
	const Attachmentref = useRef(null);
	const handleSendMessage = (event) => {
		if (event.keyCode === 13) {
			event.preventDefault()
			sendMessage()
		}
	}


	const sendMessage = () => {
		if (message.length > 0) {
			sendMessageUsingDataChannel(message)
			setmessage('')
		}

	}

	const appendNewMessage = (message) => {
		const messages = store.getState().messages
		store.dispatch(setMessages([...messages, message]))


	}


	const sendMessageUsingDataChannel = (messageContent) => {
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
	const ScreenShareConstraints = {
		video: true,
		audio: false
	}
	const handleToggleLeftNav = () => {
		if (document.getElementById('Left_Nav').style.display === "none") {
			document.getElementById('Left_Nav').style.display = "flex"
			setLeftNavOpen(true)
		}
		else {
			document.getElementById('Left_Nav').style.display = "none"
			setLeftNavOpen(false)
		}
	}
	const state = store.getState()
	console.log(state)
	const handleScreenShare = async () => {
		const my_video = document.getElementById('my_video')
		if (ScreenShareOn === false) {
			try {

				const stream = await navigator.mediaDevices.getDisplayMedia(ScreenShareConstraints);
				ScreenSharingStream.current = stream
				ToggleScreenShare(true, stream, state.socketId); // Activate screen sharing for all peers.current
				setScreenShareOn(true);
				my_video.style.display = "none"
			} catch (err) {
				console.log(err)
				alert('Screen Share Error');
			}

		} else {
			setScreenShareOn(false);
			my_video.style.display = "block"
			ScreenSharingStream.current = null

			const VideoGrid = document.getElementById('VideoGrid')
			const ScreenShareDiv = document.getElementById(`ss_${props.socketId}`)
			if (ScreenShareDiv) {
				VideoGrid.removeChild(ScreenShareDiv)
			}
			ToggleScreenShare(false); // Deactivate screen sharing for all peers.current
			if (ScreenSharingStream.current) {
				ScreenSharingStream.current.getTracks().forEach((track) => track.stop());
			}


		}
	};


	console.log('peersRef',peersRef.current)
	console.log(peers)
	useEffect(() => {

		const connectionWithSocketServer = () => {
			socket.current = io('http://localhost:4000')

			// ws.onopen = () =>{
			//     alert('websocket.current connected')
			// }
			socket.current.on('connect', () => {
				console.log('socket.current connected in the client side with the socket.current id : ', socket.current.id)
				store.dispatch(setSocketId(socket.current.id))
			})
			// ws.onmessage = (message) =>{
			//     console.log('message',message)
			//     const data = JSON.parse(message.data)
			//     const type = data['type']
			//     if(type=="room-id"){
			//         console.log(data)
			//         const {roomID} = data
			//         store.dispatch(setRoomId(roomID))
			//     }
			//     else if(type==='room-update'){
			//         console.log('room update data',data)
			//     const {connectedUsers} = data

			//         store.dispatch(setParticipants(data.connectedUsers))
			//     }
			// }
			socket.current.on('room-id', (data) => {
				console.log(data)
				const { roomID } = data

				store.dispatch(setRoomId(roomID))

			})

			socket.current.on('room-update', (data) => {
				const { connectedUsers } = data;
				console.log('room-update', connectedUsers)
				localStorage.setItem('participants_length', connectedUsers.length)

				store.dispatch(setParticipants(connectedUsers))
			})

			socket.current.on('conn-prepare', (data) => {

				const { connUserSocketId } = data

				const peer = prepareNewPeerConnection(connUserSocketId, false)
				console.log('peer who just joiend the room',peer)
				//inform the user who has just joined saying that be prepared for incomming connection
				socket.current.emit('conn-init', { connUserSocketId: connUserSocketId,peersRef:peersRef })
			})
			socket.current.on('conn-signal', (data) => {
				const { signal, connUserSocketId } = data

				handleSignallingData(data)
			})
		
			socket.current.on('conn-init', (data) => {
				const { connUserSocketId,peersRefFromNewUser } = data
				console.log('user socket.current id in conn-init : ', connUserSocketId)
				const peer2 = prepareNewPeerConnection(connUserSocketId, true)
				const newUser = {
					socketId:socket.current.id,
					peer:peer2,
				}
				peersRefFromNewUser.current.push(peer2)
				
				
				
			})
			socket.current.on('user-disconnected', ({ socketId }) => {
				console.log('user-disconnected', socketId)
				handleDisconnectedUser(socketId)
			})
			socket.current.on('update-peers',(data)=>{
				const {socketId,peer} = data
				const options = {
					initiator: peer.initiator,
					config: peer.config,
					stream:peer.stream
				  };
				  
				const newPeer = {
					socketId:socketId,
					peer:new Peer(options)
				}
				if(!(peersRef.current.find(x=>x.socketId===socketId))){
					peersRef.current.push(newPeer)
				}
				
				
			})
		}
		connectionWithSocketServer()
		
		const createNewRoom = (identity, roomID, isRoomHost) => {
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

		const JoinRoom = (identity, roomID, isRoomHost) => {

			//event to the server an event saying that u would like to join a room
			const data = {
				roomID,
				identity,
				isRoomHost
			}
			store.dispatch(setIdentity(identity))
			store.dispatch(setIsRoomHost(isRoomHost))
			socket.current.emit('join-room', data)
			// ws.send(JSON.stringify({
			//     "type":"join-room",
			//     "data":data
			// }))
		}

		const SignalPeerData = (data) => {
			socket.current.emit('conn-signal', data)
		}
		const defaultControls = {
			audio: true,
			video: { width: 1080, height: 360 },
		}


		const getLocalPreviewAndInitRoomConnection = (isRoomHost, identity, roomID, setoverlay) => {
			console.log(isRoomHost, identity, roomID)
			navigator.mediaDevices.getUserMedia(defaultControls).then((stream) => {
				console.log('getLocalPreviewAndInitRoomConnection Called')
				localStream.current = stream;

				setoverlay(false)
				console.log(isRoomHost)
				isRoomHost ? createNewRoom(identity, roomID, isRoomHost) : JoinRoom(identity, roomID, isRoomHost)
			}).catch(err => {
				console.log(err)
				alert('error in navigatore.mediaDevices')
			})
		}







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
		const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
			const configuration = getConfiguration()
			
			const streamToUse = ScreenSharingStream.current ? ScreenSharingStream.current : localStream.current;
			const peer = new Peer({
				initiator: isInitiator,
				config: configuration,
				stream: streamToUse
			})
			const newPeer = {
				socketId:connUserSocketId,
				peer:peer
			}
			if(!(peersRef.current.find(x=>x.socketId===connUserSocketId))){
				peersRef.current.push(newPeer)
			}
			
			
			
			peers.current[connUserSocketId] = peer
			
			
			peers.current[connUserSocketId].on('signal', (data) => {
				//here we have the sdp offer,sdp answer and also the  information about the ice candidates
				const SignalData = {
					signal: data,
					connUserSocketId: connUserSocketId
				}
				SignalPeerData(SignalData)
			})


			peers.current[connUserSocketId].on('stream', (stream) => {
				addStream(stream, connUserSocketId);


			})
			peers.current[connUserSocketId].on('data', peerdata => {
				console.log('Received data from peer:', peerdata);
				handleReceiveData(peerdata);
				// Add your logic to handle the received data from peers
			});
			// peers.current[connUserSocketId].on('data', (peerdata) => {
			// 	if(peerdata.toString().includes('filename')){
			// 	handleReceiveData(peerdata)
			// 	}
			// 		else{
			// 			const data = JSON.parse(peerdata)
			// 			const messageData = data.messageData
			// 			appendNewMessage(messageData)
			// 		}
			// })
			peers.current[connUserSocketId].on('error', err => {
				// Handle the error
				console.error('An error occurred:', err);
			});
			return peer
			
		}

		const handleSignallingData = (data) => {
			peers.current[data.connUserSocketId].signal(data.signal)
		}



		const addStream = (stream, connUserSocketId) => {
			//display incoming stream

			socket.current.on('user-length', (data) => {
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

		const handleDisconnectedUser = (socketId) => {
			const VideoGrid = document.getElementById('VideoGrid')


			const remotevideo = document.getElementById(`v_${socketId}`)
			if (remotevideo) {
				const tracks = remotevideo.srcObject.getTracks()
				tracks.forEach(t => t.stop())

				remotevideo.srcObject = null
				remotevideo.muted = true
				VideoGrid.removeChild(remotevideo)
			}
			if (peers.current[socketId]) {
				peers.current[socketId].destroy();
			}
			delete peers.current[socketId]
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



		const LeaveRoom = () => {

			for (let socketId in peers.current) {
				const peer = peers.current[socketId]
				peer.destroy()
			}
			peers.current = {}
			localStream.current.getTracks().forEach(t => t.stop())
			localStream.current = null
			window.location.href = '/CreateRoomPage'
		}


		//////////////// Messages ///////////////////







		getLocalPreviewAndInitRoomConnection(isHost, identity, roomID, setoverlay)

		const handleClickOutsideAttachmentBtn = (e) => {
			if (Attachmentref.current && !Attachmentref.current.contains(e.target)) {
				document.getElementById('FileInput').className = "bg-white h-[30px] w-full absolute mx-auto bottom-0 top-[10px] z-[-100] transition-all fade-in-out"
			}
		}
		document.addEventListener("click", handleClickOutsideAttachmentBtn, true);
	}, [roomID])


	const FileNameRef = useRef();
	const [GotFile, setGotFile] = useState(false);
	const [workerResponse, setWorkerResponse] = useState(null); // New state to store worker response

	///////////////////////// file transfer ////////////////////////

	function handleReceiveData(data) {
		console.log('Received data:', data);
		if (data.toString().includes('done')) {
			setGotFile(true);
			const parsed = JSON.parse(data);
			FileNameRef.current = parsed.filename;
			console.log('File transfer complete. Got file:', FileNameRef.current);
		} else {
			worker.postMessage(data);
			console.log('Sent data to worker:', data);
		}
	}

	function download() {
		setGotFile(false);
		worker.postMessage("download");
		worker.addEventListener("message", event => {
			const stream = event.data.stream();
			const fileStream = streamSaver.createWriteStream(FileNameRef.current);
			stream.pipeTo(fileStream);
		})
	}

	function selectFile(e) {
		setFile(e.target.files[0]);
	}

	function sendFile() {
		const localpeers = peersRef.current;
		console.log('localpeers',localpeers)
		const stream = File.stream();
		const reader = stream.getReader();

		reader.read().then(({done,value}) => {
			console.log('done',done)
			handlereading(done,value);
		});

		function handlereading(done, value) {
			if (done) {
				localpeers.forEach(peer => {
					peer.peer.write(JSON.stringify({ done: true, fileName: File.name }));
				});
				return;
			}

			localpeers.forEach(peer => {
				peer.peer.write(value);
			});

			reader.read().then(({done,value}) => {
				handlereading(done,value);
			});
		}
	}


	// Debugging information
	useEffect(() => {
		console.log("GotFile:", GotFile);
		console.log("FileNameRef:", FileNameRef.current);
		console.log("workerResponse:", workerResponse);
	}, [GotFile, workerResponse]);







	const ToggleMic = (MicOn) => {
		localStream.current.getAudioTracks()[0].enabled = MicOn ? false : true
	}











	const ToggleCamera = (CamOn) => {
		localStream.current.getVideoTracks()[0].enabled = CamOn ? false : true
	}











	const ToggleScreenShare = (
		isScreenSharingActive,
		screenSharingStream = null
	) => {
		for (let socketId in peers.current) {
			const peer = peers.current[socketId];
			const videoTracks = peer.streams[0].getVideoTracks();

			if (isScreenSharingActive) {

				// Switch to screen sharing stream
				if (screenSharingStream) {
					const screenSharingVideoTrack = screenSharingStream.getVideoTracks()[0];
					if (videoTracks.length > 0 && screenSharingVideoTrack && peer) {
						switchVideoTracks(peer, videoTracks[0], screenSharingVideoTrack);
					}
				}
			} else {
				// Switch back to local stream
				const localVideoTrack = localStream.current.getVideoTracks()[0];
				if (videoTracks.length > 0 && localVideoTrack && peer) {
					switchVideoTracks(peer, videoTracks[0], localVideoTrack);
				}
			}
		}
	};

	const switchVideoTracks = (peer, currentTrack, newTrack) => {
		if (peer && currentTrack && newTrack) {
			peer.replaceTrack(currentTrack, newTrack, peer.streams[0]);
		}
	};





















	const handleToggleChatParticipantsArea = (mode) => {
		const ChatParticipantsBox = document.getElementById('ChatParticipantsBox')
		let Left_Nav_Message_Btn = document.getElementById('Left_Nav_Message_Btn')
		let Left_Nav_Participants_Btn = document.getElementById('Left_Nav_Participants_Btn')
		let Left_Nav_Video_Btn = document.getElementById('Left_Nav_Video_Btn')

		if (mode === "Chat") {
			if (ChatParticipantsBox.classList.contains('hidden')) {
				ChatParticipantsBox.classList.remove('hidden')
			}
			Left_Nav_Video_Btn.className = "focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20"
			Left_Nav_Message_Btn.className = "focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20"
			Left_Nav_Participants_Btn.className = "focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20"
			handleToggleMessageBtn()
		}
		else if (mode === "Participants") {
			if (ChatParticipantsBox.classList.contains('hidden')) {
				ChatParticipantsBox.classList.remove('hidden')
			}
			Left_Nav_Video_Btn.className = "focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20"
			Left_Nav_Message_Btn.className = "focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20"
			Left_Nav_Participants_Btn.className = "focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20"
			handleToggleParticipantsBtn()
		}
		else if (mode === "Video") {
			Left_Nav_Video_Btn.className = "focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20"
			Left_Nav_Message_Btn.className = "focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20"
			Left_Nav_Participants_Btn.className = "focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20"
			handleToggleLeftNav()
			ChatParticipantsBox.classList.add('hidden')

		}

	}














	const handleOpenMessage = () => {
		const ParticipantsBox = document.getElementById('Participants')
		const MessageBox = document.getElementById('Messages')
		MessageBox.className = "absolute h-full border-0 border-red-500 w-full right-0 transition-all fade-in-out"
		ParticipantsBox.className = "absolute h-full border-0 border-blue-500 w-full right-[400px] transition-all fade-in-out"

	}











	const handleOpenParticipants = () => {
		const ParticipantsBox = document.getElementById('Participants')
		const MessageBox = document.getElementById('Messages')
		MessageBox.className = "absolute h-full border-0 border-red-500 w-full right-[400px] transition-all fade-in-out"
		ParticipantsBox.className = "absolute h-full border-0 border-blue-500 w-full right-0 transition-all fade-in-out"
	}












	const handleToggleMessageBtn = () => {
		const MessageBtn = document.getElementById('MessageBtn')
		const ParticipantsBtn = document.getElementById('ParticipantsBtn')
		MessageBtn.className = "flex items-center justify-center border-0 border-red-500 rounded-lg bg-gray-200 bg-opacity-50 font-bold hover:text-orange-600  text-orange-600 transition-all fade-in-out"
		ParticipantsBtn.className = "flex items-center justify-center border-0 border-red-500 rounded-lg bg-gray-200 bg-opacity-0 font-bold hover:text-orange-600  text-gray-800 transition-all fade-in-out"
		handleOpenMessage()
	}










	const handleToggleParticipantsBtn = () => {
		const ParticipantsBtn = document.getElementById('ParticipantsBtn')
		ParticipantsBtn.className = "flex items-center justify-center border-0 border-red-500 rounded-lg bg-gray-200 bg-opacity-50 font-bold hover:text-orange-600  text-orange-600 transition-all fade-in-out"
		MessageBtn.className = "flex items-center justify-center border-0 border-red-500 rounded-lg bg-gray-200 bg-opacity-0 font-bold hover:text-orange-600  text-gray-800 transition-all fade-in-out"
		handleOpenParticipants()
	}








	if (overlay) {
		return <h1 className="py-20 text-center font-bold text-5xl">Loading...</h1>
	}










	const handleToggleFileInput = () => {
		if (document.getElementById('FileInput').classList.contains('top-[10px]')) {
			document.getElementById('FileInput').className = "bg-white h-[30px] w-full absolute mx-auto bottom-0 top-[-40px]  transition-all fade-in-out"
		}
		else {
			document.getElementById('FileInput').className = "bg-white h-[30px] w-full absolute mx-auto bottom-0 top-[10px] z-[-100] transition-all fade-in-out"
		}
	}

	return (
		<div className="w-full h-full bg-white absolute top-0 ">
			<div className="flex w-full h-full py-5">
				{<LocalScreenSharePreview socketId={state.socketId} screenShareStream={ScreenSharingStream.current} />}
				<div
					id="Left_Nav"
					className="  h-full flex flex-col items-center justify-center transition-all fade-in-out w-[100px] border-r-2 "
				>
					<div onClick={() => {
						handleToggleChatParticipantsArea('Video')
					}} id="Left_Nav_Video_Btn" className="focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20" >
						<BsCameraVideoFill className="w-7 h-7 " />
					</div>
					<div id="Left_Nav_Message_Btn" className="focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20" onClick={() => {
						handleToggleChatParticipantsArea('Chat')
					}} >
						<BsChatLeftDots className="w-7 h-7 " />
					</div>
					<div id="Left_Nav_Participants_Btn" className="focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20" onClick={() => {
						handleToggleChatParticipantsArea('Participants')
					}} >
						<BsPeople className="w-7 h-7 " />
					</div>
					<div className="w-[60px] h-[60px] rounded-full bg-orange-600 bottom-0 mt-auto mb-5"></div>
				</div>

				<div className="border-0 border-black flex w-full h-full">
					<div
						id="Video_Element"
						className="w-full border-0 border-red-500 mx-auto grid grid-rows-[60px_auto_100px] px-5"
					>
						<div className=" w-full border-b-2 flex pb-3">
							<div
								onClick={handleToggleLeftNav}
								className="my-auto p-2 border-0 w-fit ml-5 bg-gray-300 bg-opacity-30 hover:bg-gray-400 hover:bg-opacity-20 transition-all fade-in-out cursor-pointer rounded-md"

							>
								{LeftNavOpen ? (
									<AiOutlineRight className="w-6 h-6 mx-auto my-auto text-gray-500 " />
								) : (
									<AiOutlineLeft className="w-6 h-6 mx-auto my-auto text-gray-500 " />
								)}
							</div>
							<div className=" text-center font-bold items-center flex text-xl ml-4">
								Heading of The Meeting Or Title
							</div>
						</div>
						<div id="otherTemplate" className="p-5">

							<VideoGrid localStream={localStream.current} />
						</div>


						<div className="h-full w-full border-0  flex justify-between border-t-2">
							<div className="flex items-center border-0 rounded-lg justify-between ml-2 w-[300px]  my-2">
								<div className="w-full ">

									<Stack
										spacing={2}
										direction="row"
										padding={'20px'}
										alignItems="center"
										color={"orange"}
									>
										<VolumeDown />
										{/* <div className="invert w-full">
											<Slider

												aria-label="Volume"
												value={VolumeValue}
												onChange={handleChangeVolume}
											/>
										</div> */}
										<VolumeUp />
									</Stack>

								</div>
							</div>
							<div className="grid grid-cols-4 text-center items-center ">


								<div className="group transition-all fade-in-out mx-5">
									<div onClick={() => {
										ToggleMic(MicOn)
										if (MicOn) {

											setMicOn(false)
										}
										else {
											setMicOn(true)
										}

									}} id="ToggleMicBtn" className="border-0 rounded-lg p-2 w-fit mx-auto group-hover:bg-orange-500 group-hover:bg-opacity-20 transition-all fade-in-out group-hover:text-orange-500" >{!MicOn ? (<BsFillMicMuteFill className="w-5 h-5" />) : (<BsFillMicFill className="w-5 h-5" />)}</div>
									<div className="text-md transition-all fade-in-out text-gray-400 mt-2 group-hover:text-orange-500">{MicOn ? "Mic On" : "Mic Off"}</div>
								</div>


								<div className="group transition-all fade-in-out mx-5">
									<div onClick={() => {
										ToggleCamera(CamOn)
										if (CamOn) {
											setCamOn(false)
										}
										else {
											setCamOn(true)
										}

									}} id="ToggleVideoBtn" className="border-0 rounded-lg p-2 w-fit mx-auto group-hover:bg-orange-500 group-hover:bg-opacity-20 transition-all fade-in-out group-hover:text-orange-500" >{!CamOn ? (<BsFillCameraVideoOffFill className="w-5 h-5" />) : (<BsCameraVideoFill className="w-5 h-5" />)}</div>
									<div className="text-md transition-all fade-in-out text-gray-400 mt-2 group-hover:text-orange-500">{CamOn ? "Cam On" : "Cam Off"}</div>
								</div>

								<div className="group transition-all fade-in-out mx-5">
									<div onClick={handleScreenShare} className="border-0 rounded-lg p-2 w-fit mx-auto group-hover:bg-orange-500 group-hover:bg-opacity-20 transition-all fade-in-out group-hover:text-orange-500" >{ScreenShareOn ? (<LuScreenShareOff className="w-5 h-5" />) : (<LuScreenShare className="w-5 h-5" />)}</div>
									<div className="text-md transition-all fade-in-out text-gray-400 mt-2 group-hover:text-orange-500">{!ScreenShareOn ? "Start Sharing" : "Stop Sharing"}</div>
								</div>


								<div className="group transition-all fade-in-out mx-5">
									<div className="border-0 rounded-lg p-2 w-fit mx-auto group-hover:bg-orange-500 group-hover:bg-opacity-20 transition-all fade-in-out group-hover:text-orange-500" >{true ? (<BsClipboard2XFill className="w-5 h-5" />) : (<BsClipboard2Fill className="w-5 h-5" />)}</div>
									<div className="text-md transition-all fade-in-out text-gray-400 mt-2 group-hover:text-orange-500">{true ? "Open Board" : "Close Board"}</div>
								</div>


							</div>
							<div className="flex justify-center items-center">
								<div className="group transition-all fade-in-out mx-5">
									<div className="border-0 rounded-lg text-white p-2 w-fit mx-auto bg-red-500 hover:bg-red-600 transition-all fade-in-out "><IoExit className="w-5 h-5" /></div>
									<div className="text-md transition-all fade-in-out  mt-2 text-red-500 hover:text-red-600 ">Leave Call</div>
								</div>
							</div>


						</div>
					</div>
					<div
						id="ChatParticipantsBox"
						className="h-full border-0   p-5 w-[550px] hidden border-l-2 rounded-lg"
					>
						<div className="bg-gray-200 w-full h-full  grid grid-rows-[80px_auto_80px] rounded-lg">
							<div className="w-full h-full border-0 rounded-t-xl border-black  p-3">
								<div className="border-0 border-red-500 rounded-lg bg-gray-100 w-full h-full grid grid-cols-2 text-center p-2">
									<div onClick={handleToggleMessageBtn} id="MessageBtn" className="" >Messages</div>
									<div onClick={handleToggleParticipantsBtn} id="ParticipantsBtn"  >Participants({props.participants.length})</div>
								</div>
							</div>
							<div id="Chat_Area" className=" h-full border-0 border-black relative flex justify-center overflow-x-hidden r">

								<div id="Messages" className="h-full w-full">
									{GotFile && (
										<div onClick={download}>Download</div>
									)}

									{props.messages.map((message, index) => {
										return (
											<div key={index}>
												<EachMessage user={message.identity} message={message.content} byMe={message.messageCreatedByMe} />
											</div>
										)
									})}


								</div>
								<div id="Participants" className="p-3 w-full h-full">
									<ParticipantsList isRoomHost={props.isRoomHost} participants={props.participants} />
								</div>
							</div>

							<div onClick={(event) => {

								handleToggleMessageBtn()
							}} id="SendMessage" className="w-full  border-0 border-black p-3 ">

								<div className="bg-white rounded-lg w-full  flex relative justify-center ">



									<div ref={Attachmentref} id="FileInput" className="bg-white border-2 border-red-500 h-[30px] w-full absolute  mx-auto bottom-0 top-[10px] z-[-100]">
										<input type="file" id="DataInput" name='DataInput' onChange={selectFile} />
									</div>

									<div className="border-r-2 border-gray-300 flex justify-center items-center mx-auto my-auto px-3 py-2 cursor-pointer z-[100] transition-all fade-in-out" ref={Attachmentref} onClick={handleToggleFileInput} >
										<GrAttachment className="w-5 h-5" />
									</div>
									<input value={message} onKeyDown={handleSendMessage} onChange={(e) => {
										setmessage(e.target.value)
									}} placeholder="Write a Message ..." className="w-full text-start items-center px-2 outline-none" />


									<div id="SendMessageBtn" onClick={() => {
										sendFile()
									}} className="border-l-2 flex my-auto mx-auto justify-center items-center  border-gray-300 py-2 px-2">
										<BsFillSendFill className="w-10 h-10 bg-yellow-500 p-3 text-white rounded-lg hover:bg-yellow-600/80 transition-all fade-in-out" />
									</div>
								</div>
							</div>
						</div>

					</div>



				</div>
			</div>
		</div>
	);
}


function mapStateToProps(state) {
	return {
		...state
	};
}

export default connect(mapStateToProps)(LaptopRoom);