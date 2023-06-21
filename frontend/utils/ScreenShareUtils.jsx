
import { store } from "../store/store";
const ScreenShareConstraints = {
    audio: false,
    video: true,
}

export const handleScreenShare = async (ScreenShareOn,ScreenSharingStream,setScreenShareOn,peers,socketId,localStream) => {
    const my_video = document.getElementById('my_video')
    if (ScreenShareOn === false) {
        try {

            const stream = await navigator.mediaDevices.getDisplayMedia(ScreenShareConstraints);
            ScreenSharingStream.current = stream
            ToggleScreenShare(true, stream,peers,localStream); // Activate screen sharing for all peers.current
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
        const ScreenShareDiv = document.getElementById(`ss_${socketId}`)
        if (ScreenShareDiv) {
            VideoGrid.removeChild(ScreenShareDiv)
        }
        ToggleScreenShare(false,null,peers,localStream); // Deactivate screen sharing for all peers.current
        if (ScreenSharingStream.current) {
            ScreenSharingStream.current.getTracks().forEach((track) => track.stop());
        }


    }
};



const ToggleScreenShare = (isScreenSharingActive,screenSharingStream = null,peers,localStream) => {
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