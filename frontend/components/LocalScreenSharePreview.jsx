import React, { useEffect } from 'react'

export default function LocalScreenSharePreview({ screenShareStream, socketId }) {
    useEffect(() => {
        const my_video = document.getElementById('my_video')
        if (screenShareStream) {
            const ScreenShareDiv = document.createElement('video')
            const VideoGrid = document.getElementById('VideoGrid')
            ScreenShareDiv.srcObject = screenShareStream
            ScreenShareDiv.className = "w-full h-full object-cover"
            ScreenShareDiv.autoplay = true
            ScreenShareDiv.muted = true
            ScreenShareDiv.id = `ss_${socketId}`
            VideoGrid.append(ScreenShareDiv)
            ScreenShareDiv.onloadedmetadata = () => {
                ScreenShareDiv.play()
            }
        }
        else{
        
        }

    }, [screenShareStream])
    return (
        <>
            <div>

            </div>
        </>
    )
}
