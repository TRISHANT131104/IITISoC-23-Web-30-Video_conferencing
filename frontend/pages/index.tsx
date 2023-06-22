import React from 'react'
import Modal from '../components/Modal'
import BlobText from '../components/BlobText'
import HomePage2 from '../components/HomePage2'
export default function index() {
  return (
    <div>
      <div className='lg:grid lg:grid-cols-[auto_auto_auto]  bg-white'>
      <div id='side-btn' className='w-[30px] h-full hidden lg:block  rounded-r-full bg-transparent'></div>
      <div className='flex justify-center items-center lg:items-start flex-col absolute lg:relative  z-[100] top-[50%] md:top-0 mx-auto w-full lg:pl-10 text-center lg:translate-x-[50px] bg-transparent'>

        <div className='text-6xl lg:text-8xl font-bold '>Confero<span className=''>Live</span></div>

        <div className='lg:text-4xl text-2xl my-2 '>See, Speak, Share - Without Boundaries
        </div>
      </div>
      <div className=' '><Modal /></div>

      <style jsx>
        {`
            #side-btn{
              background-image:linear-gradient(147deg, #fe8a39 0%, #fd3838 74%);
            }
          `}
      </style>
    </div>
      <div>
        <HomePage2 />
      </div>
    </div>
  )
}
