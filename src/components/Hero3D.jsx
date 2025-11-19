import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Html,
  useCursor,
  OrbitControls,
  Environment,
  Stars,
  Cloud,
  ContactShadows,
  Float,
  Sparkles,
  Icosahedron,
  Torus
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import Data from '../data'

// Broad categories and keywords
const CATEGORIES = ['Frontend', 'Backend', 'Machine Learning', 'Computer Vision', 'Data', 'Tools']
const CATEGORY_KEYWORDS = {
  Frontend: ['react', 'javascript', 'typescript', 'html', 'css', 'ui', 'ux', 'frontend'],
  Backend: ['node', 'java', 'spring', 'backend', 'api', 'server', 'mongodb', 'sql', 'database', 'fastapi', 'express'],
  'Machine Learning': ['machine learning', 'ml', 'tensorflow', 'scikit', 'sklearn', 'pandas', 'classification', 'regression'],
  'Computer Vision': ['opencv', 'mediapipe', 'vision', 'image', 'cnn', 'asl', 'gesture'],
  Data: ['data', 'analytics', 'pandas', 'altair', 'visualization'],
  Tools: ['blockchain', 'docker', 'ci', 'git', 'testing', 'devtools']
}

const CATEGORY_GROUPS = [...CATEGORIES, 'Other']

function FloatingShapes() {
  return (
    <group>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Icosahedron args={[1, 0]} position={[-15, 8, -10]} rotation={[0.5, 0, 0]}>
          <meshStandardMaterial color="#8b5cf6" wireframe />
        </Icosahedron>
      </Float>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
        <Torus args={[0.8, 0.2, 16, 32]} position={[18, -5, -12]} rotation={[0, 1, 0]}>
          <meshStandardMaterial color="#06b6d4" wireframe />
        </Torus>
      </Float>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={2}>
        <Icosahedron args={[0.8, 0]} position={[10, 10, -15]}>
          <meshStandardMaterial color="#a78bfa" transparent opacity={0.4} />
        </Icosahedron>
      </Float>
      <Float speed={2.5} rotationIntensity={2} floatIntensity={1}>
        <Torus args={[0.6, 0.15, 16, 32]} position={[-12, -8, -8]} rotation={[1, 0, 1]}>
          <meshStandardMaterial color="#6dd3ff" transparent opacity={0.3} />
        </Torus>
      </Float>
    </group>
  )
}

function DroneSwarm({ count = 30, radius = 4.0 }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        r: radius * (0.8 + Math.random() * 0.4),
        speed: 0.1 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        height: -1 + Math.random() * 2,
        scale: 0.05 + Math.random() * 0.08
      })),
    [count, radius]
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!mesh.current) return
    data.forEach((d, i) => {
      const ang = t * d.speed + d.phase
      const x = Math.cos(ang) * d.r
      const z = Math.sin(ang) * d.r
      const y = Math.sin(t * (0.5 + (i % 3) * 0.1) + d.phase) * 0.2 + d.height
      dummy.position.set(x, y, z)
      dummy.scale.set(d.scale, d.scale, d.scale)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} toneMapped={false} />
    </instancedMesh>
  )
}

function Diorama() {
  const group = useRef()
  const panels = useMemo(() => {
    const out = []
    const count = 8
    const radius = 2.4
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      out.push({
        pos: [Math.cos(a) * radius, -0.2 + Math.sin(a * 3) * 0.15, Math.sin(a) * radius],
        rot: -a + Math.PI / 6,
        color: i % 2 ? '#8b5cf6' : '#06b6d4'
      })
    }
    return out
  }, [])

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.05
  })

  return (
    <group ref={group} position={[0, -0.8, 0]}>
      {/* central glowing orb */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.7, 64, 64]} />
        <meshPhysicalMaterial
          color="#8b5cf6"
          emissive="#5b21b6"
          emissiveIntensity={2}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* inner core */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color="#fff" />
      </mesh>

      {/* subtle orbit rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 3.2, 64]} />
        <meshBasicMaterial color="#8b5cf6" opacity={0.03} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[1.8, 1.85, 64]} />
        <meshBasicMaterial color="#06b6d4" opacity={0.1} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* floating project panels */}
      {panels.map((p, i) => (
        <Float key={i} speed={1 + (i % 3) * 0.2} rotationIntensity={0.4} floatIntensity={0.8}>
          <group position={p.pos} rotation={[0, p.rot, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1, 0.6, 0.05]} />
              <meshPhysicalMaterial
                color={p.color}
                roughness={0.2}
                metalness={0.8}
                transmission={0.2}
                thickness={0.5}
              />
            </mesh>
            {/* Tech detail */}
            <mesh position={[0, -0.35, 0]}>
              <boxGeometry args={[0.6, 0.02, 0.6]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
            </mesh>
          </group>
        </Float>
      ))}

      {/* ambience sparkles */}
      <Sparkles count={50} scale={[5, 3, 5]} size={4} speed={0.2} color="#a78bfa" opacity={0.5} />
    </group>
  )
}

