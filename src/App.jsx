import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { Account, Client } from 'appwrite'
import AIPage from './pages/AIPage'
import AuthPage from './pages/AuthPage'
import RegistrationPage from './pages/RegistrationPage'
import AccountPage from './pages/AccountPage'
import FileHostingPage from './pages/FileHostingPage'
import VerifyEmailPage from './pages/VerifyEmailPage'

const TOGGLE_COUNT = 400
const COOKIE_KEYS = {
  everOpened: 'tnlmt_ever_opened',
  choice: 'tnlmt_cookie_choice',
  toggles: 'tnlmt_cookie_toggles',
  newsletterSeen: 'tnlmt_newsletter_seen',
}

function readCookie(name) {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))

  if (!cookie) return ''
  return decodeURIComponent(cookie.split('=').slice(1).join('='))
}

function writeCookie(name, value, days = 180) {
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function encodeToggles(toggles) {
  return toggles.map((toggle) => (toggle ? '1' : '0')).join('')
}

function decodeToggles(raw) {
  const safe = typeof raw === 'string' ? raw : ''
  return Array.from({ length: TOGGLE_COUNT }, (_, index) => safe[index] === '1')
}

function makeToggleLabel(index) {
  return `cookie option ${String(index + 1).padStart(3, '0')}`
}

function useKonami(onActivate) {
  useEffect(() => {
    const seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]
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
    if (!active) return undefined

    const create = () => {
      const el = document.createElement('div')
      el.textContent = 'large mike'
      el.style.position = 'fixed'
      el.style.left = `${Math.random() * window.innerWidth}px`
      el.style.top = `${Math.random() * window.innerHeight}px`
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

function useAnnoyanceState(isHome) {
  const initialStateRef = useRef(null)
  if (!initialStateRef.current) {
    const storedChoice = readCookie(COOKIE_KEYS.choice)
    const storedToggles = decodeToggles(readCookie(COOKIE_KEYS.toggles))
    initialStateRef.current = {
      everOpened: readCookie(COOKIE_KEYS.everOpened) === '1',
      choice: storedChoice,
      toggles: storedChoice ? storedToggles : Array(TOGGLE_COUNT).fill(false),
      newsletterSeen: readCookie(COOKIE_KEYS.newsletterSeen) === '1',
    }
  }

  const initial = initialStateRef.current
  const [everOpened, setEverOpened] = useState(initial.everOpened)
  const [cookieChoice, setCookieChoice] = useState(initial.choice)
  const [cookieToggles, setCookieToggles] = useState(initial.toggles)
  const [bannerVisible, setBannerVisible] = useState(isHome && (!initial.everOpened || !initial.choice))
  const [newsletterVisible, setNewsletterVisible] = useState(false)
  const [newsletterSeen, setNewsletterSeen] = useState(initial.newsletterSeen)
  const [closeTick, setCloseTick] = useState(0)

  useEffect(() => {
    if (!isHome) {
      setBannerVisible(false)
      setNewsletterVisible(false)
      return
    }

    if (!everOpened || !cookieChoice) {
      setBannerVisible(true)
    }
  }, [cookieChoice, everOpened, isHome])

  useEffect(() => {
    if (!isHome || !bannerVisible || everOpened) return
    writeCookie(COOKIE_KEYS.everOpened, '1')
    setEverOpened(true)
  }, [bannerVisible, everOpened, isHome])

  useEffect(() => {
    if (!isHome || bannerVisible || newsletterVisible || newsletterSeen || closeTick === 0) return undefined

    const timer = setTimeout(() => {
      setNewsletterVisible(true)
      setNewsletterSeen(true)
      writeCookie(COOKIE_KEYS.newsletterSeen, '1')
    }, 1500)

    return () => clearTimeout(timer)
  }, [bannerVisible, closeTick, isHome, newsletterSeen, newsletterVisible])

  const persistChoice = (choice, toggles) => {
    writeCookie(COOKIE_KEYS.choice, choice)
    writeCookie(COOKIE_KEYS.toggles, encodeToggles(toggles))
    setCookieChoice(choice)
    setCookieToggles(toggles)
  }

  const acceptAll = () => {
    const next = Array(TOGGLE_COUNT).fill(true)
    persistChoice('accept_all', next)
    setBannerVisible(false)
    setCloseTick(Date.now())
  }

  const saveAndClose = () => {
    persistChoice('manual_close', cookieToggles)
    setBannerVisible(false)
    setCloseTick(Date.now())
  }

  const updateToggle = (index) => {
    setCookieToggles((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  return {
    bannerVisible,
    cookieChoice,
    cookieToggles,
    newsletterVisible,
    acceptAll,
    closeNewsletter: () => setNewsletterVisible(false),
    reopenBanner: () => setBannerVisible(true),
    saveAndClose,
    setBannerVisible,
    setCookieToggles,
    updateToggle,
  }
}

function VisitorCounter() {
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
    }

    async function load() {
      try {
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

        const raw = exec?.responseBody || exec?.response || exec?.stdout || exec?.body || ''
        const data = (() => {
          try {
            return JSON.parse(raw)
          } catch {
            return null
          }
        })()

        const visitCount = Number(data?.viewcount ?? data?.count ?? data?.visitnumber ?? data?.visits ?? 0)
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
    return () => {
      canceled = true
    }
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

  const onSubmit = async (e) => {
    e.preventDefault()
    const { name, message } = form
    if (!name || !message) {
      alert('name. message. NOW')
      return
    }

    setLoading(true)
    try {
      const endpoint = (import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1').replace(/\/$/, '')
      const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '68bf36dd001f9ef1d5b6'
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || '68c065810005868a248c'
      const tableId = 'guestlog'

      const payload = {
        rowId: 'unique()',
        data: {
          name: form.name,
          email: form.email || '',
          website: form.website || '',
          message: form.message,
        },
      }

      const res = await fetch(`${endpoint}/tablesdb/${databaseId}/tables/${tableId}/rows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': projectId,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      await res.json()
      alert(`tank u, ${name}!\n\n ok bye`)
      onReset()
      loadEntries()
    } catch (e) {
      console.warn('Guestbook submission failed:', e)
      alert('failed to submit guestbook entry. try again later!')
    } finally {
      setLoading(false)
    }
  }

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
                <input type="submit" value={loading ? 'submitting...' : 'sine'} className="submit-button" disabled={loading} />
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
        <img alt="Loading..." src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAOw==" />
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
          <img alt="Netscape Now!" width="80" height="15" style={{ background: 'linear-gradient(45deg, #ff0000, #00ff00)', color: 'white' }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" />
          <img alt="Internet Explorer" width="80" height="15" style={{ background: 'blue', color: 'white' }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" />
        </div>
        <p className="copyright">© me 2025</p>
        <p className="last-updated">Last updated: <span>{lastUpdated}</span></p>
      </div>
    </footer>
  )
}

function MouseTrail({ active }) {
  const [particles, setParticles] = useState([])
  const lastStampRef = useRef(0)

  useEffect(() => {
    if (!active) {
      setParticles([])
      return undefined
    }

    const labels = ['hi', 'your', 'dumb', 'lmao', ':D', 'fuck yuo', 'meow']

    const onMove = (event) => {
      const now = Date.now()
      if (now - lastStampRef.current < 45) return
      lastStampRef.current = now
      const particle = {
        id: `${now}-${Math.random()}`,
        x: event.clientX,
        y: event.clientY,
        label: labels[Math.floor(Math.random() * labels.length)],
        tilt: Math.round(Math.random() * 24) - 12,
      }
      setParticles((prev) => [...prev.slice(-11), particle])
    }

    const cleanup = setInterval(() => {
      const cutoff = Date.now() - 700
      setParticles((prev) => prev.filter((particle) => Number(particle.id.split('-')[0]) > cutoff))
    }, 120)

    window.addEventListener('mousemove', onMove)
    return () => {
      clearInterval(cleanup)
      window.removeEventListener('mousemove', onMove)
    }
  }, [active])

  if (!active) return null

  return (
    <div className="mouse-trail-layer" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="mouse-trail-particle"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `translate(-50%, -50%) rotate(${particle.tilt}deg)`,
          }}
        >
          {particle.label}
        </span>
      ))}
    </div>
  )
}

function EvasiveButton({ label, className = '', shellClassName = '', onClick, disabled = false, active = true }) {
  const shellRef = useRef(null)
  const buttonRef = useRef(null)
  const lastFleeRef = useRef(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const placeAtCenter = () => {
      const shell = shellRef.current
      const button = buttonRef.current
      if (!shell || !button) return

      const shellRect = shell.getBoundingClientRect()
      const buttonRect = button.getBoundingClientRect()
      const x = Math.max(0, (shellRect.width - buttonRect.width) / 2)
      const y = Math.max(0, (shellRect.height - buttonRect.height) / 2)
      setPosition({ x, y })
    }

    placeAtCenter()
    window.addEventListener('resize', placeAtCenter)
    return () => window.removeEventListener('resize', placeAtCenter)
  }, [label])

  useEffect(() => {
    if (active || disabled) return
    const shell = shellRef.current
    const button = buttonRef.current
    if (!shell || !button) return

    const shellRect = shell.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    setPosition({
      x: Math.max(0, (shellRect.width - buttonRect.width) / 2),
      y: Math.max(0, (shellRect.height - buttonRect.height) / 2),
    })
  }, [active, disabled])

  const flee = (clientX, clientY) => {
    if (!active || disabled) return

    const shell = shellRef.current
    const button = buttonRef.current
    if (!shell || !button) return

    const shellRect = shell.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    const buttonCenterX = buttonRect.left + buttonRect.width / 2
    const buttonCenterY = buttonRect.top + buttonRect.height / 2
    const distance = Math.hypot(clientX - buttonCenterX, clientY - buttonCenterY)

    if (distance > 95) return

    const now = Date.now()
    if (now - lastFleeRef.current < 180) return
    lastFleeRef.current = now

    const maxX = Math.max(0, shellRect.width - buttonRect.width - 4)
    const maxY = Math.max(0, shellRect.height - buttonRect.height - 4)
    const pointerX = clientX - shellRect.left
    const pointerY = clientY - shellRect.top
    const moveX = pointerX < buttonCenterX - shellRect.left ? 54 : -54
    const moveY = pointerY < buttonCenterY - shellRect.top ? 36 : -36
    const jitterX = Math.round((Math.random() - 0.5) * 12)
    const jitterY = Math.round((Math.random() - 0.5) * 10)

    setPosition({
      x: Math.min(maxX, Math.max(0, position.x + moveX + jitterX)),
      y: Math.min(maxY, Math.max(0, position.y + moveY + jitterY)),
    })
  }

  return (
    <span className={`evasive-button-shell ${shellClassName}`} ref={shellRef} onMouseMove={(event) => flee(event.clientX, event.clientY)}>
      <button
        ref={buttonRef}
        type="button"
        className={className}
        disabled={disabled}
        onMouseEnter={(event) => flee(event.clientX, event.clientY)}
        onClick={onClick}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        {label}
      </button>
    </span>
  )
}

function buildAdImageUrl(seed, width, height) {
  return `https://picsum.photos/${width}/${height}?random=${encodeURIComponent(seed)}`
}

const SAMPLE_VIDEO_URLS = [
  'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
]

const PEXELS_VIDEO_QUERIES = [
  'retro computer',
  'city lights',
  'office desk',
  'keyboard typing',
  'traffic',
  'nature',
  'crowd',
  'television static',
]

function cleanEnvValue(value) {
  return typeof value === 'string' ? value.trim().replace(/^['"]|['"]$/g, '') : ''
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function pickPexelsVideoFile(videoFiles = []) {
  const ranked = videoFiles
    .filter((file) => file?.file_type === 'video/mp4' && file?.link)
    .sort((a, b) => {
      const aScore = (a.quality === 'sd' ? 0 : 1) + ((a.width || 0) / 10000)
      const bScore = (b.quality === 'sd' ? 0 : 1) + ((b.width || 0) / 10000)
      return aScore - bScore
    })

  return ranked[0]?.link || ''
}

function useRandomPexelsVideo(enabled) {
  const apiKey = cleanEnvValue(import.meta.env.VITE_PEXELS_API_KEY)
  const [videoState, setVideoState] = useState({ link: '', image: '', photographerUrl: '', photographerName: '' })

  useEffect(() => {
    if (!enabled) return undefined

    let canceled = false

    async function loadVideo() {
      if (!apiKey) {
        if (!canceled) {
          setVideoState({
            link: pickRandom(SAMPLE_VIDEO_URLS),
            image: '',
            photographerUrl: 'https://www.pexels.com/api/',
            photographerName: 'sample fallback',
          })
        }
        return
      }

      try {
        const query = pickRandom(PEXELS_VIDEO_QUERIES)
        const response = await fetch(`https://api.pexels.com/v1/videos/search?query=${encodeURIComponent(query)}&orientation=landscape&size=small&per_page=40&page=1`, {
          headers: {
            Authorization: apiKey,
          },
        })

        if (!response.ok) throw new Error(`Pexels HTTP ${response.status}`)
        const data = await response.json()
        const choices = (data?.videos || [])
          .map((video) => ({
            link: pickPexelsVideoFile(video.video_files),
            image: video.image || video.video_pictures?.[0]?.picture || '',
            photographerUrl: video.url || 'https://www.pexels.com',
            photographerName: video.user?.name || 'Pexels',
          }))
          .filter((video) => video.link)

        if (!choices.length) throw new Error('No Pexels video choices')
        if (!canceled) setVideoState(pickRandom(choices))
      } catch (error) {
        console.warn('Pexels video fallback:', error)
        if (!canceled) {
          setVideoState({
            link: pickRandom(SAMPLE_VIDEO_URLS),
            image: '',
            photographerUrl: 'https://www.pexels.com/api/',
            photographerName: 'sample fallback',
          })
        }
      }
    }

    loadVideo()
    return () => {
      canceled = true
    }
  }, [apiKey, enabled])

  return videoState
}

function shuffleArray(list) {
  const copy = [...list]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

function buildSidePlacements(side) {
  const baseSlots = side === 'left'
    ? [
        { top: `${4 + Math.floor(Math.random() * 5)}%`, left: `${Math.floor(Math.random() * 8)}%` },
        { top: `${48 + Math.floor(Math.random() * 6)}%`, left: `${Math.floor(Math.random() * 12)}%` },
      ]
    : [
        { top: `${8 + Math.floor(Math.random() * 6)}%`, right: `${Math.floor(Math.random() * 8)}%` },
        { top: `${50 + Math.floor(Math.random() * 6)}%`, right: `${Math.floor(Math.random() * 12)}%` },
      ]

  return shuffleArray(baseSlots)
}

function FakeAdBox({ title, body, variant = '', imageSeed = 'ad', imageAlt = 'Advertisement image', evasiveClose = true, style, mediaType = 'image', videoData = null, className = '' }) {
  const [stage, setStage] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const imageToken = useMemo(() => `${imageSeed}-${Math.random().toString(36).slice(2, 10)}`, [imageSeed])
  const headlines = [
    title,
    'Youre Tonsilitis is cureable with this one weird trick',
    'Hot singles in your area are shocked that this works',
    'Free robux',
  ]
  const lines = [
    body,
    'test',
    'aaaaaaaaaaaaaaaaa',
    'wooohooo',
  ]

  if (dismissed) return null

  return (
    <aside className={`fake-ad-box ${variant} ${className}`.trim()} style={style}>
      <div className="fake-ad-media">
        {mediaType === 'video' && videoData?.link ? (
          <video className="fake-ad-video" src={videoData.link} poster={videoData.image || undefined} autoPlay muted loop playsInline preload="metadata" />
        ) : (
          <img
            className="fake-ad-image"
            src={buildAdImageUrl(imageToken, variant === 'compact' ? 320 : 420, variant === 'compact' ? 220 : 260)}
            alt={imageAlt}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
      <p className="fake-ad-tag">ad slot</p>
      <h4>{headlines[Math.min(stage, headlines.length - 1)]}</h4>
      <marquee className="fake-ad-marquee" scrollAmount={variant === 'compact' ? 3 : 5}>
        HOT DEALS ++ DOWNLOAD NOW ++ FREE GIFT ++ LIMITED TIME ++ BONUS VALUE ++
      </marquee>
      <div className="fake-ad-badges">
        <span>NEW</span>
        <span>HOT</span>
        <span>holt moly</span>
      </div>
      <p>{lines[Math.min(stage, lines.length - 1)]}</p>
      {mediaType === 'video' && videoData?.photographerUrl && (
        <p className="fake-ad-credit">
          <a href={videoData.photographerUrl} target="_blank" rel="noreferrer">Video via Pexels</a>
          {' '}
          <span>{videoData.photographerName}</span>
        </p>
      )}
      {evasiveClose ? (
        <EvasiveButton
          label={stage === 0 ? 'close' : 'close again'}
          className="fake-ad-close"
          shellClassName="ad-close-shell"
          onClick={() => setStage((prev) => (prev + 1) % headlines.length)}
        />
      ) : (
        <div className="ad-close-shell ad-close-shell-static">
          <button type="button" className="fake-ad-close fake-ad-close-static" onClick={() => setDismissed(true)}>
            close
          </button>
        </div>
      )}
    </aside>
  )
}

function FloatingAds() {
  const videoAdIndex = useMemo(() => Math.floor(Math.random() * 5), [])
  const pexelsVideo = useRandomPexelsVideo(true)
  const leftPlacements = useMemo(() => {
    const slots = buildSidePlacements('left')
    return slots.map((slot, index) => ({
      position: 'fixed',
      top: index === 0 ? `${170 + Math.floor(Math.random() * 42)}px` : `${Math.max(360, Math.round(window.innerHeight * 0.54)) + Math.floor(Math.random() * 30)}px`,
      left: slot.left || '0%',
    }))
  }, [])
  const rightPlacements = useMemo(() => {
    const slots = buildSidePlacements('right')
    return slots.map((slot, index) => ({
      position: 'fixed',
      top: index === 0 ? `${198 + Math.floor(Math.random() * 42)}px` : `${Math.max(395, Math.round(window.innerHeight * 0.58)) + Math.floor(Math.random() * 28)}px`,
      right: slot.right || '0%',
    }))
  }, [])
  const leftAds = useMemo(() => ([
    { title: 'Big News!', body: 'doctors hate this one simple trick', variant: 'compact', imageSeed: 'left-1', imageAlt: 'Random ad image 1', style: leftPlacements[0], mediaType: videoAdIndex === 0 ? 'video' : 'image' },
    { title: '9999 hot singles need you NOW', body: '(donload me.)[https:virus.com', variant: 'compact', imageSeed: 'left-2', imageAlt: 'Random ad image 2', style: leftPlacements[1], mediaType: videoAdIndex === 1 ? 'video' : 'image' },
  ]), [leftPlacements, videoAdIndex])

  const rightAds = useMemo(() => ([
    { title: 'Your fingies desevre a  break', body: 'app.', variant: 'compact', imageSeed: 'right-1', imageAlt: 'Random ad image 3', style: rightPlacements[0], mediaType: videoAdIndex === 2 ? 'video' : 'image' },
    { title: 'Downlaod ram', body: 'A ram.', variant: 'compact', imageSeed: 'right-2', imageAlt: 'Random ad image 4', style: rightPlacements[1], mediaType: videoAdIndex === 3 ? 'video' : 'image' },
  ]), [rightPlacements, videoAdIndex])

  return (
    <>
      {leftAds.map((ad) => (
        <FakeAdBox key={ad.imageSeed} {...ad} className="floating-side-ad" videoData={ad.mediaType === 'video' ? pexelsVideo : null} />
      ))}
      {rightAds.map((ad) => (
        <FakeAdBox key={ad.imageSeed} {...ad} className="floating-side-ad" videoData={ad.mediaType === 'video' ? pexelsVideo : null} />
      ))}
      <div className="bottom-ad-ribbon">
        <FakeAdBox title="Breaking; your scrolling has value" body="Upgrade to ad-free for just 900000." variant="ribbon" imageSeed="bottom-1" imageAlt="Random ad image 5" evasiveClose={false} mediaType={videoAdIndex === 4 ? 'video' : 'image'} videoData={videoAdIndex === 4 ? pexelsVideo : null} />
      </div>
    </>
  )
}

function CookieBanner({ cookieChoice, toggles, onAcceptAll, onClose, onToggle }) {
  const labels = useMemo(() => Array.from({ length: TOGGLE_COUNT }, (_, index) => makeToggleLabel(index)), [])
  const enabledCount = toggles.filter(Boolean).length

  return (
    <div className="hostile-overlay">
      <section className="cookie-banner">
        <p className="cookie-kicker">cookies</p>
        <h2>cookie settings</h2>
        <p>
          hey you got {TOGGLE_COUNT} toggles lmao dumbass
        </p>
        <p className="cookie-summary">
          Status: {cookieChoice ? cookieChoice.replace('_', ' ') : 'unset'}.
          Enabled: {enabledCount}/{TOGGLE_COUNT}.
        </p>
        <div className="cookie-actions">
          <button type="button" className="accept-all-button" onClick={onAcceptAll}>ACCEPT ALL</button>
          <span className="cookie-note">yar har har</span>
        </div>
        <div className="cookie-grid" role="group" aria-label="400 fake cookie toggles">
          {labels.map((label, index) => (
            <label key={label} className={`cookie-toggle ${toggles[index] ? 'checked' : ''}`}>
              <input type="checkbox" checked={toggles[index]} onChange={() => onToggle(index)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <div className="cookie-footer">
          <button type="button" className="trap-button" onClick={onClose}>save 400 decisions and continue</button>
          <EvasiveButton label="close" className="humiliation-close evasive-control" shellClassName="cookie-close-shell" onClick={onClose} />
        </div>
      </section>
    </div>
  )
}

function NewsletterPopup({ visible, onClose }) {
  const [email, setEmail] = useState('')
  const [closeReady, setCloseReady] = useState(false)
  const [submitText, setSubmitText] = useState('SUBMIT')

  useEffect(() => {
    if (!visible) {
      setCloseReady(false)
      setSubmitText('SUBMIT')
      return undefined
    }

    const timer = setTimeout(() => setCloseReady(true), 850)
    return () => clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  const onSubmit = (event) => {
    event.preventDefault()
    setSubmitText(email ? 'SUBMITTED' : 'ENTER EMAIL')
  }

  return (
    <div className="hostile-overlay hostile-overlay-newsletter">
      <section className="newsletter-popup">
        <p className="cookie-kicker">newsletter</p>
        <h2>signup</h2>
        <p>hi pls sign up i wont seell your emale.</p>
        <form className="newsletter-form" onSubmit={onSubmit}>
          <input
            type="email"
            value={email}
            placeholder="email"
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" className="accept-all-button newsletter-submit">{submitText}</button>
        </form>
        <EvasiveButton
          label={closeReady ? 'close' : 'close'}
          className={`humiliation-close newsletter-close evasive-control ${closeReady ? 'ready' : 'locked'}`}
          shellClassName="newsletter-close-shell"
          onClick={onClose}
          disabled={!closeReady}
          active={closeReady}
        />
      </section>
    </div>
  )
}

function TrapZone({ visible, onDismiss }) {
  const [progress, setProgress] = useState(14)
  const [swapped, setSwapped] = useState(false)

  useEffect(() => {
    if (!visible) return undefined

    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 96 ? 12 : prev + 7))
    }, 500)

    return () => clearInterval(timer)
  }, [visible])

  if (!visible) return null

  return (
    <div className="exit-trap">
      <section className="exit-trap-card">
        <p className="cookie-kicker">trap</p>
        <h3>loading</h3>
        <div className="trap-progress-shell">
          <div className="trap-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p>MEEEEEEEEEEOW.</p>
        <div className={`trap-decision-row ${swapped ? 'swapped' : ''}`}>
          <button type="button" className="trap-button" onMouseEnter={() => setSwapped((prev) => !prev)} onClick={onDismiss}>close</button>
          <button type="button" className="trap-button secondary" onMouseEnter={() => setSwapped((prev) => !prev)} onClick={onDismiss}>stay</button>
        </div>
      </section>
    </div>
  )
}

function InlineAdStrip() {
  return (
    <section className="inline-ad-strip">
      <FakeAdBox title="Hey" body="pronhub.com" imageSeed="inline-1" imageAlt="Random ad image 6" />
      <FakeAdBox title="FREE ANTIVIRUS" body="Download Kaspersky for free" imageSeed="inline-2" imageAlt="Random ad image 7" />
      <FakeAdBox title="INSURANCE OFFER" body="Cover death today!" imageSeed="inline-3" imageAlt="Random ad image 8" />
    </section>
  )
}

function HomePage({ user, annoyances, exitTrapVisible }) {
  return (
    <>
      <FloatingAds />
      <MouseTrail active />
      <TrapZone visible={exitTrapVisible} onDismiss={annoyances.dismissExitTrap} />
      <NewsletterPopup visible={annoyances.newsletterVisible} onClose={annoyances.closeNewsletter} />
      {annoyances.bannerVisible && (
        <CookieBanner
          cookieChoice={annoyances.cookieChoice}
          toggles={annoyances.cookieToggles}
          onAcceptAll={annoyances.acceptAll}
          onClose={annoyances.saveAndClose}
          onToggle={annoyances.updateToggle}
        />
      )}

      <div className="welcome-section">
        <h2 className="rainbow-text">rainbow cool</h2>
        <p>idk what to put here</p>
      </div>

      <InlineAdStrip />

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
              <FakeAdBox title="hey babey" body="yeah YOU. got foot fungus? ok." imageSeed="sidebar-1" imageAlt="Random ad image 9" />
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
              <div className="news-item trap-news">
                <h4>update 3</h4>
                <p>meow</p>
                <div className="trap-decision-row inline">
                  <button type="button" className="trap-button">button</button>
                  <button type="button" className="trap-button secondary">button</button>
                </div>
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
  )
}

function AppShell() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [konamiActive, setKonamiActive] = useState(false)
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [exitTrapVisible, setExitTrapVisible] = useState(false)
  const annoyances = useAnnoyanceState(isHome)
  const introAlertRef = useRef(false)

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
    if (introAlertRef.current) return undefined
    introAlertRef.current = true
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
        if (window.status !== undefined) window.status = `click: ${e.target.href}`
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

  useEffect(() => {
    const messages = ['bananas', 'helo', 'idk', 'html', 'websit']
    const baseTitle = 'helo html5'
    document.title = baseTitle
    const id = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)]
      const prev = document.title.split(' - ')[1]
      document.title = `${msg} - ${prev || 'sigma'}`
      setTimeout(() => {
        document.title = baseTitle
      }, 3000)
    }, 15000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!isHome) {
      setExitTrapVisible(false)
      return undefined
    }

    const onLeaveTop = (event) => {
      if (event.clientY <= 0) {
        setExitTrapVisible(true)
      }
    }

    document.addEventListener('mouseout', onLeaveTop)
    return () => document.removeEventListener('mouseout', onLeaveTop)
  }, [isHome])

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
    <div className={`container ${konamiActive ? 'konami-active' : ''} ${checkingAuth ? 'auth-checking' : ''}`}>
      <Header />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={(
              <HomePage
                user={user}
                annoyances={{
                  ...annoyances,
                  dismissExitTrap: () => setExitTrapVisible(false),
                }}
                exitTrapVisible={exitTrapVisible}
              />
            )}
          />
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
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
