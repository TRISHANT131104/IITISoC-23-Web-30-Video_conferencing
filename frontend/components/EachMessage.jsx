import React from 'react'

export default function EachMessage({ user, message, byMe }) {

    return (
        <div id='EachMessage' className=' '>
            {byMe ? (
                <>
                    <div className='grid grid-cols-[auto_50px] h-full w-full'>
                        
                        <div id="User_Message_Box" className='px-5 border-0 border-red-500 flex flex-col justify-end'>
                            <div id="UserName" className='text-sm w-full font-bold text-gray-600  my-auto mt-4 border-0 border-black text-end flex justify-end'>
                                {user}
                            </div>
                            <div id="User_Message" className='p-2 w-fit break-all text-end flex justify-end   my-5 border-0 border-blue-500 bg-orange-500 text-white  rounded-md ml-auto'>
                                {message}
                            </div>
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
                                {user}
                            </div>
                            <div id="User_Message" className='p-2 w-fit break-all  my-5 text-start flex justify-start border-0 border-blue-500 bg-white rounded-md'>
                                {message}
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    )
}
