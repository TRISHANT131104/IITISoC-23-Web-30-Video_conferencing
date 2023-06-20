import React,{useContext,useEffect} from "react";
import Context from "../context/Context";
export default function VideoGrid({ localStream }) {
    const { roomID, number } = useContext(Context)
    

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

            
        };


        

    }, [])

    

    return (
        <div id="VideoGrid" className={` w-full rounded-md my-auto items-center abs  grid gap-4`}>
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