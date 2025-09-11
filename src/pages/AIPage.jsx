import React, { useState, useEffect } from 'react'
import { Client, Account } from 'appwrite'

export default function AIPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const client = new Client()
          .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1')
          .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6')

        const account = new Account(client)
        const currentUser = await account.get()
        setUser(currentUser)
      } catch (e) {
        console.warn('Failed to get user:', e)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const sendVerification = async () => {
    try {
      const client = new Client()
        .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1')
        .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6')

      const account = new Account(client)
      await account.createVerification(window.location.origin + '/verify')
      alert('verification email sent! check ur inbox')
    } catch (e) {
      console.warn('Failed to send verification:', e)
      alert('failed to send verification email')
    }
  }

  return (
    <div className="ai-page">
      {!loading && user && !user.emailVerification && (
        <div className="verification-banner" style={{
          backgroundColor: '#ffff00',
          border: '2px solid #ff0000',
          padding: '10px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <blink>verfy emile. </blink>
          <br />
          <p style={{ margin: '5px 0' }}>
            check email ({user.email}) and click the verification link!
          </p>
          <button onClick={sendVerification} style={{
            backgroundColor: '#ff00ff',
            color: 'white',
            border: '2px solid #000',
            padding: '5px 10px',
            cursor: 'pointer'
          }}>
            resend verification
          </button>
        </div>
      )}
      
      <h2>AI</h2>
      <p>welcom to the ai zone</p>
      {user && <p>helo {user.name}</p>}
    </div>
  )
}
