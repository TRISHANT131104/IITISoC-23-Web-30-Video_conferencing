import { store } from "@/store/store"
import { useRef } from "react"
import { createContext,useState } from "react"
import Cookies from 'js-cookie'

const Context = createContext()

export const ContextProvider = ({ children }) => {
    
    console.log(typeof window!=="undefined" && localStorage.getItem('participants_length'))
    const [number,setnumber] = useState(typeof window!=="undefined" && localStorage.getItem('participants_length')?localStorage.getItem('participants_length'):1)
    const [title,settitle] = useState(null)
    const [identity,setidentity] = useState(typeof window!=="undefined" && localStorage.getItem('identity')?localStorage.getItem('identity'):null)
    const [isHost,setisHost] = useState(false)
    const [overlay,setoverlay] = useState(true)
    const [auth,setauth] = useState(typeof window!=="undefined" && localStorage.getItem('auth-details')?JSON.parse(localStorage.getItem('auth-details')):null)
    const [roomID,setroomID] = useState(typeof window!=="undefined" && localStorage.getItem('roomID')?localStorage.getItem('roomID'):null)
    const [VideoGrid,setVideoGrid] = useState(typeof window!=="undefined"?document.getElementById('VideoGrid'):null)
    
    const [connectedUsers,setconnectedUsers] = useState(null)
    console.log(connectedUsers)
    const ContextData = {
        title:title,
        settitle:settitle,
        auth:auth,
        setauth:setauth,
        roomID:roomID,
        setroomID:setroomID,
        identity:identity,
        setidentity:setidentity,
        isHost:isHost,
        setisHost:setisHost,
        overlay:overlay,
        setoverlay:setoverlay,
        connectedUsers:connectedUsers,
        setconnectedUsers:setconnectedUsers,
        VideoGrid:VideoGrid,
        setVideoGrid:setVideoGrid,
        number:number,
        setnumber:setnumber,
    }
    return <Context.Provider value={ContextData}>{children}</Context.Provider>
}

export default Context;