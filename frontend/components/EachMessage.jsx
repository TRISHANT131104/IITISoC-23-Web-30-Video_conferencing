import React, { useEffect } from 'react'
import { download } from '../utils/ShareFileUtils'

export default function EachMessage({ worker, setGotFile, message,setProgress }) {
    useEffect(()=>{
        console.log('sp',setProgress)
        
    },[])
    return (
        <div id='EachMessage' className=' '>
            {message.messageCreatedByMe ? (
                <>
                    <div className='grid grid-cols-[auto_50px] h-full w-full'>

                        <div id="User_Message_Box" className='px-5 border-0 border-red-500 flex flex-col justify-end'>
                            <div id="UserName" className='text-sm w-full font-bold text-gray-600  my-auto mt-4 border-0 border-black text-end flex justify-end'>
                                {message.identity}
                            </div>
                            {message.File ? (
                                <div id="DownloadMessage" className='flex flex-col justify-center items-center text-center p-2 m-5 rounded-lg bg-gradient-to-tr from-orange-400 to-orange-600 '>
                                    <div className='font-bold text-white'>You Sent A File</div>
                                    <div className='font-bold underline-offset-2 cursor-pointer border-2 p-2 rounded-md my-2 bg-white text-orange-600  break-all' onClick={() => {
                                        download(worker, setGotFile, message.content)
                                    }}>{message.content}</div>
                                </div>
                            ) : (
                                <div id="User_Message" className='p-2 w-fit break-all text-end flex justify-end   my-5 border-0 border-blue-500 bg-orange-500 text-white  rounded-md ml-auto'>
                                    {message.content}
                                </div>
                            )}

                        </div>
                        <div id="User_Image" className=' py-2 w-full h-full'>
                            <div className='bg-orange-500 rounded-full w-[40px] h-[40px]'>

                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className=' grid grid-cols-[50px_auto] h-full w-full'>
                        <div id="User_Image" className='px-5 py-2 w-full h-full'>
                            <div className='bg-orange-500 rounded-full w-[40px] h-[40px]'>

                            </div>
                        </div>
                        <div id="User_Message_Box" className='px-5 border-0 border-red-500 flex flex-col '>
                            <div id="UserName" className='text-sm w-full font-bold text-gray-600  my-auto mt-4 border-0 border-black text-start flex justify-start'>
                                {message.identity}
                            </div>
                            {message.File ? (
                                <div id="DownloadMessage" className='flex flex-col justify-center items-center text-center p-2 m-5 rounded-lg bg-gradient-to-tr bg-white '>
                                    <div className='font-bold text-orange-600 '>Hey {message.identity} Has Sent You All A File</div>
                                    <div className='font-bold underline-offset-2 cursor-pointer border-2 p-2 rounded-md my-2 bg-gradient-to-tr from-orange-400 to-orange-600 text-white break-all' onClick={() => {
                                        download(worker, setGotFile, message.content)
                                    }}>{message.content}</div>
                                </div>
                            ) : (
                                <div id="User_Message" className='p-2 w-fit break-all  my-5 text-start flex justify-start border-0 border-blue-500 bg-white rounded-md'>
                                    {message.content}
                                </div>
                            )}

                        </div>
                    </div>
                </>
            )}

        </div>
    )
}
