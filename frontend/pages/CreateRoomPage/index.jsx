import React, { useContext, useState } from 'react'
import Context from '../../context/Context'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid';
import { connectionWithSocketServer } from '../../components/wss';
import { useEffect } from 'react';
import wss from '../../components/wss';
import { store } from '../../store/store';
import axios from 'axios'
import { useRouter } from 'next/router';
import { setIsRoomHost } from '../../store/actions';
export default function index() {
  const data = useContext(Context)
  const [JoinRoomId,setJoinRoomId] = useState()
  const {title,settitle,setidentity,identity,setisHost,isHost,setroomID,roomID,setconnectedUsers,connectedUsers} = data
  const router = useRouter()
  useEffect(()=>{
    setroomID(uuidv4())
  },[])
  return (
    <div>
      <input type="text" placeholder='Title of the Room'  onChange={(event)=>{
        settitle(event.target.value)
      }} />
      <input type="text" placeholder='Your Name'  onChange={(event)=>{
        setidentity(event.target.value)
        
      }} />
      <input type="text" placeholder='Is Host'  onChange={(event)=>{
        setisHost(event.target.value)
      }} />
      <input id="roomIDInput" type="text" placeholder="enter RoomID" onChange={(e)=>{
        setJoinRoomId(e.target.value)
      }}  />
      <Link onClick={()=>{
        setisHost(false)
      }} href={`/RoomPage/${JoinRoomId}`} >Join Room</Link>
      <button onClick={()=>{
        localStorage.setItem('title',title)
        localStorage.setItem('roomID',roomID)  
        setisHost(true)
        localStorage.setItem('identity',identity)
        localStorage.setItem('isHost',isHost)
        router.push(`/RoomPage/${roomID}`)
      }}  className='border-2 border-black p-2'>Start An Instant Meeting</button>
    </div>
  )
}
