import React, { useContext, useEffect, useRef, useState } from "react";
import { BsCameraVideoFill, BsFillCameraVideoOffFill, BsChatLeftDots, BsPeople, BsClipboard2Fill, BsClipboard2XFill, BsFillMicFill, BsFillMicMuteFill, BsFillSendFill } from "react-icons/bs";
import Stack from '@mui/material/Stack';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { LuScreenShareOff, LuScreenShare } from 'react-icons/lu'
import { IoExit } from 'react-icons/io5'
import { GrAttachment } from 'react-icons/gr'
import Context from "../context/Context";
import { useRouter } from "next/router";
import VideoGrid from "./VideoGrid";
import LocalScreenSharePreview from "./LocalScreenSharePreview";
import EachMessage from "./EachMessage";
import { connect } from 'react-redux';
import ParticipantsList from "./ParticipantsList";
import DownloadMessage from "./DownloadMessage";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { getLocalPreviewAndInitRoomConnection } from '../utils/GetLocalPreviewAndInitRoomConnection'
import { sendMessage } from "../utils/MessageUtils";
import { sendFile, selectFile } from "../utils/ShareFileUtils";
import { connectionWithSocketServer } from "../utils/connectionWithSocketServer";
import { handleScreenShare } from "../utils/ScreenShareUtils";
import Board from "./Board";
import SpeechToText from "../utils/SpeechToText";
import { AiFillFileText, AiOutlineFileText } from 'react-icons/ai';
import axios from "axios";


