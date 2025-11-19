import React from 'react'
import Scene3D from '../components/Hero3D'

export default function Home() {
  return (
    <div className="app-full3d">
      {/* full 3D stage only */}
      <main className="stage-full">
        <Scene3D full={true} />
      </main>
    </div>
  )
}
