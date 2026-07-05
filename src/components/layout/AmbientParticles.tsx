const PARTICLE_COLORS = [
  "var(--lab-accent)",
  "var(--lab-accent-secondary)",
  "#54b8f0",
];

// Deterministic pseudo-random layout so server and client render identically.
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${5 + (i * 47) % 90}%`,
  top: `${(i * 67) % 100}%`,
  size: 2 + (i % 3),
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  duration: 8 + (i % 5),
  delay: (i * 0.7) % 4,
}));

export function AmbientParticles() {
  return (
    <div className="lab-particles" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="lab-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
