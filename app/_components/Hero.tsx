import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'

function Hero() {
  return (
    <section className="bg-white lg:grid  lg:place-content-center">
      <div className="mx-auto w-screen max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32 lg:flex">
        <div className="mx-auto max-w-prose text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Manage Your Buyer Leads
            <strong className="text-indigo-600 sm:block"> Effectively</strong>
          </h1>

          <p className="mt-4 text-base text-pretty text-gray-900 sm:text-lg/relaxed">
            Start tracking your buyer leads today with our intuitive and user-friendly platform.
          </p>

          <div className="mt-4 flex justify-center gap-4 sm:mt-6">
            
            <Link href='/buyers'><Button className='cursor-pointer rounded border border-indigo-600 bg-indigo-600 px-5 py-5 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700'>Get Started</Button></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
