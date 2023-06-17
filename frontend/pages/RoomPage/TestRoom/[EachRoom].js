import { useEffect, useRef } from 'react';

const AppProcess = () => {
    const peersConnectionIds = useRef([]);
    const peersConnection = useRef([]);
    const remoteVidStream = useRef([]);
    const remoteAudStream = useRef([]);
    const localDivRef = useRef(null);
    const serverProcessRef = useRef(null);
    const audioRef = useRef(null);
    const isAudioMuteRef = useRef(true);
    const rtpAudSendersRef = useRef([]);
    const videoStates = {
        None: 0,
        Camera: 1,
        ScreenShare: 2,
    };
    const videoStRef = useRef(videoStates.None);
    const videoCamTrackRef = useRef(null);
    const rtpVidSendersRef = useRef([]);

    const init = async (SDPFunction, myConnId) => {
        serverProcessRef.current = SDPFunction;
        myConnectionId = myConnId;
        eventProcess();
        localDivRef.current = document.getElementById('localVideoPlayer');
    };

    const eventProcess = () => {
        // Add event listeners using Next.js compatible methods
        useEffect(() => {
            const miceMuteUnmuteClickHandler = async () => {
                if (!audioRef.current) {
                    await loadAudio();
                }
                if (!audioRef.current) {
                    alert('Audio permission has not been granted');
                    return;
                }
                if (isAudioMuteRef.current) {
                    audioRef.current.enabled = true;
                    $(this).html(
                        "<span class='material-icons' style='width:100%;'>mic</span>"
                    );
                    updateMediaSenders(audioRef.current, rtpAudSendersRef.current);
                    console.log(rtpAudSendersRef.current);
                } else {
                    audioRef.current.enabled = false;
                    $(this).html(
                        "<span class='material-icons' style='width:100%;'>mic_off</span>"
                    );
                    removeMediaSenders(rtpAudSendersRef.current);
                    audioRef.current.stop();
                    console.log(rtpAudSendersRef.current);
                }
                isAudioMuteRef.current = !isAudioMuteRef.current;
            };

            const videoCamOnOffClickHandler = async () => {
                if (videoStRef.current === videoStates.Camera) {
                    await videoProcess(videoStates.None);
                } else {
                    await videoProcess(videoStates.Camera);
                }
            };

            const screenShareOnOffClickHandler = async () => {
                if (videoStRef.current === videoStates.ScreenShare) {
                    await videoProcess(videoStates.None);
                } else {
                    await videoProcess(videoStates.ScreenShare);
                }
            };

            $("#miceMuteUnmute").on("click", miceMuteUnmuteClickHandler);
            $("#videoCamOnOff").on("click", videoCamOnOffClickHandler);
            $("#ScreenShareOnOf").on("click", screenShareOnOffClickHandler);

            // Cleanup event listeners
            return () => {
                $("#miceMuteUnmute").off("click", miceMuteUnmuteClickHandler);
                $("#videoCamOnOff").off("click", videoCamOnOffClickHandler);
                $("#ScreenShareOnOf").off("click", screenShareOnOffClickHandler);
            };
        }, []);

        // Other eventProcess functions
    };

    // Other functions

    return {
        init,
        // Other exposed functions
    };
};

