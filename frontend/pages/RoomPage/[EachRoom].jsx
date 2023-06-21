import React, { useContext, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import LaptopRoom from '../../components/LaptopRoom'
import MobileRoom from '../../components/MobileRoom'
import Context from '../../context/Context'

const  EachRoom = () => {
    const { auth } = useContext(Context);
    const router = useRouter();
    useEffect(() => {
        if (!auth) {

            router.push('/LoginPage')
            return;
        }
        localStorage.setItem('roomID',router.query.EachRoom)
    })


    

    return (
        <div>
            <div>
                <div className='hidden lg:block'><LaptopRoom  /></div>
                <div className='lg:hidden'><MobileRoom /></div>
            </div>
        </div>
    )
}


export default EachRoom