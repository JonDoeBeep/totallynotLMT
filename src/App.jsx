import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Client, Account } from 'appwrite'
import AIPage from './pages/AIPage'
import AuthPage from './pages/AuthPage'
import RegistrationPage from './pages/RegistrationPage'
import AccountPage from './pages/AccountPage'
import FileHostingPage from './pages/FileHostingPage'
import VerifyEmailPage from './pages/VerifyEmailPage'

function useKonami(onActivate) {
  useEffect(() => {
    const seq = [38,38,40,40,37,39,37,39,66,65]
    let buf = []
    const handler = (e) => {
      buf.push(e.keyCode)
      if (buf.length > seq.length) buf.shift()
      if (buf.join(',') === seq.join(',')) {
        onActivate?.()
        buf = []
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onActivate])
}

function useSparkles(active = true) {
  useEffect(() => {
    if (!active) return
    const create = () => {
      const el = document.createElement('div')
      el.textContent = 'large mike'
      el.style.position = 'fixed'
      el.style.left = Math.random() * window.innerWidth + 'px'
      el.style.top = Math.random() * window.innerHeight + 'px'
      el.style.fontSize = '20px'
      el.style.pointerEvents = 'none'
      el.style.zIndex = '9999'
      el.style.animation = 'sparkleAnimation 9s ease-out forwards'
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 9500)
    }
    const id = setInterval(create, 750)
    return () => clearInterval(id)
  }, [active])
}

function VisitorCounter() {
  const [count, setCount] = useState(1337)
  const [currentVisitor, setCurrentVisitor] = useState(1338)
  const [display, setDisplay] = useState('000000')

  useEffect(() => {
    let canceled = false

    function animateTo(target) {
      let current = 0
      const inc = Math.max(1, Math.ceil(target / 50))
      const timer = setInterval(() => {
        current += inc
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        setDisplay(String(current).padStart(6, '0'))
      }, 50)
      setCount(target)
    }

    async function load() {
      try {
        // Use raw REST endpoint instead of SDK
        const endpoint = (import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1').replace(/\/$/, '')
        const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6'
        const functionId = import.meta.env.VITE_APPWRITE_FUNCTION_ID || '68c067a40036e60f6a9a'
        if (!functionId) throw new Error('APPWRITE functionId not set')

        const res = await fetch(`${endpoint}/functions/${functionId}/executions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': projectId,
          },
          body: JSON.stringify({ data: JSON.stringify({ action: 'increment' }), async: false }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const exec = await res.json()

        console.log('Appwrite execution response:', exec)

        const raw = exec?.responseBody || exec?.response || exec?.stdout || exec?.body || ''
        console.log('Raw response data:', raw)
        
        const data = (() => { try { return JSON.parse(raw) } catch { return null } })()
        console.log('Parsed data:', data)
        
        const visitCount = Number(data?.viewcount ?? data?.count ?? data?.visitnumber ?? data?.visits ?? 0)
        console.log('Visit count:', visitCount)

        if (canceled) return
        if (!Number.isFinite(visitCount) || visitCount <= 0) throw new Error(`Invalid count from function: ${visitCount}`)
        animateTo(visitCount)
        setCurrentVisitor(visitCount + 1)
      } catch (e) {
        console.warn('VisitorCounter fallback:', e)
        animateTo(1337)
        setCurrentVisitor(1338)
      }
    }

    load()
    return () => { canceled = true }
  }, [])

  return (
    <div className="visitor-counter">
      <h4>Visitor Count:</h4>
      <div className="counter-display"><span>{display}</span></div>
      <p><small>You are visitor #{currentVisitor}!</small></p>
    </div>
  )
}

function Guestbook() {
  const [form, setForm] = useState({ name: '', email: '', website: '', message: '' })
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onReset = () => setForm({ name: '', email: '', website: '', message: '' })
  
  const onSubmit = async (e) => {
    e.preventDefault()
    const { name, message } = form
    if (!name || !message) {
      alert('name. message. NOW')
      return
    }
    
    setLoading(true)
    try {
      // Submit to Appwrite TablesDB
      const endpoint = (import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1').replace(/\/$/, '')
      const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6'
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || '68c065810005868a248c'
      const tableId = 'guestlog' // Your guestbook table
      
      const payload = {
        rowId: 'unique()', // Let Appwrite generate unique ID
        data: {
          name: form.name,
          email: form.email || '',
          website: form.website || '',
          message: form.message
        }
      }
      
      console.log('Guestbook submission payload:', payload)
      
      const res = await fetch(`${endpoint}/tablesdb/${databaseId}/tables/${tableId}/rows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': projectId,
        },
        body: JSON.stringify(payload),
      })
      
      console.log('Guestbook response status:', res.status)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.log('Guestbook error response:', errorText)
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }
      
      const result = await res.json()
      console.log('Guestbook success response:', result)
      
      alert(`tank u, ${name}!\n\n ok bye`)
      onReset()
      loadEntries() // Reload entries after successful submission
    } catch (e) {
      console.warn('Guestbook submission failed:', e)
      alert('failed to submit guestbook entry. try again later!')
    } finally {
      setLoading(false)
    }
  }
  
  const loadEntries = async () => {
    try {
      const endpoint = (import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1').replace(/\/$/, '')
      const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6'
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || '68c065810005868a248c'
      const tableId = 'guestlog'
      
      const res = await fetch(`${endpoint}/tablesdb/${databaseId}/tables/${tableId}/rows?limit=10`, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': projectId,
        },
      })
      
      if (res.ok) {
        const data = await res.json()
        setEntries(data.rows || [])
      }
    } catch (e) {
      console.warn('Failed to load guestbook entries:', e)
    }
  }
  
  // Load entries on component mount
  useEffect(() => {
    loadEntries()
  }, [])

  return (
    <div className="guestbook-section">
      <h3 className="section-title">gestbook</h3>
      <form className="guestbook-form" onSubmit={onSubmit} onReset={onReset}>
        <table>
          <tbody>
            <tr>
              <td>name:</td>
              <td><input name="name" type="text" size={30} value={form.name} onChange={onChange} required /></td>
            </tr>
            <tr>
              <td>email:</td>
              <td><input name="email" type="email" size={30} value={form.email} onChange={onChange} /></td>
            </tr>
            <tr>
              <td>wepsite:</td>
              <td><input name="website" type="url" size={30} placeholder="http://" value={form.website} onChange={onChange} /></td>
            </tr>
            <tr>
              <td valign="top">message:</td>
              <td><textarea name="message" rows={4} cols={40} placeholder="mesag" value={form.message} onChange={onChange} required /></td>
            </tr>
            <tr>
              <td colSpan={2} align="center">
                <input type="submit" value={loading ? "submitting..." : "sine"} className="submit-button" disabled={loading} />
                <input type="reset" value="clearr" className="reset-button" disabled={loading} />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      
      {entries.length > 0 && (
        <div className="guestbook-entries">
          <h4>recent entries:</h4>
          {entries.slice(0, 5).map((entry, idx) => (
            <div key={entry.$id || idx} className="guestbook-entry">
              <strong>{entry.name}</strong>
              {entry.website && <span> - <a href={entry.website} target="_blank" rel="noopener noreferrer">{entry.website}</a></span>}
              <br />
              <em>{entry.message}</em>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="header">
      <marquee behavior="alternate" scrollAmount={3}>
        <h1 className="neon-title">hi hi hi hi ih hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi</h1>
      </marquee>
      <div className="under-construction">
        <img alt="Loading..." src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAOw==" />
        <blink>loding</blink>
      </div>
    </header>
  )
}

function Footer() {
  const lastUpdated = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }, [])
  return (
    <footer className="footer">
      <marquee direction="left" scrollAmount={2}>wheeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee</marquee>
      <div className="footer-content">
        <p>badges</p>
        <div className="browser-badges">
          <img alt="Netscape Now!" width="80" height="15" style={{background: 'linear-gradient(45deg, #ff0000, #00ff00)', color: 'white'}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" />
          <img alt="Internet Explorer" width="80" height="15" style={{background: 'blue', color: 'white'}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" />
        </div>
        <p className="copyright">© me 2025</p>
        <p className="last-updated">Last updated: <span>{lastUpdated}</span></p>
      </div>
    </footer>
  )
}

export default function App() {
  const [konamiActive, setKonamiActive] = useState(false)
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const client = new Client()
          .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1')
          .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6')

        const account = new Account(client)
        const currentUser = await account.get()
        setUser(currentUser)
      } catch (e) {
        setUser(null)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    const id = setTimeout(() => alert('hi'), 1000)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      alert('uh')
    }
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  useEffect(() => {
    const over = (e) => {
      if (e.target.tagName === 'A') {
        if (window.status !== undefined) window.status = 'click: ' + e.target.href
        e.target.style.textDecoration = 'underline overline'
      }
    }
    const out = (e) => {
      if (e.target.tagName === 'A') {
        if (window.status !== undefined) window.status = 'Ready'
        e.target.style.textDecoration = 'none'
      }
    }
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout', out)
    return () => {
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout', out)
    }
  }, [])

  // Random title messages
  useEffect(() => {
    const messages = [
      'bananas',
      'helo',
      "idk",
      'html',
      'websit',
    ]
    const baseTitle = 'helo html5'
    document.title = baseTitle
    const id = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)]
      const prev = document.title.split(' - ')[1]
      document.title = `${msg} - ${prev || 'sigma'}`
      setTimeout(() => { document.title = baseTitle }, 3000)
    }, 15000)
    return () => clearInterval(id)
  }, [])

  useKonami(() => {
    alert('die')
    setKonamiActive(true)
    const prev = document.body.style.animation
    document.body.style.animation = 'rainbowShift 0.5s infinite'
    setTimeout(() => {
      document.body.style.animation = prev
      setKonamiActive(false)
    }, 5000)
  })

  useSparkles(true)

  return (
    <BrowserRouter>
      <div className="container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                <div className="welcome-section">
                  <h2 className="rainbow-text">rainbow cool</h2>
                  <p>idk what to put here</p>
                </div>
                <table className="main-table" border="2" cellPadding="10" cellSpacing="5">
                  <tbody>
                    <tr>
                      <td className="sidebar" bgColor="#FF00FF">
                        <h3>links</h3>
                        <ul className="link-list">
                          <li><Link to="/ai" className="cool-link">AI</Link></li>
                          <li><Link to="/auth" className="cool-link">Auth</Link></li>
                          <li><Link to="/register" className="cool-link">Register</Link></li>
                          {user && (
                            <>
                              <li><Link to="/account" className="cool-link">Account</Link></li>
                              <li><Link to="/files" className="cool-link">Files</Link></li>
                            </>
                          )}
                          {!user && (
                            <>
                              <li><a href="#" className="cool-link">idk</a></li>
                              <li><a href="#" className="cool-link">idk</a></li>
                            </>
                          )}
                        </ul>
                        <VisitorCounter />
                      </td>
                      <td className="content-area" bgColor="#00FFFF">
                        <h3 className="section-title">idk section</h3>
                        <div className="news-item">
                          <h4>uh updtate 1</h4>
                          <p>fix viewcounter</p>
                        </div>
                        <div className="news-item">
                          <h4>uodat 2</h4>
                          <p>yeah</p>
                        </div>
                        <h3 className="section-title">about me</h3>
                        <p>thuisis my siyte here is about me:</p>
                        <ul>
                          <li>i live</li>
                          <li>i think</li>
                          <li>i am</li>
                          <li>i </li>
                          <li>me</li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Guestbook />
              </>
            } />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/files" element={<FileHostingPage />} />
            <Route path="/verify" element={<VerifyEmailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
