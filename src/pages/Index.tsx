import { useEffect, useRef } from "react";

const Index = () => {
  const introRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    document.title = "JUA 3D Print Lab — Precision Manufacturing in Kerala";
    const meta =
      document.querySelector('meta[name="description"]') ||
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    meta.setAttribute(
      "content",
      "JUA 3D Print Lab — engineering, refining and delivering professional 3D printed objects across medicine, architecture, automotive and beyond."
    );

    const intro = introRef.current;
    const loop = loopRef.current;
    if (!intro || !loop) return;

    // Pre-buffer the loop video and pre-roll its first frame so it's
    // already decoded and visually identical when we swap.
    loop.load();
    let loopReady = false;
    const markReady = () => { loopReady = true; };
    loop.addEventListener("canplaythrough", markReady, { once: true });
    loop.addEventListener("loadeddata", markReady, { once: true });

    // Start the loop muted & invisible immediately, then pause at frame 0
    // so the GPU already has the first frame textured.
    const primeLoop = async () => {
      try {
        loop.currentTime = 0;
        await loop.play();
        loop.pause();
        loop.currentTime = 0;
      } catch {}
    };
    primeLoop();

    let swapped = false;
    const swap = () => {
      if (swapped) return;
      swapped = true;
      // Bring loop to front and start playing BEFORE changing opacity,
      // so the first painted frame is identical to intro's last frame.
      loop.style.zIndex = "2";
      intro.style.zIndex = "1";
      loop.play().catch(() => {});

      // Wait one rAF to ensure loop has rendered a frame, then crossfade
      // via CSS transition (smooth, GPU-accelerated).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          loop.style.transition = "opacity .35s linear";
          intro.style.transition = "opacity .35s linear";
          loop.style.opacity = "1";
          intro.style.opacity = "0";
          window.setTimeout(() => {
            intro.style.display = "none";
            intro.removeAttribute("src");
            intro.load();
          }, 450);
        });
      });
    };

    // Trigger swap a touch before intro actually ends to hide any
    // end-of-stream stutter. Fall back to ended/timeupdate.
    const onTime = () => {
      const dur = isFinite(intro.duration) ? intro.duration : 0;
      const trigger = dur > 0 ? Math.max(dur - 0.25, 0.1) : 4.85;
      if (intro.currentTime >= trigger && (loopReady || intro.currentTime >= trigger + 0.5)) {
        intro.removeEventListener("timeupdate", onTime);
        swap();
      }
    };
    const onEnded = () => swap();

    intro.addEventListener("timeupdate", onTime);
    intro.addEventListener("ended", onEnded);

    return () => {
      intro.removeEventListener("timeupdate", onTime);
      intro.removeEventListener("ended", onEnded);
      loop.removeEventListener("canplaythrough", markReady);
      loop.removeEventListener("loadeddata", markReady);
    };
  }, []);

  return (
    <>
      <style>{`
        .jua-hero-root, .jua-hero-root *, .jua-hero-root *::before, .jua-hero-root *::after {
          margin: 0; padding: 0; box-sizing: border-box;
        }
        .jua-hero-root {
          --deep:#060E1C; --navy:#0A2A57; --blue:#123E78; --accent:#3A8FE8; --white:#FFFFFF;
          font-family:'Barlow',sans-serif;
        }
        .jua-hero {
          position: fixed; top:0; left:0;
          width:100vw; height:100vh; overflow:hidden;
          display:flex; flex-direction:column; justify-content:space-between;
          background: var(--deep);
        }
        .jua-hero .hero-video {
          position:absolute; top:0; left:0; width:100%; height:100%;
          object-fit:contain; object-position:center center;
          background:#060E1C;
          transition: opacity .8s ease;
        }
        .jua-hero #vid-intro { opacity:1; z-index:1; }
        .jua-hero #vid-loop  { opacity:0; z-index:0; }

        .jua-hero .ov { position:absolute; inset:0; pointer-events:none; }
        .jua-hero .ov-top {
          z-index:2;
          background: linear-gradient(to bottom, rgba(6,14,28,.80) 0%, rgba(6,14,28,.05) 28%, transparent 50%);
        }
        .jua-hero .ov-bottom {
          z-index:2;
          background: linear-gradient(to top, rgba(6,14,28,1) 0%, rgba(10,42,87,.75) 16%, transparent 42%);
        }
        .jua-hero .ov-sides {
          z-index:2;
          background: linear-gradient(to right, rgba(6,14,28,.55) 0%, transparent 22%, transparent 78%, rgba(6,14,28,.55) 100%);
        }

        .jua-hero nav {
          position:relative; z-index:10;
          display:flex; align-items:flex-start; justify-content:space-between;
          padding: 22px 26px 0;
          animation: juaFadeDown .7s ease .2s both;
        }
        .jua-hero .logo {
          font-family:'Bebas Neue',sans-serif;
          font-size: clamp(18px,4.5vw,26px);
          letter-spacing:3px; color:var(--white); line-height:1.15;
        }
        .jua-hero .logo span { color: var(--accent); }
        .jua-hero .nav-cta {
          font-family:'Barlow Condensed',sans-serif;
          font-size: clamp(10px,2.2vw,13px);
          font-weight:700; letter-spacing:2px; text-transform:uppercase;
          color:var(--white);
          border:1.5px solid rgba(255,255,255,.5);
          padding:10px 18px; text-decoration:none;
          background: rgba(10,42,87,.25); backdrop-filter: blur(8px);
          line-height:1.3; text-align:center; transition: all .3s; display:inline-block;
        }
        .jua-hero .nav-cta:hover { background: rgba(58,143,232,.2); border-color: var(--accent); }

        .jua-hero .hero-bottom {
          position:relative; z-index:10;
          padding: 0 26px 28px;
          display:flex; flex-direction:column; gap:18px;
          opacity:0; animation: juaFadeUp .9s ease 5.5s forwards;
        }
        .jua-hero .scroll-wrap { display:flex; align-items:center; gap:10px; }
        .jua-hero .scroll-line {
          width:1px; height:38px;
          background: linear-gradient(to bottom, var(--accent), transparent);
          animation: juaPulse 2s ease-in-out infinite;
        }
        .jua-hero .scroll-text {
          font-size:9px; font-weight:600; letter-spacing:3px; text-transform:uppercase;
          color: rgba(255,255,255,.3); writing-mode: vertical-rl;
        }
        .jua-hero .stats {
          display:flex; border-top:1px solid rgba(255,255,255,.1); padding-top:14px;
        }
        .jua-hero .stat { flex:1; }
        .jua-hero .stat-num {
          font-family:'Bebas Neue',sans-serif;
          font-size: clamp(26px,6.5vw,36px);
          color:var(--white); letter-spacing:1px; line-height:1;
        }
        .jua-hero .stat-label {
          font-size: clamp(8px,1.8vw,10px);
          font-weight:600; letter-spacing:2px; text-transform:uppercase;
          color: rgba(255,255,255,.38); margin-top:3px; line-height:1.4;
        }

        @keyframes juaFadeDown { from{opacity:0;transform:translateY(-14px);} to{opacity:1;transform:translateY(0);} }
        @keyframes juaFadeUp   { from{opacity:0;transform:translateY(14px);}  to{opacity:1;transform:translateY(0);} }
        @keyframes juaPulse    { 0%,100%{opacity:.25;} 50%{opacity:1;} }
      `}</style>

      <div className="jua-hero-root">
        <section className="jua-hero">
          <video
            id="vid-intro"
            ref={introRef}
            className="hero-video"
            src="https://res.cloudinary.com/dc2qifrvh/video/upload/v1777987171/3D_animation_poster_design_202605051845_xvt0vx.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
          />
          <video
            id="vid-loop"
            ref={loopRef}
            className="hero-video"
            src="https://res.cloudinary.com/dc2qifrvh/video/upload/v1777990749/HEEERO_vddvpy.mp4"
            muted
            loop
            playsInline
            preload="auto"
          />

          <div className="ov ov-top" />
          <div className="ov ov-bottom" />
          <div className="ov ov-sides" />

          <nav>
            <div className="logo">
              JUA <span>3D</span> PRINT<br />LAB
            </div>
            <a href="#contact" className="nav-cta">
              GET A<br />QUOTE
            </a>
          </nav>

          <div className="hero-bottom">
            <div className="scroll-wrap">
              <div className="scroll-line" />
              <span className="scroll-text">Scroll</span>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="stat-num">10+</div>
                <div className="stat-label">Industries<br />Served</div>
              </div>
              <div className="stat">
                <div className="stat-num">50+</div>
                <div className="stat-label">Product<br />Types</div>
              </div>
              <div className="stat">
                <div className="stat-num">100%</div>
                <div className="stat-label">Custom<br />Orders</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
