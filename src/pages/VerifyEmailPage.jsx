import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Client, Account } from 'appwrite'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying...')
  const navigate = useNavigate()

  useEffect(() => {
    const verifyEmail = async () => {
      const userId = searchParams.get('userId')
      const secret = searchParams.get('secret')

      if (!userId || !secret) {
        setStatus('invalid verification link!')
        return
      }

      try {
        const client = new Client()
          .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1')
          .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6')

        const account = new Account(client)
        await account.updateVerification(userId, secret)
        
        setStatus('email verified successfully!')
        setTimeout(() => navigate('/ai'), 3000)
      } catch (e) {
        console.warn('Email verification failed:', e)
        setStatus('verification failed. link may be expired.')
      }
    }

    verifyEmail()
  }, [searchParams, navigate])

  return (
    <div className="verify-email-page">
      <h2>Email Verification</h2>
      <p>{status}</p>
      {status.includes('successfully') && (
        <p>redirecting to AI page in 3 seconds...</p>
      )}
    </div>
  )
}