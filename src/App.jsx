import React, { useEffect, useMemo, useRef, useState } from 'react'

// Appwrite is globally available via script tag in index.html

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
      el.textContent = '✨'
      el.style.position = 'fixed'
      el.style.left = Math.random() * window.innerWidth + 'px'
      el.style.top = Math.random() * window.innerHeight + 'px'
      el.style.fontSize = '20px'
      el.style.pointerEvents = 'none'
      el.style.zIndex = '9999'
      el.style.animation = 'sparkleAnimation 2s ease-out forwards'
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 2000)
    }
    const id = setInterval(create, 2000)
    return () => clearInterval(id)
  }, [active])
}

function VisitorCounter() {
  const [count, setCount] = useState(1337)
  const [currentVisitor, setCurrentVisitor] = useState(1338)
  const [display, setDisplay] = useState('000000')

  useEffect(() => {
    let canceled = false
    async function load() {
      try {
        const client = new window.Appwrite.Client()
          .setEndpoint('https://sfo.cloud.appwrite.io/v1')
          .setProject('68bf36dd001f9ef1d5b6')
        const tablesDB = new window.Appwrite.TablesDB(client)
        const result = await tablesDB.getRow({
          databaseId: '68c065810005868a248c',
          tableId: 'visits',
          rowId: '68c0660c002eaf43755e',
        })
        const visitCount = parseInt(result.$data.count) || 0
        if (canceled) return
        animateTo(visitCount)
        setCurrentVisitor(visitCount + 1)
      } catch (e) {
        // Fallback to default count
        animateTo(1337)
        setCurrentVisitor(1338)
      }
    }
    load()

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
      alert(`Thanks for signing my guestbook, ${name}!\n\nYour message has been added to my totally rad guestbook! \n\nCome back soon! 😄`)
      const entries = JSON.parse(localStorage.getItem('guestbookEntries') || '[]')
      entries.push({ ...form, date: new Date().toLocaleDateString() })
      localStorage.setItem('guestbookEntries', JSON.stringify(entries))
      onReset()
    } else {
      alert('Please fill in your name and message! 📝')
    }
  }

  return (
    <div className="guestbook-section">
      <h3 className="section-title">✍️ Sign My Guestbook! ✍️</h3>
      <form className="guestbook-form" onSubmit={onSubmit} onReset={onReset}>
        <table>
          <tbody>
            <tr>
              <td>Name:</td>
              <td><input name="name" type="text" size={30} value={form.name} onChange={onChange} /></td>
            </tr>
            <tr>
              <td>Email:</td>
              <td><input name="email" type="email" size={30} value={form.email} onChange={onChange} /></td>
            </tr>
            <tr>
              <td>Homepage:</td>
              <td><input name="homepage" type="url" size={30} placeholder="http://" value={form.homepage} onChange={onChange} /></td>
            </tr>
            <tr>
              <td valign="top">Message:</td>
              <td><textarea name="message" rows={4} cols={40} placeholder="Leave your mark on the information superhighway!" value={form.message} onChange={onChange} /></td>
            </tr>
            <tr>
              <td colSpan={2} align="center">
                <input type="submit" value="Sign Guestbook!" className="submit-button" />
                <input type="reset" value="Clear Form" className="reset-button" />
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
        <blink>UNDER CONSTRUCTION</blink>
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
      <marquee direction="left" scrollAmount={2}>⭐ Thanks for visiting my homepage! Don't forget to bookmark this page! ⭐</marquee>
      <div className="footer-content">
        <p>This page is best viewed with:</p>
        <div className="browser-badges">
          <img alt="Netscape Now!" width="80" height="15" style={{background: 'linear-gradient(45deg, #ff0000, #00ff00)', color: 'white'}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" />
          <img alt="Internet Explorer" width="80" height="15" style={{background: 'blue', color: 'white'}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" />
        </div>
        <p className="copyright">© 1995 - This page created with Notepad and pure HTML!</p>
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

  // Right-click protection for fun
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      alert('Nice try! But this page is protected by the latest in 90s security technology! 🔒\n\n(Just kidding - this is just for the authentic 90s experience!)')
    }
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  // Link hover status
  useEffect(() => {
    const over = (e) => {
      if (e.target.tagName === 'A') {
        if (window.status !== undefined) window.status = 'Click here to visit: ' + e.target.href
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
      '🌟 This site is totally rad! 🌟',
      '💫 Welcome to cyberspace! 💫',
      "🎉 You've found the coolest page! 🎉",
      '🚀 Surfing the information superhighway! 🚀',
      '💻 HTML is the future! 💻',
    ]
    const baseTitle = 'Welcome to My Totally Rad Website! - Last Updated: December 1995'
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
    alert('🎮 KONAMI CODE ACTIVATED! 🎮\n\nYou have unlocked the secret 90s power-user mode!\n\nYou are truly a master of the information superhighway!')
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
          <h2 className="rainbow-text">Welcome to my totally rad corner of the World Wide Web!</h2>
          <p>Greetings, fellow netizen! You have stumbled upon the most <strong>AWESOME</strong> homepage on the entire Internet! This site was lovingly crafted using the latest in HTML technology and is best viewed with Netscape Navigator 2.0+!</p>
        </div>

        <table className="main-table" border="2" cellPadding="10" cellSpacing="5">
          <tbody>
            <tr>
              <td className="sidebar" bgColor="#FF00FF">
                <h3>🎵 COOL LINKS 🎵</h3>
                <ul className="link-list">
                  <li><a href="#" className="cool-link">My Geocities Page</a></li>
                  <li><a href="#" className="cool-link">WebRing Central</a></li>
                  <li><a href="#" className="cool-link">ICQ Me: 12345678</a></li>
                  <li><a href="#" className="cool-link">Sign My Guestbook!</a></li>
                  <li><a href="#" className="cool-link">Email Me!</a></li>
                </ul>
                <VisitorCounter />
              </td>
              <td className="content-area" bgColor="#00FFFF">
                <h3 className="section-title">📰 Latest News & Updates 📰</h3>
                <div className="news-item">
                  <h4>🆕 December 15, 1995</h4>
                  <p>Added a totally rad new background pattern! Also got my hands on this awesome spinning globe GIF. The future is now!</p>
                </div>
                <div className="news-item">
                  <h4>🆕 December 1, 1995</h4>
                  <p>Welcome to my homepage! Still working on getting everything perfect. Check back soon for more updates!</p>
                </div>
                <h3 className="section-title">🎨 About This Site 🎨</h3>
                <p>This webpage represents the cutting edge of web design circa 1995! Features include:</p>
                <ul>
                  <li>Animated text and backgrounds</li>
                  <li>Bright, eye-catching colors</li>
                  <li>Table-based layout (the future of web design!)</li>
                  <li>Visitor counter technology</li>
                  <li>100% HTML 3.2 compliant</li>
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
