import React from 'react'
import { AiFillPushpin } from 'react-icons/ai'
import { BiBlock } from 'react-icons/bi'
export default function ParticipantsList({ participants,isRoomHost }) {
    return (
        <div className='m-2'>
            {participants.map((ele, index) => {
                return (
                    <div key={index} className="my-2">
                        {isRoomHost ? (
                            <div className='bg-white p-2 grid grid-cols-[auto_30px_30px] w-full gap-x-4 rounded-lg'>
                                <div>{ele.identity}</div>
                                <div className='w-full flex justify-center items-center  my-auto rounded-full hover:bg-gray-200 hover:bg-opacity-50'><AiFillPushpin className='mx-auto my-auto w-7 h-7 p-1' /></div>
                                <div className='w-full flex justify-center items-center  my-auto rounded-full hover:bg-gray-200 hover:bg-opacity-50'><BiBlock className='mx-auto my-auto w-7 h-7 p-1' /></div>
                            </div>
                        ) : (
                            <div className='bg-white p-2 grid grid-cols-[auto_30px] w-full gap-x-4 rounded-lg'>
                                <div>{ele.identity}</div>
                                <div className='w-full flex justify-center items-center  my-auto rounded-full hover:bg-gray-200 hover:bg-opacity-50'><AiFillPushpin className='mx-auto my-auto w-7 h-7 p-1' /></div>

                            </div>
                        )}
                    </div>

                )
            })}


        </div>
    )
}