function LaptopRoom(props) {
	console.log('props', props.messages)
	const router = useRouter()
	const worker = useRef()
	const roomID = router.query.EachRoom
	const [LeftNavOpen, setLeftNavOpen] = useState(true)
	const { isHost, identity, overlay, setoverlay,title,auth } = useContext(Context)
	const [MicOn, setMicOn] = useState(false)
	const [CamOn, setCamOn] = useState(false)
	const [ScreenShareOn, setScreenShareOn] = useState(false)
	const [BoardOn, setBoardOn] = useState(false)
	let ScreenSharingStream = useRef()
	const [message, setmessage] = useState(null)
	const [File, setFile] = useState(null)
	let peers = useRef({})
	let peersRef = useRef([])
	let localStream = useRef()
	let socket = useRef()
	const Attachmentref = useRef(null);
	const FileNameRef = useRef();
	const [GotFile, setGotFile] = useState(false);
	const FileSentBy = useRef()
	const setProgress = useRef()
	const isDrawing = useRef(false)
	const IceServers = useRef(null)
	const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();
	const Transcript = useRef(transcript)
	if(listening){
		Transcript.current = transcript
	}
	console.log(Transcript.current)

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


	useEffect(() => {
		
		worker.current = new Worker('/worker.js')
		connectionWithSocketServer(socket, peers, ScreenSharingStream, localStream, worker, setGotFile, FileNameRef, FileSentBy, setProgress, isDrawing,Transcript,IceServers)
		getLocalPreviewAndInitRoomConnection(socket, localStream, isHost,auth, roomID, setoverlay,title,IceServers)

		const handleClickOutsideAttachmentBtn = (e) => {
			if (Attachmentref.current && !Attachmentref.current.contains(e.target)) {
				document.getElementById('FileInput').className = "bg-white h-[30px] w-full absolute mx-auto bottom-0 top-[10px] z-[-100] transition-all fade-in-out"
			}
		}
		
		document.addEventListener("click", handleClickOutsideAttachmentBtn, true);
		// return () => {
		// 	worker.current?.terminate()
		// 	LeaveRoom(peers, localStream)
		// }

	}, [])









	const ToggleMic = (MicOn) => {
		localStream.current.getAudioTracks()[0].enabled = MicOn ? false : true
	}











	const ToggleCamera = (CamOn) => {
		localStream.current.getVideoTracks()[0].enabled = CamOn ? false : true
	}



































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
		const MessageBtn = document.getElementById('MessageBtn')
		const ParticipantsBtn = document.getElementById('ParticipantsBtn')
		ParticipantsBtn.className = "flex items-center justify-center border-0 border-red-500 rounded-lg bg-gray-200 bg-opacity-50 font-bold hover:text-orange-600  text-orange-600 transition-all fade-in-out"
		MessageBtn.className = "flex items-center justify-center border-0 border-red-500 rounded-lg bg-gray-200 bg-opacity-0 font-bold hover:text-orange-600  text-gray-800 transition-all fade-in-out"
		handleOpenParticipants()
	}



	const ToggleBoard = () => {
		const BoardSection = document.getElementById('board-section')
		const VideoSection = document.getElementById('video-section')
		const TextEditor = document.getElementById('TextEditor')
		if (BoardOn === false) {
			setBoardOn(true)
			BoardSection.className = "w-full h-full top-[20px] absolute z-[10000] transition-all fade-in-out duration-500"
			VideoSection.className = "w-full h-full absolute left-[2000px] z-[100] transition-all fade-in-out duration-500"
			TextEditor.className = "w-full h-full absolute left-[-2000px] z-[100] transition-all fade-in-out duration-500"


		}
		else {
			setBoardOn(false)
			VideoSection.className = "w-full h-full absolute left-[20px] z-[100] transition-all fade-in-out duration-500"
			BoardSection.className = "w-full h-full top-[-1000px] absolute z-[10000] transition-all fade-in-out duration-500"
			TextEditor.className = "w-full h-full absolute left-[-2000px] z-[100] transition-all fade-in-out duration-500"
		}

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














	const OpenTextEditor = () => {
        const TextEditor = document.getElementById('TextEditor')
        const BoardSection = document.getElementById('board-section')
        const VideoSection = document.getElementById('video-section')
        if (TextEditor.classList.contains('left-[-2000px]')) {
            
            TextEditor.className = "w-full h-full absolute left-[0] z-[100] transition-all fade-in-out duration-500 border-2 border-black"
            VideoSection.className = "w-full h-full absolute left-[2000px] z-[0] transition-all fade-in-out duration-500"
            BoardSection.className = "w-full h-full top-[-1000px] absolute z-[10] transition-all fade-in-out duration-500"
        }
        else {
            TextEditor.className = "w-full h-full absolute left-[-2000px] z-[0] transition-all fade-in-out duration-500"
            VideoSection.className = "w-full h-full absolute left-[20px] z-[100] transition-all fade-in-out duration-500"
			
        }
    }



















	return (
		<div className="w-full h-full bg-white absolute top-0 ">
			<div className="flex w-full h-full py-5">
				{<LocalScreenSharePreview socketId={props.socketId} screenShareStream={ScreenSharingStream.current} />}
				<div
					id="Left_Nav"
					className="  h-full flex flex-col items-center justify-center transition-all fade-in-out w-[100px] border-r-2"
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
					<SpeechToText peers={peers}  transcript={transcript}  browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}  />
					<div id="Left_Nav_Editor_Btn" className="focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20" onClick={() => {
                OpenTextEditor()
            }} >
                <AiFillFileText className="w-7 h-7 " />
            </div>

					<div className="w-[60px] h-[60px] rounded-full bg-orange-600 bottom-0 mt-auto mb-5"></div>
				</div>

				<div className="border-0 border-black flex w-full h-full overflow-x-hidden">
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
								{title}
							</div>
						</div>
						<div id="otherTemplate" className={`p-5 relative mr-10  mb-10`}>

							<div id="board-section" className="w-full h-full top-[-1000px] absolute z-[10000] transition-all fade-in-out duration-500">
								<Board peers={peers} />
							</div>
							<div id='video-section' className="w-full h-full  absolute z-[0] transition-all fade-in-out duration-500">
								<VideoGrid localStream={localStream.current} />
							</div>
							<div>
								<div id='TextEditor' className="w-full h-full absolute z-[10000] left-[-2000px] transition-all fade-in-out duration-500 border-2 border-black"  >{transcript}</div>
							</div>
							
						</div>


						<div className="h-full w-full border-0 pt-2 flex justify-between border-t-2">
							<div className="flex items-center border-0 rounded-lg justify-between ml-2 w-[300px] my-2">
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
									<div onClick={() => {
										handleScreenShare(ScreenShareOn, ScreenSharingStream, setScreenShareOn, peers, props.socketId, localStream)
									}} className="border-0 rounded-lg p-2 w-fit mx-auto group-hover:bg-orange-500 group-hover:bg-opacity-20 transition-all fade-in-out group-hover:text-orange-500" >{ScreenShareOn ? (<LuScreenShareOff className="w-5 h-5" />) : (<LuScreenShare className="w-5 h-5" />)}</div>
									<div className="text-md transition-all fade-in-out text-gray-400 mt-2 group-hover:text-orange-500">{!ScreenShareOn ? "Start Sharing" : "Stop Sharing"}</div>
								</div>


								<div className="group transition-all fade-in-out mx-5">
									<div onClick={() => {
										ToggleBoard()
									}} className="border-0 rounded-lg p-2 w-fit mx-auto group-hover:bg-orange-500 group-hover:bg-opacity-20 transition-all fade-in-out group-hover:text-orange-500" >{BoardOn ? (<BsClipboard2XFill className="w-5 h-5" />) : (<BsClipboard2Fill className="w-5 h-5" />)}</div>
									<div className="text-md transition-all fade-in-out text-gray-400 mt-2 group-hover:text-orange-500">{!BoardOn ? "Open Board" : "Close Board"}</div>
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
							<div id="Chat_Area" className=" h-full border-0 border-black relative flex justify-center overflow-x-hidden ">

								<div id="Messages" className="h-full w-full mx-2">


									{props.messages.map((message, index) => {
										return (
											<div key={index}>
												<EachMessage setProgress={setProgress} worker={worker} setGotFile={setGotFile} message={message} />
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
										<input type="File" id="DataInput" name='DataInput' onChange={(e) => {
											selectFile(setFile, e)
										}} />
									</div>

									<div className="border-r-2 border-gray-300 flex justify-center items-center mx-auto my-auto px-3 py-2 cursor-pointer z-[100] transition-all fade-in-out" ref={Attachmentref} onClick={handleToggleFileInput} >
										<GrAttachment className="w-5 h-5" />
									</div>
									<input value={message} onKeyDown={() => {
										if (event.key === 'Enter') {
											if ((File && File?.length == 1) && (message === '' || message?.length === 0)) sendFile(File, peers, props.identity, setProgress)
											else if (File && File?.length > 1) alert('only a single file can be sent at a time')
											else if (File && File?.length == 0 && message?.length > 0) sendMessage(message, setmessage, peers)
										}
									}} onChange={(e) => {
										setmessage(e.target.value)
									}} placeholder="Write a Message ..." className="w-full text-start items-center px-2 outline-none" />


									<div id="SendMessageBtn" onClick={() => {

										if (File && (message?.length === 0 || !message)) sendFile(File, peers, props.identity, setProgress)
										else if (!File && (message?.length > 0 || message)
										) sendMessage(message, setmessage, peers)
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