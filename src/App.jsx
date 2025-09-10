import React, { useEffect, useMemo, useRef, useState } from 'react'

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
      el.style.animation = 'sparkleAnimation 2s ease-out forwards'
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 1000)
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
  const [form, setForm] = useState({ name: '', email: '', homepage: '', message: '' })
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onReset = () => setForm({ name: '', email: '', homepage: '', message: '' })
  const onSubmit = (e) => {
    e.preventDefault()
    const { name, message } = form
    if (name && message) {
      alert(`tank u, ${name}!\n\n ok bye`)
      const entries = JSON.parse(localStorage.getItem('guestbookEntries') || '[]')
      entries.push({ ...form, date: new Date().toLocaleDateString() })
      localStorage.setItem('guestbookEntries', JSON.stringify(entries))
      onReset()
    } else {
      alert('name. message. NOW')
    }
  }

  return (
    <div className="guestbook-section">
      <h3 className="section-title">gestbook</h3>
      <form className="guestbook-form" onSubmit={onSubmit} onReset={onReset}>
        <table>
          <tbody>
            <tr>
              <td>name:</td>
              <td><input name="name" type="text" size={30} value={form.name} onChange={onChange} /></td>
            </tr>
            <tr>
              <td>email:</td>
              <td><input name="email" type="email" size={30} value={form.email} onChange={onChange} /></td>
            </tr>
            <tr>
              <td>wepsite:</td>
              <td><input name="homepage" type="url" size={30} placeholder="http://" value={form.homepage} onChange={onChange} /></td>
            </tr>
            <tr>
              <td valign="top">message:</td>
              <td><textarea name="message" rows={4} cols={40} placeholder="mesag" value={form.message} onChange={onChange} /></td>
            </tr>
            <tr>
              <td colSpan={2} align="center">
                <input type="submit" value="sine" className="submit-button" />
                <input type="reset" value="clearr" className="reset-button" />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
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
      document.title = `${msg} - ${prev || 'Rad Site'}`
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
    <div className="container">
      <Header />
      <main className="main-content">
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
                  <li><a href="#" className="cool-link">idk</a></li>
                  <li><a href="#" className="cool-link">idk</a></li>
                  <li><a href="#" className="cool-link">idk</a></li>
                  <li><a href="#" className="cool-link">idk</a></li>
                  <li><a href="#" className="cool-link">idk</a></li>
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
      </main>
      <Footer />
    </div>
  )
}