function CameraRig({ target, parallaxRef, lookAtRef }) {
  const { camera } = useThree()
  const smoothLook = useRef(new THREE.Vector3(0, 0, 0))
  const targetVec = useRef(new THREE.Vector3())
  const offsetVec = useRef(new THREE.Vector3())
  const desiredLook = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const [px, py] = parallaxRef.current || [0, 0]

    // Enhanced parallax effect
    offsetVec.current.set(px * 1.5, py * 0.8, px * -0.5)
    targetVec.current.set(target[0], target[1], target[2]).add(offsetVec.current)

    const lerpFactor = 1 - Math.exp(-delta * 4) // smoother damping

    camera.position.lerp(targetVec.current, lerpFactor)

    if (lookAtRef.current) {
      desiredLook.current.copy(lookAtRef.current)
    } else {
      desiredLook.current.set(0, 0, 0)
    }

    desiredLook.current.x += px * 0.6
    desiredLook.current.y += py * 0.6

    smoothLook.current.lerp(desiredLook.current, lerpFactor)
    camera.lookAt(smoothLook.current)
  })

  return null
}

// normalize tags helper (handles arrays or comma-separated strings)
function getTags(item) {
  if (!item) return []
  if (Array.isArray(item.tags)) return item.tags
  if (Array.isArray(item.tech)) return item.tech
  if (typeof item.tags === 'string') return item.tags.split(/\s*,\s*/).filter(Boolean)
  if (typeof item.tech === 'string') return item.tech.split(/\s*,\s*/).filter(Boolean)
  return []
}

// helper: test whether a project matches a given broad category (allows multiple matches)
function projectMatchesCategory(p, cat) {
  const kws = CATEGORY_KEYWORDS[cat] || []
  const tags = (getTags(p) || []).map((t) => String(t).toLowerCase())
  const techString = String(p.tech || p.tags || '').toLowerCase()

  for (const kw of kws) {
    const kwLower = kw.toLowerCase()
    if (tags.some((t) => t.includes(kwLower)) || techString.includes(kwLower)) return true
  }
  return false
}

// helper to render badges (used in multiple places)
function TechBadges({ item, onClickBadge }) {
  const tags = getTags(item) || []
  const visible = tags.slice(0, 3)
  const more = tags.length - visible.length
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
      {visible.map((t, i) => (
        <button
          key={t + i}
          className="tech-badge"
          onClick={(e) => {
            e.stopPropagation()
            onClickBadge && onClickBadge(t)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation()
              onClickBadge && onClickBadge(t)
            }
          }}
          aria-label={`Filter by ${t}`}
        >
          {t}
        </button>
      ))}
      {more > 0 && <div className="tech-badge more">+{more}</div>}
    </div>
  )
}

