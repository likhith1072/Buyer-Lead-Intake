'use client'
import React from 'react'
import { useUser } from "@clerk/nextjs"

function BuyersPage() {
     const { user, isLoaded, isSignedIn } = useUser()
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
