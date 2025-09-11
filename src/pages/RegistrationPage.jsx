import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Client, Account, ID } from 'appwrite'

export default function RegistrationPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onReset = () => setForm({ name: '', email: '', password: '', confirmPassword: '' })
  
  const onSubmit = async (e) => {
    e.preventDefault()
    const { name, email, password, confirmPassword } = form
    
    if (!name || !email || !password || !confirmPassword) {
      alert('fill all fields. NOW')
      return
    }
    
    if (password !== confirmPassword) {
      alert('passwords dont match!')
      return
    }
    
    if (password.length < 8) {
      alert('password too short! need at least 8 characters')
      return
    }
    
    setLoading(true)
    try {
      const client = new Client()
        .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1')
        .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6')

      const account = new Account(client)

      // Create account
      await account.create(ID.unique(), email, password, name)
      console.log('Account created successfully')
      
      // Auto-login after registration
      await account.createEmailPasswordSession(email, password)
      console.log('Auto-login successful')
      
      // Send verification email
      try {
        await account.createVerification(window.location.origin + '/verify')
        console.log('Verification email sent')
      } catch (verifyError) {
        console.warn('Failed to send verification email:', verifyError)
      }
      
      alert(`welcom to the grib, ${name}!\n\naccount created sucess\ncheck ur email for verification!`)
      navigate('/ai')
    } catch (e) {
      console.warn('Registration failed:', e)
      alert('registration failed. maybe email already exists?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registration-page">
      <h2>Register</h2>
      <p>join the grib</p>
      
      <form className="registration-form" onSubmit={onSubmit} onReset={onReset}>
        <table>
          <tbody>
            <tr>
              <td>name:</td>
              <td><input name="name" type="text" size={30} value={form.name} onChange={onChange} required /></td>
            </tr>
            <tr>
              <td>email:</td>
              <td><input name="email" type="email" size={30} value={form.email} onChange={onChange} required /></td>
            </tr>
            <tr>
              <td>password:</td>
              <td><input name="password" type="password" size={30} value={form.password} onChange={onChange} required /></td>
            </tr>
            <tr>
              <td>confirm:</td>
              <td><input name="confirmPassword" type="password" size={30} value={form.confirmPassword} onChange={onChange} required /></td>
            </tr>
            <tr>
              <td colSpan={2} align="center">
                <input type="submit" value={loading ? "registering..." : "register"} className="submit-button" disabled={loading} />
                <input type="reset" value="clearr" className="reset-button" disabled={loading} />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      
      <div className="login-link">
        <p>already have account? <Link to="/auth" className="cool-link">login here</Link></p>
      </div>
    </div>
  )
}
