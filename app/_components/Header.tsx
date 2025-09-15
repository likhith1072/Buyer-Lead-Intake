"use client"
import React from 'react'
import Image from "next/image"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs';


function Header() {

  const {isSignedIn}=useUser();
  return (
    <div className='flex items-center justify-between px-7 border shadow-sm '>
     <Link href="/" >
     <div className="relative w-[120px] h-[70px] ">
       <Image src={'/BuyerLeadLogo.png'}
        alt="Logo"
        fill
        className='cursor-pointer object-cover'
        />
        </div></Link> 
        {isSignedIn ?<UserButton  appearance={{
    elements: {
      userButtonAvatarBox: {
        width: '40px',
        height: '40px',
      },
    },
  }}/> :  <Link href='/sign-in'><Button className='cursor-pointer'>SignIn</Button></Link>}
      
        
    </div>
  )
}

export default Header
