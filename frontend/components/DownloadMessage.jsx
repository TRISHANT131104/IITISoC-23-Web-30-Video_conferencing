import React from 'react'
import { download } from '../utils/ShareFileUtils'
export default function DownloadMessage({ worker, setGotFile, message }) {
  return (
    <>
      {message.messageCreatedByMe ? (
        <div id="DownloadMessage" className='flex flex-col justify-center items-center text-center p-2 m-5 rounded-lg bg-gradient-to-tr from-orange-400 to-orange-600 text-white w-full'>
          <div className='font-bold'>Hey {message.identity} Has Sent You All A File</div>
          <div className='font-bold underline-offset-2 cursor-pointer border-2 p-2 rounded-md my-2 from-gray-100 to-gray-200 text-orange-600 ' onClick={() => {
            download(worker, setGotFile, message.content)
          }}>{message.content}</div>
        </div>
      ) : (
        <div id="DownloadMessage" className='flex flex-col justify-center items-center text-center p-2 m-5 rounded-lg bg-gradient-to-tr from-gray-100 to-gray-200 text-orange-600 w-full'>
          <div className='font-bold'>Hey {message.identity} Has Sent You All A File</div>
          <div className='font-bold underline-offset-2 cursor-pointer border-2 p-2 rounded-md my-2 bg-gradient-to-tr from-orange-400 to-orange-600 text-white' onClick={() => {
            download(worker, setGotFile, message.content)
          }}>{message.content}</div>
        </div>
      )}
    </>

  )
}
