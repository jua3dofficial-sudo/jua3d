import { useEffect, useRef } from "react";
import heroDesktop from "@/assets/hero-desktop.png";
import jua3dLabLogo from "@/assets/jua-3d-lab-logo.png";

const Index = () => {
  const introRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const trackWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = trackWrapRef.current;
    if (!wrap) return;
    const cards = Array.from(wrap.querySelectorAll<HTMLDivElement>(".prod-card"));
    const dots = Array.from(document.querySelectorAll<HTMLDivElement>(".s3-dot"));
    let isDragging = false, startX = 0, scrollLeft = 0, activeIndex = -1, rafId = 0;

    const getActiveCard = () => {
      const r = wrap.getBoundingClientRect();
      const c = r.left + r.width / 2;
      let closest = 0, min = Infinity;
      cards.forEach((card, i) => {
        const cr = card.getBoundingClientRect();
        const d = Math.abs(cr.left + cr.width / 2 - c);
        if (d < min) { min = d; closest = i; }
      });
      return closest;
    };
    const updateActive = () => {
      const idx = getActiveCard();
      if (idx === activeIndex) return;
      activeIndex = idx;
      cards.forEach((c, i) => c.classList.toggle("active", i === idx));
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
    };
    const snap = () => {
      const idx = getActiveCard();
      cards[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      setTimeout(updateActive, 350);
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true; startX = e.pageX - wrap.offsetLeft; scrollLeft = wrap.scrollLeft;
      wrap.style.cursor = "grabbing"; clearInterval(autoTimer);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return; e.preventDefault();
      wrap.scrollLeft = scrollLeft - (e.pageX - wrap.offsetLeft - startX) * 1.4;
      cancelAnimationFrame(rafId); rafId = requestAnimationFrame(updateActive);
    };
    const onMouseUp = () => { if (isDragging) { isDragging = false; wrap.style.cursor = "grab"; snap(); } };
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX; scrollLeft = wrap.scrollLeft; clearInterval(autoTimer);
    };
    const onTouchMove = (e: TouchEvent) => {
      wrap.scrollLeft = scrollLeft + (startX - e.touches[0].pageX) * 1.2;
      cancelAnimationFrame(rafId); rafId = requestAnimationFrame(updateActive);
    };
    const onScroll = () => {
      cancelAnimationFrame(rafId); rafId = requestAnimationFrame(updateActive);
    };

    wrap.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchmove", onTouchMove, { passive: true });
    wrap.addEventListener("touchend", snap);
    wrap.addEventListener("scroll", onScroll, { passive: true });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        cards[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        setTimeout(updateActive, 400);
      });
    });

    cards[1]?.scrollIntoView({ block: "nearest", inline: "center" });
    setTimeout(updateActive, 100);

    const autoTimer = setInterval(() => {
      if (!isDragging) {
        const next = (activeIndex + 1) % cards.length;
        cards[next]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        setTimeout(updateActive, 400);
      }
    }, 3500);

    return () => {
      wrap.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchmove", onTouchMove);
      wrap.removeEventListener("touchend", snap);
      wrap.removeEventListener("scroll", onScroll);
      clearInterval(autoTimer);
      cancelAnimationFrame(rafId);
    };
  }, []);

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

        /* ============ SECTION 2 — TRUST & EXPERTISE ============ */
        .jua-s2-wrap { position: relative; z-index: 6; margin-top: 100vh; font-family:'Barlow',sans-serif; }
        .s2 {
          width: 100%; min-height: 100vh;
          background: linear-gradient(160deg, #060E1C 0%, #0A2A57 50%, #060E1C 100%);
          display: flex; align-items: stretch; position: relative; overflow: hidden;
        }
        .glow-orb {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(58,143,232,0.12) 0%, transparent 70%);
          top: -100px; left: -100px; pointer-events: none; z-index: 0;
        }
        .s2-left {
          position: relative; z-index: 2; flex: 1;
          display: flex; flex-direction: column; justify-content: center;
          padding: 80px 56px 80px 64px; max-width: 52%;
        }
        .s2-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .s2-eyebrow-line { width: 32px; height: 1px; background: #3A8FE8; }
        .s2-eyebrow-text {
          font-size: 11px; font-weight: 600; letter-spacing: 4px;
          text-transform: uppercase; color: #3A8FE8;
        }
        .s2-logo {
          width: 192px;
          height: 192px;
          object-fit: contain;
          margin-bottom: 16px;
          display: block;
          margin-left: auto;
          margin-right: auto;
          image-rendering: -webkit-optimize-contrast;
          filter: brightness(0) invert(1) drop-shadow(0 0 14px rgba(58,143,232,0.65));
        }
        @media (min-width: 768px) {
          .s2-logo { width: 224px; height: 224px; margin-bottom: 20px; filter: brightness(0) invert(1) drop-shadow(0 0 16px rgba(58,143,232,0.7)); }
          .s2-eyebrow { margin-bottom: 18px; }
        }
        .s2-headline {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(34px, 3.8vw, 52px); font-weight: 800;
          color: #FFFFFF; line-height: 1.05; letter-spacing: 0.5px; margin-bottom: 24px;
        }
        .s2-headline em { font-style: normal; color: #3A8FE8; }
        .s2-divider { width: 48px; height: 2px; background: linear-gradient(to right, #3A8FE8, transparent); margin-bottom: 24px; }
        .s2-body {
          font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.62);
          line-height: 1.85; max-width: 440px; margin-bottom: 40px;
        }
        .s2-body strong { color: rgba(255,255,255,0.9); font-weight: 500; }
        .s2-cta-row { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
        .s2-cta-btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
          color: #FFFFFF; background: linear-gradient(135deg, #123E78, #3A8FE8);
          padding: 14px 32px; text-decoration: none; border-radius: 2px;
          transition: all 0.3s; box-shadow: 0 4px 24px rgba(58,143,232,0.25);
        }
        .s2-cta-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(58,143,232,0.4); }
        .s2-cta-link {
          font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,255,255,0.4); text-decoration: none;
          display: flex; align-items: center; gap: 8px; transition: color 0.3s;
        }
        .s2-cta-link:hover { color: #FFFFFF; }
        .s2-cta-link::after { content: '→'; font-size: 14px; }
        .s2-stats-row {
          display: flex; gap: 40px; margin-top: 52px; padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .s2-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: #FFFFFF; letter-spacing: 1px; line-height: 1; }
        .s2-stat-num span { color: #3A8FE8; }
        .s2-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-top: 4px; }
        .s2-right {
          position: relative; z-index: 2; flex: 1; max-width: 48%;
          display: flex; align-items: center; justify-content: center; padding: 48px 48px 48px 0;
        }
        .s2-video-frame {
          position: relative; width: 100%; max-width: 480px; aspect-ratio: 9/16;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 0 0 1px rgba(58,143,232,0.15), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(58,143,232,0.08);
        }
        .s2-video-frame video { width: 100%; height: 100%; object-fit: cover; }
        .s2-video-frame::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(6,14,28,0.5) 100%); pointer-events: none; }
        .s2-corner { position: absolute; width: 20px; height: 20px; z-index: 3; }
        .s2-corner-tl { top: -1px; left: -1px; border-top: 2px solid #3A8FE8; border-left: 2px solid #3A8FE8; border-radius: 4px 0 0 0; }
        .s2-corner-tr { top: -1px; right: -1px; border-top: 2px solid #3A8FE8; border-right: 2px solid #3A8FE8; border-radius: 0 4px 0 0; }
        .s2-corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid #3A8FE8; border-left: 2px solid #3A8FE8; border-radius: 0 0 0 4px; }
        .s2-corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid #3A8FE8; border-right: 2px solid #3A8FE8; border-radius: 0 0 4px 0; }
        .cap-strip {
          width: 100%;
          background: linear-gradient(90deg, #060E1C, #0A2A57, #060E1C);
          border-top: 1px solid rgba(58,143,232,0.12);
          border-bottom: 1px solid rgba(58,143,232,0.12);
          overflow: hidden; position: relative; z-index: 2;
        }
        .cap-track { display: flex; width: max-content; animation: s2ScrollLeft 28s linear infinite; padding: 20px 0; }
        .cap-item { display: flex; align-items: center; gap: 12px; padding: 0 48px; white-space: nowrap; border-right: 1px solid rgba(255,255,255,0.07); }
        .cap-icon { font-size: 18px; opacity: 0.8; }
        .cap-text { font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.55); }
        @keyframes s2ScrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (max-width: 768px) {
          .s2 { flex-direction: column; min-height: auto; }
          .s2-left { max-width: 100%; padding: 60px 24px 40px; }
          .s2-right { max-width: 100%; padding: 0 24px 60px; justify-content: center; }
          .s2-video-frame { max-width: 280px; }
          .s2-stats-row { gap: 24px; }
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

        {/* DESKTOP & TABLET HERO */}
        <section className="jua-desktop-hero" aria-label="JUA 3D Print Lab hero">
          <div className="bg" />

          <div className="topbar">
            <div className="logo">JUA <span>3D</span> PRINT<br />LAB</div>
            <a href="#contact" className="cta">GET A<br />QUOTE</a>
          </div>

          <div className="grid">
            <div className="left">
              <div className="toplabel">DESIGN • ENGINEER • PRINT</div>
              <div>
                <h1 className="h-jua">JUA 3D</h1>
                <div className="h-printlab">PRINT LAB</div>
              </div>
              <div className="h-sub">
                PRINTED
                <span className="h-sub-2">PRECISION</span>
              </div>
              <div className="desc">FROM DIGITAL TO PHYSICAL</div>
              <div className="support">BUILT FOR<br />REAL-WORLD APPLICATIONS</div>
            </div>

            <div />

            <div className="right">
              <div className="icon-row">
                <div className="label">HIGH PRECISION<br />3D PRINTING</div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 3 7v10l9 5 9-5V7z" /><path d="M3 7l9 5 9-5" /><path d="M12 12v10" />
                </svg>
              </div>
              <div className="icon-row">
                <div className="label">RAPID<br />PROTOTYPING</div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="14" width="18" height="6" rx="1" /><rect x="3" y="4" width="18" height="6" rx="1" />
                </svg>
              </div>
              <div className="icon-row">
                <div className="label">CUSTOM<br />MANUFACTURING</div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
                </svg>
              </div>
              <div className="icon-row">
                <div className="label">FUNCTIONAL<br />PARTS</div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" />
                  <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bottomline">PROTOTYPES • PRODUCTS • PRODUCTION</div>
        </section>

        {/* SECTION 2 — TRUST & EXPERTISE */}
        <div className="jua-s2-wrap">
          <section className="s2">
            <div className="glow-orb" />
            <div className="s2-left">
              <div className="s2-eyebrow">
                <div className="s2-eyebrow-line" />
                <span className="s2-eyebrow-text">The JUA Standard</span>
              </div>
              <img
                className="s2-logo"
                src={jua3dLabLogo}
                alt="JUA 3D Print Lab Logo"
              />
              <h2 className="s2-headline">
                Precision You Can <em>Touch.</em><br />
                Results You Can <em>Trust.</em>
              </h2>
              <div className="s2-divider" />
              <p className="s2-body">
                At JUA 3D Print Lab, we've mastered the art of turning complex ideas into{" "}
                <strong>tangible, high-quality products.</strong> Serving 10+ industries across
                medical, architecture, automotive, and beyond — our team combines advanced 3D printing
                technology with deep engineering expertise. When quality is non-negotiable,{" "}
                <strong>professionals choose JUA.</strong>
              </p>
              <div className="s2-cta-row">
                <a href="#contact" className="s2-cta-btn">Work With Us</a>
                <a href="#products" className="s2-cta-link">See Our Work</a>
              </div>
              <div className="s2-stats-row">
                <div className="s2-stat-item">
                  <div className="s2-stat-num">10<span>+</span></div>
                  <div className="s2-stat-label">Industries</div>
                </div>
                <div className="s2-stat-item">
                  <div className="s2-stat-num">50<span>+</span></div>
                  <div className="s2-stat-label">Product Types</div>
                </div>
                <div className="s2-stat-item">
                  <div className="s2-stat-num">100<span>%</span></div>
                  <div className="s2-stat-label">Custom Made</div>
                </div>
              </div>
            </div>
            <div className="s2-right">
              <div className="s2-video-frame">
                <div className="s2-corner s2-corner-tl" />
                <div className="s2-corner s2-corner-tr" />
                <div className="s2-corner s2-corner-bl" />
                <div className="s2-corner s2-corner-br" />
                <video
                  src="https://res.cloudinary.com/dc2qifrvh/video/upload/v1778036398/From_KlickPin_CF_Flower_Vase_-_3D_Printing___3d_printing_3dprinting_design_3d_printer_designs_-_Pin-1033505814469649993_n0uty7.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
            </div>
          </section>

          <div className="cap-strip">
            <div className="cap-track">
              {[...Array(2)].map((_, i) => (
                <div key={i} style={{ display: "flex" }}>
                  <div className="cap-item"><span className="cap-icon">⬡</span><span className="cap-text">High Precision Printing</span></div>
                  <div className="cap-item"><span className="cap-icon">⚡</span><span className="cap-text">Rapid Prototyping</span></div>
                  <div className="cap-item"><span className="cap-icon">⚙️</span><span className="cap-text">Custom Manufacturing</span></div>
                  <div className="cap-item"><span className="cap-icon">🏥</span><span className="cap-text">Medical Grade Output</span></div>
                  <div className="cap-item"><span className="cap-icon">🏛</span><span className="cap-text">Architectural Scale Models</span></div>
                  <div className="cap-item"><span className="cap-icon">🚗</span><span className="cap-text">Automotive Parts</span></div>
                  <div className="cap-item"><span className="cap-icon">📦</span><span className="cap-text">Industrial Supply</span></div>
                  <div className="cap-item"><span className="cap-icon">⏱</span><span className="cap-text">Fast Turnaround</span></div>
                  <div className="cap-item"><span className="cap-icon">✅</span><span className="cap-text">Quality Guaranteed</span></div>
                  <div className="cap-item"><span className="cap-icon">🎯</span><span className="cap-text">Micron-Level Accuracy</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
