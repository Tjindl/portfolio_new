import React, { Suspense } from 'react'
import Home from './pages/Home'
import { Loader } from '@react-three/drei'
import './styles.css'

export default function App() {
  return (
    <>
      <Home />
      <Loader
        containerStyles={{ background: '#050505' }}
        innerStyles={{ background: '#1e293b', height: 4 }}
        barStyles={{ background: '#8b5cf6', height: 4 }}
        dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`}
        initialState={(active) => active}
      />
    </>
  )
}
