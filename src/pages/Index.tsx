import { useEffect, useRef } from "react";
import heroDesktop from "@/assets/hero-desktop.png";

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

        /* ============ DESKTOP & TABLET HERO (>= 768px) ============ */
        .jua-desktop-hero { display:none; }
        @media (min-width: 768px) {
          .jua-hero #vid-intro,
          .jua-hero #vid-loop,
          .jua-hero .ov,
          .jua-hero nav,
          .jua-hero .hero-bottom { display:none !important; }

          .jua-desktop-hero {
            display:block;
            position:fixed; inset:0; z-index:5;
            background:#040A18;
            font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;
            color:#fff; overflow:hidden;
          }
          .jua-desktop-hero .bg {
            position:absolute; inset:0;
            background-image:url(${heroDesktop});
            background-size:cover; background-position:center center; background-repeat:no-repeat;
          }
          .jua-desktop-hero .grid {
            position:relative; z-index:2;
            width:100%; height:100%;
            display:grid;
            grid-template-columns: minmax(0,6fr) minmax(0,4fr) minmax(0,2.2fr);
            align-items:center;
            padding: clamp(72px,7vw,120px) clamp(40px,6vw,100px) clamp(72px,7vw,120px);
            gap: clamp(20px,3vw,48px);
          }
          .jua-desktop-hero .left { display:flex; flex-direction:column; gap: clamp(16px,1.8vw,28px); }
          .jua-desktop-hero .toplabel {
            font-size: clamp(11px,1vw,14px); letter-spacing:.25em;
            color:rgba(255,255,255,.75); text-transform:uppercase; font-weight:500;
          }
          .jua-desktop-hero .h-jua {
            font-size: clamp(24px,2.6vw,36px); font-weight:800;
            letter-spacing:.02em; line-height:1; color:#fff;
          }
          .jua-desktop-hero .h-printlab {
            font-size: clamp(64px,10vw,150px); font-weight:900;
            line-height:.9; letter-spacing:-.01em; color:#fff;
            margin-top: 4px;
          }
          .jua-desktop-hero .h-sub {
            font-size: clamp(34px,4.4vw,64px); font-weight:800;
            line-height:.95; color:#fff; margin-top: clamp(20px,2.4vw,40px);
          }
          .jua-desktop-hero .h-sub-2 { display:block; }
          .jua-desktop-hero .desc {
            font-size: clamp(13px,1.15vw,18px); letter-spacing:.12em;
            color:rgba(255,255,255,.8); text-transform:uppercase; font-weight:500;
            margin-top: clamp(8px,.8vw,14px);
            border-top:1px solid rgba(255,255,255,.25);
            padding-top: clamp(8px,.8vw,14px); max-width: 320px;
          }
          .jua-desktop-hero .support {
            font-size: clamp(12px,1vw,16px); color:rgba(255,255,255,.65);
            text-transform:uppercase; letter-spacing:.15em; font-weight:500;
            margin-top: clamp(16px,2vw,32px); line-height:1.5;
          }
          .jua-desktop-hero .right {
            grid-column: 3;
            display:flex; flex-direction:column;
            gap: clamp(28px,3.5vw,56px);
            align-items:flex-end; text-align:right;
          }
          .jua-desktop-hero .icon-row {
            display:flex; align-items:center; gap:14px; justify-content:flex-end;
          }
          .jua-desktop-hero .icon-row .label {
            font-size: clamp(11px,1vw,15px); font-weight:700;
            letter-spacing:.1em; color:rgba(255,255,255,.88);
            text-transform:uppercase; line-height:1.15;
          }
          .jua-desktop-hero .icon-row svg {
            width: clamp(28px,2.6vw,40px); height: clamp(28px,2.6vw,40px);
            color:#2F80FF; filter: drop-shadow(0 0 6px rgba(47,128,255,.35));
            flex-shrink:0;
          }
          .jua-desktop-hero .bottomline {
            position:absolute; left:0; right:0;
            bottom: clamp(20px,2vw,36px);
            text-align:center; font-size: clamp(11px,1vw,14px);
            letter-spacing:.2em; color:rgba(255,255,255,.6);
            text-transform:uppercase; font-weight:500; z-index:3;
          }
          .jua-desktop-hero .topbar {
            position:absolute; top:0; left:0; right:0;
            display:flex; align-items:flex-start; justify-content:space-between;
            padding: clamp(20px,2vw,32px) clamp(28px,3vw,48px); z-index:4;
          }
          .jua-desktop-hero .topbar .logo {
            font-family:'Bebas Neue',sans-serif;
            font-size: clamp(20px,1.8vw,28px);
            letter-spacing:3px; line-height:1.15; color:#fff;
          }
          .jua-desktop-hero .topbar .logo span { color:#3A8FE8; }
          .jua-desktop-hero .topbar .cta {
            font-family:'Barlow Condensed',sans-serif;
            font-size: clamp(11px,1vw,13px); font-weight:700;
            letter-spacing:2px; text-transform:uppercase; color:#fff;
            text-decoration:none; border:1.5px solid rgba(255,255,255,.5);
            padding:10px 18px; line-height:1.3; text-align:center;
            background: rgba(10,42,87,.25); backdrop-filter: blur(8px); transition: all .3s;
          }
          .jua-desktop-hero .topbar .cta:hover { background: rgba(58,143,232,.2); border-color:#3A8FE8; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .jua-desktop-hero .grid { padding: 80px 48px; gap: 24px; }
          .jua-desktop-hero .h-printlab { font-size: clamp(56px,8vw,96px); }
          .jua-desktop-hero .h-sub { font-size: clamp(28px,3.6vw,44px); }
        }
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
