import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Client, Account } from 'appwrite'

export default function AuthPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const client = new Client()
          .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1')
          .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6')

        const account = new Account(client)
        const session = await account.getSession('current')
        
        if (session) {
          console.log('Existing session found, redirecting to AI page')
          navigate('/ai')
        }
      } catch (e) {
        // No session found, user can log in
        console.log('No existing session found')
      }
    }
    
    checkSession()
  }, [navigate])
  
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onReset = () => setForm({ email: '', password: '' })
  
  const onSubmit = async (e) => {
    e.preventDefault()
    const { email, password } = form
    if (!email || !password) {
      alert('email. password. NOW')
      return
    }
    
    setLoading(true)
    try {
      const client = new Client()
        .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1')
        .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6')

      const account = new Account(client)

      const session = await account.createEmailPasswordSession(email, password)
      console.log('Login successful:', session)
      
      alert(`welcom back!\n\nlogin sucess`)
      navigate('/ai')
    } catch (e) {
      console.warn('Login failed:', e)
      alert('login failed. check ur email/password!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <h2>Auth</h2>
      <p>login to the grib</p>
      
      <form className="login-form" onSubmit={onSubmit} onReset={onReset}>
        <table>
          <tbody>
            <tr>
              <td>email:</td>
              <td><input name="email" type="email" size={30} value={form.email} onChange={onChange} required /></td>
            </tr>
            <tr>
              <td>password:</td>
              <td><input name="password" type="password" size={30} value={form.password} onChange={onChange} required /></td>
            </tr>
            <tr>
              <td colSpan={2} align="center">
                <input type="submit" value={loading ? "logining..." : "login"} className="submit-button" disabled={loading} />
                <input type="reset" value="clearr" className="reset-button" disabled={loading} />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      
      <div className="registration-link">
        <p>dont have account? <Link to="/register" className="cool-link">register here</Link></p>
      </div>
    </div>
  )
}
