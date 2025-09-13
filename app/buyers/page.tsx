'use client'
import React from 'react'
import { useUser } from "@clerk/nextjs"

function BuyersPage() {
     const { user, isLoaded, isSignedIn } = useUser()
       if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Not signed in</div>
  }
  return (
    <div>
      <h1>Buyers Page</h1>
      <div>
      <p>User ID: {user!.id}</p>
      <p>Name: {user!.firstName} {user!.lastName}</p>
      <p>Email: {user!.primaryEmailAddress?.emailAddress}</p>
    </div>
    </div>
  )
}

export default BuyersPage
