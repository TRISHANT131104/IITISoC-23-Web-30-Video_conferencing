import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { AiFillFileText, AiOutlineFileText } from 'react-icons/ai';
import {MdRecordVoiceOver } from 'react-icons/md'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { SendYourSpokenDataToOtherPeers } from './SpokenData';
export default function SpeechToText(transcript,peers,browserSupportsSpeechRecognition) {
    const [speechToText, setSpeechToText] = useState(false);
    
    
   

    const toggleSpeechToTextBtn = () => {
        if (!speechToText) {
            setSpeechToText(true);
            SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
            
        } else {
            setSpeechToText(false);
            SpeechRecognition.stopListening();
            SendYourSpokenDataToOtherPeers(transcript,peers)
        }
    };

    // Add event listener to continue listening when speech resumes
    SpeechRecognition.onEnd = () => {
        if (speechToText) {
            SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        }
    };
    
    

    
    

    return (
        <div>
            <div
                id="Left_Nav_SpeechToText_Btn"
                className={`focus:bg-orange-500 cursor-pointer !h-fit my-5 p-3 rounded-lg ${speechToText ? 'bg-orange-500' : 'hover:bg-orange-500'
                    } transition-all text-orange-600 bg-opacity-20 hover:bg-opacity-20`}
                onClick={toggleSpeechToTextBtn}
            >
                
                <MdRecordVoiceOver className="w-7 h-7" />
            </div>
            
        </div>
    );
}
