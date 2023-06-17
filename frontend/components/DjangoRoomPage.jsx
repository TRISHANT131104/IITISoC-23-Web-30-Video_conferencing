import React, { useContext, useEffect, useRef, useState, useLayoutEffect } from "react";
import { io } from 'socket.io-client';
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
// import { w3cwebsocket as W3CWebSocket } from "websocket";
import Context from "../context/Context";
import { useRouter } from "next/router";
import * as webRTCHandler from './webRTCHandler'
export default function DjangoRoomPage() {
	const {auth,isHost,identity,overlay,setoverlay,roomID} = useContext(Context)

	useEffect(()=>{
		console.log(roomID)
		webRTCHandler.getLocalPreviewAndInitRoomConnection(isHost,identity,roomID,setoverlay)

	},[])

	if(overlay){
		return <h1 className="py-20 text-center font-bold text-5xl">Loading...</h1>
	}
	return (
		<div className="w-full h-full bg-white absolute top-0 ">
			<div className="flex w-full h-full">
				<div
					id="Left_Nav"
					className="border-0 border-black h-full flex flex-col items-center justify-center transition-all fade-in-out w-[100px]"
				>
					<div className="focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg bg-orange-500 transition-all text-orange-600 bg-opacity-20">
						<BsCameraVideoFill className="w-7 h-7 " />
					</div>
					<div className="focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 hover:bg-opacity-20">
						<BsChatLeftDots className="w-7 h-7 " />
					</div>
					<div className="focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg hover:bg-orange-500 transition-all text-orange-600 hover:bg-opacity-20">
						<BsPeople className="w-7 h-7 " />
					</div>
					<div className="w-[60px] h-[60px] rounded-full bg-orange-600 bottom-0 mt-auto mb-5"></div>
				</div>
				<div className="border-0 border-black grid grid-cols-[auto_400px] w-full h-full">
					<div
						id="Video_Element"
						className="w-full border-0 border-red-500 grid grid-rows-[60px_auto_100px]"
					>
						<div className="h-[60px] w-full  flex">
							<div
								className="my-auto p-2 border-0 w-fit ml-5 bg-gray-300 bg-opacity-30 hover:bg-gray-400 hover:bg-opacity-20 transition-all fade-in-out cursor-pointer rounded-md"

							>
								{/* {LeftNavOpen ? (
									<AiOutlineRight className="w-6 h-6 mx-auto my-auto text-gray-500 " />
								) : (
									<AiOutlineLeft className="w-6 h-6 mx-auto my-auto text-gray-500 " />
								)} */}
							</div>
							<div className=" text-center font-bold items-center flex text-xl ml-4">
								Heading of The Meeting Or Title
							</div>
						</div>
						<div id="otherTemplate">
							<h2></h2>
							<div id="VideoGrid" className={` w-full border-0 p-5 border-blue-500 z-[1000] h-full grid gap-4`}>
								
							</div>
						</div>


						<div className="h-full w-full border-0 border-blue-500 flex justify-between">
							<div className="flex items-center border-0 rounded-lg justify-center ml-2 w-[300px]  my-2">
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
							<div className="grid grid-cols-4 text-center items-center">


								{/* <div className="group transition-all fade-in-out mx-5">
									<div id="ToggleMicBtn" className="border-0 rounded-lg p-2 w-fit mx-auto group-hover:bg-orange-500 group-hover:bg-opacity-20 transition-all fade-in-out group-hover:text-orange-500" >{!MicOn ? (<BsFillMicMuteFill className="w-5 h-5" />) : (<BsFillMicFill className="w-5 h-5" />)}</div>
									<div className="text-md transition-all fade-in-out text-gray-400 mt-2 group-hover:text-orange-500">{MicOn ? "Mic On" : "Mic Off"}</div>
								</div>


								<div className="group transition-all fade-in-out mx-5">
									<div id="ToggleVideoBtn" className="border-0 rounded-lg p-2 w-fit mx-auto group-hover:bg-orange-500 group-hover:bg-opacity-20 transition-all fade-in-out group-hover:text-orange-500" >{!VideoOn ? (<BsFillCameraVideoOffFill className="w-5 h-5" />) : (<BsCameraVideoFill className="w-5 h-5" />)}</div>
									<div className="text-md transition-all fade-in-out text-gray-400 mt-2 group-hover:text-orange-500">{VideoOn ? "Cam On" : "Cam Off"}</div>
								</div>

								<div className="group transition-all fade-in-out mx-5">
									<div className="border-0 rounded-lg p-2 w-fit mx-auto group-hover:bg-orange-500 group-hover:bg-opacity-20 transition-all fade-in-out group-hover:text-orange-500" >{ScreenShareOn ? (<LuScreenShareOff className="w-5 h-5" />) : (<LuScreenShare className="w-5 h-5" />)}</div>
									<div className="text-md transition-all fade-in-out text-gray-400 mt-2 group-hover:text-orange-500">{!ScreenShareOn ? "Start Sharing" : "Stop Sharing"}</div>
								</div>


								<div className="group transition-all fade-in-out mx-5">
									<div className="border-0 rounded-lg p-2 w-fit mx-auto group-hover:bg-orange-500 group-hover:bg-opacity-20 transition-all fade-in-out group-hover:text-orange-500" >{WhiteBoardOn ? (<BsClipboard2XFill className="w-5 h-5" />) : (<BsClipboard2Fill className="w-5 h-5" />)}</div>
									<div className="text-md transition-all fade-in-out text-gray-400 mt-2 group-hover:text-orange-500">{!WhiteBoardOn ? "Open Board" : "Close Board"}</div>
								</div> */}


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
						id="Chat_Box"
						className="h-full border-0 border-red-500  p-5 w-full"
					>
						<div className="bg-gray-200 w-full h-full  grid grid-rows-[80px_auto_80px]">
							<div className="w-full h-full border-0 rounded-t-xl border-black  p-3">
								<div className="border-0 border-red-500 rounded-lg bg-gray-100 w-full h-full grid grid-cols-2 text-center p-2">
									<div id="MessageBtn" className="flex items-center justify-center border-0 border-red-500 rounded-lg bg-gray-200 bg-opacity-50 font-bold hover:text-orange-600  text-orange-600 transition-all fade-in-out" >Messages</div>
									<div id="ParticipantsBtn" className="flex items-center justify-center border-0 border-red-500 rounded-lg hover:text-orange-600 font-bold transition-all fade-in-out" >Participants</div>
								</div>
							</div>
							<div className="w-full h-full border-0 border-black"></div>

							<div className="w-full h-full border-0 border-black p-2">
								<div className="bg-white rounded-lg w-full h-full flex">
									<div className="border-r-2 border-gray-300 flex justify-center items-center mx-auto my-auto px-3 py-2">
										<GrAttachment className="w-5 h-5" />
									</div>
									<input placeholder="Write a Message ..." className="w-full text-start items-center px-2 outline-none" />


									<div className="border-l-2 flex my-auto mx-auto justify-center items-center  border-gray-300 py-2 px-2">
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

