import React from 'react'

const AnimatedThemeLayer = ({ theme = 'default' }) => {
  if (!theme || theme === 'none') return null

  const particles = Array.from({ length: 20 }, (_, i) => i)

  return (
    <div className={`theme-motion-layer theme-${theme}`} aria-hidden="true">
      <div className="theme-gradient-band band-1" />
      <div className="theme-gradient-band band-2" />

      {particles.map((i) => (
        <span
          key={`orb-${i}`}
          className="fx fx-orb"
          style={{ '--i': i }}
        />
      ))}

      {particles.slice(0, 12).map((i) => (
        <span
          key={`leaf-${i}`}
          className="fx fx-leaf"
          style={{ '--i': i + 2 }}
        />
      ))}

      {particles.slice(0, 14).map((i) => (
        <span
          key={`bubble-${i}`}
          className="fx fx-bubble"
          style={{ '--i': i + 4 }}
        />
      ))}

      {particles.slice(0, 18).map((i) => (
        <span
          key={`spark-${i}`}
          className="fx fx-spark"
          style={{ '--i': i + 1 }}
        />
      ))}
    </div>
  )
}

export default AnimatedThemeLayer