export default function Scene3D({ full = false }) {
  const [target, setTarget] = useState([0, 0.5, 15])
  const [currentSection, setCurrentSection] = useState('home')
  const parallaxRef = useRef([0, 0])
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0))
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedTag, setSelectedTag] = useState('All')

  const lastMoveRef = useRef(0)

  // Projects panel HTML
  const projectsHtml = (
    <div className="panel projects-panel">
      <h2>Projects</h2>

      <div className="projects-layout">
        {/* Left: category sidebar */}
        <aside className="sidebar">
          <div className="sidebar-title">Categories</div>
          <div className="category-list">
            {CATEGORIES.map((t) => (
              <button
                key={t}
                className={`chip ${t === selectedTag ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTag(t)
                  setSelectedProject(null)
                }}
              >
                {t}
              </button>
            ))}
            <button
              className={`chip ${selectedTag === 'All' ? 'active' : ''}`}
              onClick={() => {
                setSelectedTag('All')
                setSelectedProject(null)
              }}
            >
              All
            </button>
          </div>
        </aside>

        {/* Center: scrollable projects list (grouped by category) */}
        <section className="projects-scroll">
          {CATEGORY_GROUPS.map((cat) => {
            const items = Data.filter((p) => {
              if (cat === 'Other') {
                const matched = CATEGORIES.some((c) => projectMatchesCategory(p, c))
                return !matched
              }
              return projectMatchesCategory(p, cat)
            })

            if (selectedTag !== 'All' && selectedTag !== cat) return null
            if (items.length === 0) return null

            return (
              <div key={cat} className="project-group">
                <h4 className="group-title">{cat}</h4>
                <div className="project-grid">
                  {items.map((p, idx) => (
                    <div
                      key={p.id || p.name || idx}
                      className="project-card"
                      onClick={() => setSelectedProject(p)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="project-card-title">{p.title || p.name}</div>
                      <div className="project-card-desc">{p.summary || p.description}</div>
                      <TechBadges
                        item={p}
                        onClickBadge={(t) => {
                          setSelectedTag(t)
                          setSelectedProject(null)
                        }}
                      />
                      <div className="card-actions">
                        <a className="github-link" href={p.link || '#'} target="_blank" rel="noreferrer">
                          View on GitHub
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      </div>

      {/* project detail view */}
      {selectedProject && (
        <div className="project-detail-panel">
          <button className="back" onClick={() => setSelectedProject(null)}>
            ← Back
          </button>
          <h3>{selectedProject.title || selectedProject.name}</h3>
          <p className="muted">{selectedProject.summary || selectedProject.description}</p>
          <div className="tech">{getTags(selectedProject).join(', ')}</div>
          <a className="btn" href={selectedProject.link || '#'} target="_blank" rel="noreferrer">
            Open Project
          </a>
        </div>
      )}
    </div>
  )

  const basePanels = [
    {
      id: 'home',
      pos: [0, 0, -1],
      title: 'Home',
      html: (
        <div className="panel">
          <h1>Hi, I&apos;m Tushar</h1>
          <p>Computational Mathematics @ UBC • Full-Stack & AI Developer</p>
        </div>
      )
    },
    {
      id: 'projects',
      pos: [50, 0, -5],
      title: 'Projects',
      html: projectsHtml
    },
    {
      id: 'about',
      pos: [-30, 0, -5],
      title: 'About',
      html: (
        <div className="panel">
          <h2>About</h2>
          <p>
            I&apos;m Tushar — a software developer and Computational Math student at UBC who loves building practical tools
            that make developers and teams faster. I enjoy working across the stack, especially where backend engineering,
            AI, and real-world problem solving intersect. I&apos;ve built full-stack applications using FastAPI, React,
            TensorFlow, LangChain, and cloud tooling, and recently created <strong>Code Lantern</strong>, an AI-powered
            architecture analyzer developed during an 18-hour hackathon (with about 15 minutes of sleep). I&apos;m driven by
            curiosity, fast iteration, and the desire to turn complex technical problems into clean, reliable systems.
          </p>
        </div>
      )
    },
    {
      id: 'contact',
      pos: [0, -15, -2],
      title: 'Contact',
      html: (
        <div className="panel">
          <h2>Contact</h2>
          <p>
            <a href="mailto:tushar.bzp05@gmail.com">tushar.bzp05@gmail.com</a>
          </p>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/tushar-jindal-97602420b/" target="_blank" rel="noreferrer" className="social-link linkedin">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>LinkedIn</span>
            </a>
            <a href="https://github.com/Tjindl" target="_blank" rel="noreferrer" className="social-link github">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
            <a href="https://medium.com/@tushar.bzp05" target="_blank" rel="noreferrer" className="social-link medium">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
              </svg>
              <span>Medium</span>
            </a>
          </div>
        </div>
      )
    }
  ]

  const panels = [...basePanels]

  const navigateTo = (id) => {
    const p = panels.find((panel) => panel.id === id)
    if (!p) return
    setTarget([p.pos[0], p.pos[1] + 0.5, 15])
    lookAtRef.current.set(p.pos[0], p.pos[1], p.pos[2] || 0)
    setCurrentSection(id)
    setSelectedProject(null)
  }

  useEffect(() => {
    const onMove = (e) => {
      const now = performance.now()
      if (now - lastMoveRef.current < 16) return // ~60 fps throttling
      lastMoveRef.current = now

      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      parallaxRef.current = [x * 0.5, -y * 0.4]
    }

    const onOrient = (ev) => {
      const gx = ev.gamma || 0
      const gy = ev.beta || 0
      const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
      parallaxRef.current = [
        clamp(gx / 30, -1, 1) * 0.5,
        clamp(gy / 30, -1, 1) * 0.4
      ]
    }

    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedProject(null)

      // Navigation logic
      if (e.key === 'ArrowLeft') {
        if (currentSection === 'home') navigateTo('about')
        else if (currentSection === 'projects') navigateTo('home')
      } else if (e.key === 'ArrowRight') {
        if (currentSection === 'home') navigateTo('projects')
        else if (currentSection === 'about') navigateTo('home')
      } else if (e.key === 'ArrowDown') {
        if (currentSection === 'home') navigateTo('contact')
      } else if (e.key === 'ArrowUp') {
        if (currentSection === 'contact') navigateTo('home')
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onOrient, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('deviceorientation', onOrient)
      window.removeEventListener('keydown', onKey)
    }
  }, [currentSection])

  const handlePanelPointer = (e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    const rx = -py * 6
    const ry = px * 6
    el.style.transition = 'transform 0.1s ease-out'
    el.style.transform = `perspective(800px) translateZ(10px) rotateX(${rx}deg) rotateY(${ry}deg)`
  }

  const handlePanelLeave = (e) => {
    const el = e.currentTarget
    el.style.transition = 'transform 0.3s ease-out'
    el.style.transform = 'perspective(800px) translateZ(0px) rotateX(0deg) rotateY(0deg)'
  }

  return (
    <div className="stage">
      <nav className="stage-nav">
        <div className="logo">Tushar</div>
        <div className="links">
          {basePanels.map((p) => (
            <button key={p.id} onClick={() => navigateTo(p.id)} className={currentSection === p.id ? 'active' : ''}>
              {p.title}
            </button>
          ))}
        </div>
      </nav>

      {/* UI Navigation Arrows */}
      <div className="nav-arrows">
        {currentSection === 'home' && (
          <>
            <button className="arrow-btn left" onClick={() => navigateTo('about')}>← About</button>
            <button className="arrow-btn right" onClick={() => navigateTo('projects')}>Projects →</button>
            <button className="arrow-btn down" onClick={() => navigateTo('contact')}>Contact ↓</button>
          </>
        )}
        {currentSection === 'about' && (
          <button className="arrow-btn right" onClick={() => navigateTo('home')}>Home →</button>
        )}
        {currentSection === 'projects' && (
          <button className="arrow-btn left" onClick={() => navigateTo('home')}>← Home</button>
        )}
        {currentSection === 'contact' && (
          <button className="arrow-btn up" onClick={() => navigateTo('home')}>↑ Home</button>
        )}
      </div>

      {/* Floating Resume Button */}
      <a
        href="/portfolio_new/Resume_latest.pdf"
        download="Tushar_Jindal_Resume.pdf"
        className="floating-resume-btn"
        aria-label="Download Resume"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>Resume</span>
      </a>

      <Canvas
        className={`canvas ${full ? 'full-canvas' : ''}`}
        style={{ height: '100%' }}
        camera={{ position: [0, 0.5, 15], fov: 50 }}
        shadows
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 10, 40]} />

        <ambientLight intensity={0.4} />
        <directionalLight castShadow position={[5, 8, 5]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-5, 2, -5]} intensity={1} color="#8b5cf6" />

        <Suspense fallback={<Html center>Loading 3D...</Html>}>
          <Environment preset="city" blur={0.8} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Cloud opacity={0.3} speed={0.2} width={10} depth={1.5} segments={20} position={[0, -2, -5]} color="#1e293b" />
          <Sparkles count={200} scale={[30, 20, 20]} size={4} speed={0.4} opacity={0.5} color="#ffffff" />

          <Diorama />
          <DroneSwarm />
          <FloatingShapes />

          <ContactShadows position={[0, -1.6, 0]} opacity={0.5} blur={2} far={4} />

          {panels.map((p) => (
            <group key={p.id} position={p.pos}>
              <Html center transform distanceFactor={10}>
                <div
                  className={`panel-3d ${p.id === 'projects' ? 'panel-3d--wide' : ''}`}
                  onPointerMove={handlePanelPointer}
                  onPointerLeave={handlePanelLeave}
                  onClick={() => navigateTo(p.id)}
                >
                  {p.html}
                </div>
              </Html>
            </group>
          ))}
        </Suspense>

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.5} radius={0.4} />
        </EffectComposer>

        <CameraRig target={target} parallaxRef={parallaxRef} lookAtRef={lookAtRef} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  )
}
