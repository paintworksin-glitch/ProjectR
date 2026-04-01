import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

/** Light blue floating dots + links; repulse follows cursor (detectsOn window so canvas can stay non-blocking). */
export default function LoginParticles() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        color: { value: ["#7dd3fc", "#38bdf8", "#bae6fd"] },
        links: {
          enable: true,
          distance: 110,
          color: "#7dd3fc",
          opacity: 0.14,
          width: 0.6,
        },
        move: {
          enable: true,
          speed: 0.45,
          direction: "none",
          random: true,
          outModes: { default: "bounce" },
        },
        number: { value: 52, density: { enable: true, width: 900, height: 700 } },
        opacity: { value: { min: 0.12, max: 0.42 } },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3.2 } },
      },
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: { enable: true, mode: "repulse" },
        },
        modes: {
          repulse: { distance: 120, duration: 0.35, factor: 5, speed: 0.85 },
        },
      },
    }),
    []
  );

  if (!ready) return null;
  return (
    <Particles
      id="login-particles-canvas"
      options={options}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
