import { useEffect, useRef } from "react";
import heroDesktop from "@/assets/hero-desktop.png";
import jua3dLabLogo from "@/assets/jua-3d-lab-logo.png";

const Index = () => {
  const introRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const trackWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vid = document.getElementById("s4vid") as HTMLVideoElement | null;
    if (!vid) return;
    const SPEED = 0.4;
    let END = 7; // will be clamped once metadata loads
    let direction: "forward" | "reverse" = "forward";
    let rafId = 0;
    let lastT = 0;

    const startForward = () => {
      direction = "forward";
      vid.playbackRate = SPEED;
      vid.play().catch(() => {});
    };

    const reverseStep = (t: number) => {
      if (direction !== "reverse") return;
      const dt = (t - lastT) / 1000;
      lastT = t;
      vid.currentTime = Math.max(0, vid.currentTime - SPEED * dt);
      if (vid.currentTime <= 0.01) {
        startForward();
        return;
      }
      rafId = requestAnimationFrame(reverseStep);
    };

    const startReverse = () => {
      direction = "reverse";
      vid.pause();
      lastT = performance.now();
      rafId = requestAnimationFrame(reverseStep);
    };

    const onTimeUpdate = () => {
      if (direction === "forward" && vid.currentTime >= END) {
        startReverse();
      }
    };

    const onMeta = () => {
      if (vid.duration && isFinite(vid.duration)) {
        // Trigger reverse well before the natural end so it never stops/freezes
        END = Math.max(0.5, Math.min(7, vid.duration - 0.25));
      }
    };
    if (vid.readyState >= 1) onMeta();
    vid.addEventListener("loadedmetadata", onMeta);
    const onEnded = () => { if (direction === "forward") startReverse(); };
    vid.addEventListener("ended", onEnded);
    vid.addEventListener("timeupdate", onTimeUpdate);
    startForward();
    const resume = () => { startForward(); document.removeEventListener("click", resume); };
    document.addEventListener("click", resume, { once: true });

    return () => {
      vid.removeEventListener("timeupdate", onTimeUpdate);
      vid.removeEventListener("loadedmetadata", onMeta);
      vid.removeEventListener("ended", onEnded);
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", resume);
    };
  }, []);

  useEffect(() => {
    const wrap = document.getElementById("s5wrap");
    if (!wrap) return;
    const cards = Array.from(document.querySelectorAll<HTMLDivElement>(".s5-card"));
    const navdots = Array.from(document.querySelectorAll<HTMLDivElement>(".s5-navdot"));
    let activeIndex = -1;
    let isDragging = false;
    let dragStartX = 0;
    let dragScrollL = 0;
    let autoTimer: ReturnType<typeof setInterval> | null = null;
    let ticking = false;

    const getClosest = () => {
      const centre = wrap.getBoundingClientRect().left + wrap.offsetWidth / 2;
      let best = 0, bestDist = Infinity;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - centre);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    };
    const applyActive = (idx: number) => {
      if (idx === activeIndex) return;
      activeIndex = idx;
      cards.forEach((c, i) => c.classList.toggle("active", i === idx));
      navdots.forEach((d, i) => d.classList.toggle("active", i === idx));
    };
    const scheduleUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { applyActive(getClosest()); ticking = false; });
    };
    const snapTo = (idx: number) => {
      const card = cards[idx];
      if (!card) return;
      const target = card.offsetLeft - wrap.offsetWidth / 2 + card.offsetWidth / 2;
      wrap.scrollTo({ left: target, behavior: "smooth" });
      setTimeout(() => applyActive(getClosest()), 420);
    };
    const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
    const startAuto = () => {
      stopAuto();
      autoTimer = setInterval(() => {
        const next = (activeIndex + 1) % cards.length;
        snapTo(next);
      }, 3000);
    };

    const onScroll = () => scheduleUpdate();
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragScrollL = wrap.scrollLeft;
      wrap.style.cursor = "grabbing";
      stopAuto();
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      wrap.scrollLeft = dragScrollL - (e.clientX - dragStartX) * 1.4;
      scheduleUpdate();
    };
    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      wrap.style.cursor = "grab";
      snapTo(getClosest());
    };
    const onTouchStart = (e: TouchEvent) => {
      dragStartX = e.touches[0].clientX;
      dragScrollL = wrap.scrollLeft;
      stopAuto();
    };
    const onTouchMove = (e: TouchEvent) => {
      wrap.scrollLeft = dragScrollL - (e.touches[0].clientX - dragStartX) * 1.3;
      scheduleUpdate();
    };
    const onTouchEnd = () => snapTo(getClosest());
    const dotHandlers = navdots.map((dot, i) => {
      const h = () => { stopAuto(); snapTo(i); };
      dot.addEventListener("click", h);
      return h;
    });

    wrap.addEventListener("scroll", onScroll, { passive: true });
    wrap.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchmove", onTouchMove, { passive: true });
    wrap.addEventListener("touchend", onTouchEnd);

    const initTO = setTimeout(() => {
      snapTo(1);
      setTimeout(() => { applyActive(getClosest()); startAuto(); }, 300);
    }, 700);

    return () => {
      stopAuto();
      clearTimeout(initTO);
      wrap.removeEventListener("scroll", onScroll);
      wrap.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchmove", onTouchMove);
      wrap.removeEventListener("touchend", onTouchEnd);
      navdots.forEach((dot, i) => dot.removeEventListener("click", dotHandlers[i]));
    };
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const wrap = trackWrapRef.current;
    if (!wrap) return;
    const cards = Array.from(wrap.querySelectorAll<HTMLDivElement>(".prod-card"));
    const dots = Array.from(document.querySelectorAll<HTMLDivElement>(".s3-dot"));

    let activeIndex = -1;
    let autoTimer: ReturnType<typeof setInterval> | null = null;
    let userInteractTO: ReturnType<typeof setTimeout> | null = null;
    let scrollEndTO: ReturnType<typeof setTimeout> | null = null;

    // Pure-math closest detection — no layout reads, no reflow.
    const getClosest = () => {
      const centre = wrap.scrollLeft + wrap.offsetWidth / 2;
      let best = 0, bestDist = Infinity;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const cardCentre = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(cardCentre - centre);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      return best;
    };

    const applyActive = (idx: number) => {
      if (idx === activeIndex) return;
      activeIndex = idx;
      cards.forEach((c, i) => c.classList.toggle("active", i === idx));
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
    };

    const updateActive = () => applyActive(getClosest());

    // scrollend if available, debounced fallback otherwise.
    const supportsScrollEnd = "onscrollend" in window;
    const onScrollEnd = () => updateActive();
    const onScrollDebounced = () => {
      if (scrollEndTO) clearTimeout(scrollEndTO);
      scrollEndTO = setTimeout(updateActive, 80);
    };

    const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
    const goTo = (idx: number) => {
      const card = cards[idx];
      if (!card) return;
      const target = card.offsetLeft - wrap.offsetWidth / 2 + card.offsetWidth / 2;
      wrap.scrollTo({ left: target, behavior: "smooth" });
    };
    const startAuto = () => {
      stopAuto();
      autoTimer = setInterval(() => {
        const next = (activeIndex + 1) % cards.length;
        goTo(next);
      }, 3200);
    };
    const pauseAutoTemporarily = () => {
      stopAuto();
      if (userInteractTO) clearTimeout(userInteractTO);
      userInteractTO = setTimeout(() => startAuto(), 4500);
    };

    if (supportsScrollEnd) {
      wrap.addEventListener("scrollend", onScrollEnd, { passive: true });
    }
    // Always attach debounced fallback (cheap; covers browsers without scrollend).
    wrap.addEventListener("scroll", onScrollDebounced, { passive: true });

    const onUserInteract = () => pauseAutoTemporarily();
    wrap.addEventListener("pointerdown", onUserInteract, { passive: true });
    wrap.addEventListener("wheel", onUserInteract, { passive: true });

    const dotHandlers: Array<() => void> = dots.map((dot, i) => {
      const h = () => { pauseAutoTemporarily(); goTo(i); };
      dot.addEventListener("click", h);
      return h;
    });

    const init = () => {
      const card = cards[1];
      if (card) {
        wrap.scrollLeft = card.offsetLeft - wrap.offsetWidth / 2 + card.offsetWidth / 2;
      }
      setTimeout(() => { updateActive(); startAuto(); }, 200);
    };
    const initTimeout = setTimeout(init, 600);

    return () => {
      clearTimeout(initTimeout);
      if (userInteractTO) clearTimeout(userInteractTO);
      if (scrollEndTO) clearTimeout(scrollEndTO);
      if (supportsScrollEnd) wrap.removeEventListener("scrollend", onScrollEnd);
      wrap.removeEventListener("scroll", onScrollDebounced);
      wrap.removeEventListener("pointerdown", onUserInteract);
      wrap.removeEventListener("wheel", onUserInteract);
      dots.forEach((dot, i) => dot.removeEventListener("click", dotHandlers[i]));
      stopAuto();
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

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLDivElement>(".s6-card"));
    if (!cards.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const delay = Number((e.target as HTMLElement).dataset.delay || 0);
          setTimeout(() => e.target.classList.add("visible"), delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach((card, i) => {
      card.dataset.delay = String(i * 80);
      obs.observe(card);
    });
    return () => obs.disconnect();
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
          position: relative; z-index: 2; flex: 0 1 620px;
          display: flex; flex-direction: column; justify-content: center;
          padding: 80px 32px 80px 72px; max-width: 620px; margin-left: auto;
        }
        .s2-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .s2-eyebrow-line { width: 40px; height: 1px; background: #3A8FE8; }
        .s2-eyebrow-text {
          font-size: 13px; font-weight: 600; letter-spacing: 4px;
          text-transform: uppercase; color: #3A8FE8;
        }
        .s2-logo {
          width: 240px;
          height: 240px;
          object-fit: contain;
          margin-bottom: 20px;
          display: block;
          margin-left: auto;
          margin-right: auto;
          image-rendering: -webkit-optimize-contrast;
          filter: brightness(0) invert(1) drop-shadow(0 0 14px rgba(58,143,232,0.65));
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .s2-logo { width: 300px; height: 300px; margin-bottom: 24px; filter: brightness(0) invert(1) drop-shadow(0 0 18px rgba(58,143,232,0.75)); }
          .s2-eyebrow { margin-bottom: 22px; }
        }
        @media (min-width: 1024px) {
          .s2 { position: relative; align-items: stretch; }
          .s2-left {
            transform: translateX(-10%);
            padding-top: 320px;
            padding-bottom: 80px;
          }
          .s2-logo {
            position: absolute;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            width: 280px;
            height: 280px;
            margin: 0;
            z-index: 5;
            filter: brightness(0) invert(1) drop-shadow(0 0 22px rgba(58,143,232,0.8));
          }
          .s2-right {
            align-items: flex-start;
            padding-top: 520px;
            padding-bottom: 80px;
          }
          .s2-video-frame {
            max-width: 340px;
            aspect-ratio: auto;
            height: 660px;
          }
        }
        .s2-headline {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(40px, 4.8vw, 68px); font-weight: 800;
          color: #FFFFFF; line-height: 1.05; letter-spacing: 0.5px; margin-bottom: 28px;
        }
        .s2-headline em { font-style: normal; color: #3A8FE8; }
        .s2-divider { width: 56px; height: 2px; background: linear-gradient(to right, #3A8FE8, transparent); margin-bottom: 28px; }
        .s2-body {
          font-size: 18px; font-weight: 300; color: rgba(255,255,255,0.7);
          line-height: 1.8; max-width: 540px; margin-bottom: 44px;
        }
        .s2-body strong { color: rgba(255,255,255,0.95); font-weight: 500; }
        .s2-cta-row { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
        .s2-cta-btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
          color: #FFFFFF; background: linear-gradient(135deg, #123E78, #3A8FE8);
          padding: 16px 38px; text-decoration: none; border-radius: 2px;
          transition: all 0.3s; box-shadow: 0 4px 24px rgba(58,143,232,0.25);
        }
        .s2-cta-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(58,143,232,0.4); }
        .s2-cta-link {
          font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,255,255,0.45); text-decoration: none;
          display: flex; align-items: center; gap: 8px; transition: color 0.3s;
        }
        .s2-cta-link:hover { color: #FFFFFF; }
        .s2-cta-link::after { content: '→'; font-size: 15px; }
        .s2-stats-row {
          display: flex; gap: 48px; margin-top: 56px; padding-top: 36px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .s2-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 44px; color: #FFFFFF; letter-spacing: 1px; line-height: 1; }
        .s2-stat-num span { color: #3A8FE8; }
        .s2-stat-label { font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 6px; }
        .s2-right {
          position: relative; z-index: 2; flex: 0 1 620px; max-width: 620px;
          display: flex; align-items: center; justify-content: flex-start; padding: 48px 64px 48px 32px; margin-right: auto;
        }
        .s2-video-frame {
          position: relative; width: 100%; max-width: 520px; aspect-ratio: 9/16;
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
          .s2 {
            flex-direction: row;
            min-height: auto;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            touch-action: pan-x;
            scrollbar-width: none;
          }
          .s2::-webkit-scrollbar { display: none; }
          .s2-left, .s2-right {
            flex: 0 0 100vw;
            width: 100vw;
            max-width: 100vw;
            scroll-snap-align: center;
            scroll-snap-stop: always;
          }
          .s2-left { padding: 60px 24px 40px; align-items: center; text-align: center; margin: 0; }
          .s2-left .s2-eyebrow { justify-content: center; }
          .s2-left .s2-headline { text-align: center; }
          .s2-left .s2-divider { margin-left: auto; margin-right: auto; }
          .s2-left .s2-body { margin-left: auto; margin-right: auto; text-align: center; }
          .s2-left .s2-cta-row { justify-content: center; }
          .s2-left .s2-stats-row { justify-content: center; width: 100%; }
          .s2-left .s2-stat-item { text-align: center; }
          .s2-right {
            padding: 60px 24px;
            justify-content: center;
            align-items: center;
            margin: 0;
          }
          .s2-video-frame { max-width: 280px; }
          .s2-stats-row { gap: 24px; }
        }

        /* ============ SECTION 3 — PRODUCTS SCROLL ============ */
        .s3 {
          width:100%;
          padding:80px 0 100px;
          background:linear-gradient(180deg,#060E1C 0%,#0A2A57 50%,#060E1C 100%);
          position:relative;
          z-index:6;
          overflow:hidden;
          font-family:'Barlow',sans-serif;
        }
        .s3::before {
          content:''; position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(58,143,232,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(58,143,232,0.04) 1px, transparent 1px);
          background-size:60px 60px;
          pointer-events:none;
          z-index:0;
        }
        .s3-header { text-align:center; padding:0 24px 56px; position:relative; z-index:2; }
        .s3-eyebrow { display:inline-flex; align-items:center; gap:12px; margin-bottom:16px; }
        .s3-eyebrow-line { width:28px; height:1px; background:#3A8FE8; }
        .s3-eyebrow-text {
          font-size:11px; font-weight:600; letter-spacing:4px;
          text-transform:uppercase; color:#3A8FE8;
        }
        .s3-title {
          font-family:'Barlow Condensed',sans-serif;
          font-size:clamp(32px,5vw,56px); font-weight:800;
          color:#FFFFFF; letter-spacing:1px; line-height:1;
        }
        .s3-title span { color:#3A8FE8; }
        .s3-sub {
          font-size:14px; font-weight:300; color:rgba(255,255,255,0.45);
          margin-top:12px; letter-spacing:1px;
        }
        .s3-track-wrap {
          position:relative; width:100%;
          overflow-x:auto; overflow-y:visible;
          cursor:grab; user-select:none; scrollbar-width:none;
          -webkit-overflow-scrolling:touch;
          scroll-behavior:auto;
          scroll-snap-type: x mandatory;
          touch-action: pan-x;
          will-change: scroll-position;
          transform: translateZ(0);
        }
        .s3-track-wrap::-webkit-scrollbar { display:none; }
        .s3-track-wrap:active { cursor:grabbing; }
        .s3-track {
          display:flex; gap:24px;
          padding:48px 60px 64px;
          width:max-content; align-items:center;
        }
        .prod-card {
          position:relative; flex-shrink:0; width:420px;
          display:flex; flex-direction:column; align-items:center;
          transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease;
          transform:scale(0.84); opacity:0.55; cursor:pointer;
          will-change: transform;
          scroll-snap-align: center;
        }
        .prod-card[data-index="1"] { width:525px; }
        .prod-card[data-index="2"] { width:483px; }
        .prod-card[data-index="3"] { width:525px; }
        .prod-card[data-index="5"] { width:525px; }
        .prod-card[data-index="6"] { width:567px; }
        .prod-card.active { transform:scale(1); opacity:1; }
        .prod-img-wrap {
          position:relative; width:380px; height:435px;
          background: transparent;
          display:flex; align-items:center; justify-content:center;
        }
        .prod-card[data-index="1"] .prod-img-wrap { width:475px; height:544px; }
        .prod-card[data-index="2"] .prod-img-wrap { width:437px; height:500px; }
        .prod-card[data-index="3"] .prod-img-wrap { width:475px; height:544px; }
        .prod-card[data-index="5"] .prod-img-wrap { width:475px; height:544px; }
        .prod-card[data-index="6"] .prod-img-wrap { width:513px; height:587px; }
        .prod-img-wrap img {
          width:100%; height:100%; object-fit:contain; object-position:center;
          transition: transform 0.6s ease; display:block;
          filter: drop-shadow(0 30px 40px rgba(0,0,0,0.55));
          will-change: transform;
        }
        .prod-card.active .prod-img-wrap img { transform:scale(1.05); }
        .prod-name {
          margin-top:18px;
          font-family:'Barlow Condensed',sans-serif;
          font-size:16px; font-weight:700;
          letter-spacing:2.5px; text-transform:uppercase;
          color:rgba(255,255,255,0.35); text-align:center;
          transition: color 0.4s ease;
        }
        .prod-card.active .prod-name { color:#FFFFFF; }
        .prod-cat {
          font-size:10px; font-weight:400;
          letter-spacing:2px; text-transform:uppercase;
          color:transparent; margin-top:6px; text-align:center;
          transition: color 0.4s ease;
        }
        .prod-card.active .prod-cat { color:#3A8FE8; }
        .prod-dot {
          width:4px; height:4px; border-radius:50%;
          background:rgba(255,255,255,0.15); margin-top:12px;
          transition: background 0.4s ease, transform 0.4s ease;
        }
        .prod-card.active .prod-dot { background:#3A8FE8; transform:scale(1.6); }
        .s3-dots {
          display:flex; justify-content:center; gap:8px;
          margin-top:40px; position:relative; z-index:2;
        }
        .s3-dot {
          width:6px; height:6px; border-radius:50%;
          background:rgba(255,255,255,0.15);
          transition: all 0.3s ease; cursor:pointer;
        }
        .s3-dot.active { background:#3A8FE8; width:24px; border-radius:3px; }
        @media(min-width:769px) and (max-width:1024px) {
          .prod-card { width:360px; }
          .prod-card[data-index="1"] { width:450px; }
          .prod-card[data-index="2"] { width:414px; }
          .prod-card[data-index="3"] { width:450px; }
          .prod-card[data-index="5"] { width:450px; }
          .prod-card[data-index="6"] { width:486px; }
          .prod-img-wrap { width:330px; height:388px; }
          .prod-card[data-index="1"] .prod-img-wrap { width:413px; height:485px; }
          .prod-card[data-index="2"] .prod-img-wrap { width:380px; height:446px; }
          .prod-card[data-index="3"] .prod-img-wrap { width:413px; height:485px; }
          .prod-card[data-index="5"] .prod-img-wrap { width:413px; height:485px; }
          .prod-card[data-index="6"] .prod-img-wrap { width:446px; height:524px; }
          .s3-track { gap:20px; padding:44px 60px 60px; }
        }
        @media (max-width:768px) {
          .prod-card { width:300px; }
          .prod-card[data-index="1"] { width:375px; }
          .prod-card[data-index="2"] { width:345px; }
          .prod-card[data-index="3"] { width:375px; }
          .prod-card[data-index="5"] { width:375px; }
          .prod-card[data-index="6"] { width:405px; }
          .prod-img-wrap { width:270px; height:322px; }
          .prod-card[data-index="1"] .prod-img-wrap { width:338px; height:403px; }
          .prod-card[data-index="2"] .prod-img-wrap { width:311px; height:370px; }
          .prod-card[data-index="3"] .prod-img-wrap { width:338px; height:403px; }
          .prod-card[data-index="5"] .prod-img-wrap { width:338px; height:403px; }
          .prod-card[data-index="6"] .prod-img-wrap { width:365px; height:435px; }
          .s3-track { gap:16px; padding:36px 32px 52px; }
        }
        @media (max-width:400px) {
          .prod-card { width:265px; }
          .prod-card[data-index="1"] { width:331px; }
          .prod-card[data-index="2"] { width:305px; }
          .prod-card[data-index="3"] { width:331px; }
          .prod-card[data-index="5"] { width:331px; }
          .prod-card[data-index="6"] { width:358px; }
          .prod-img-wrap { width:240px; height:290px; }
          .prod-card[data-index="1"] .prod-img-wrap { width:300px; height:363px; }
          .prod-card[data-index="2"] .prod-img-wrap { width:276px; height:334px; }
          .prod-card[data-index="3"] .prod-img-wrap { width:300px; height:363px; }
          .prod-card[data-index="5"] .prod-img-wrap { width:300px; height:363px; }
          .prod-card[data-index="6"] .prod-img-wrap { width:324px; height:392px; }
          .s3-track { gap:14px; padding:32px 24px 48px; }
        }
      `}</style>

      <div className="jua-hero-root">
        <section className="jua-hero">
          <video
            id="vid-intro"
            ref={introRef}
            className="hero-video"
            src="https://res.cloudinary.com/dc2qifrvh/video/upload/f_auto,q_auto/v1777987171/3D_animation_poster_design_202605051845_xvt0vx.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
          />
          <video
            id="vid-loop"
            ref={loopRef}
            className="hero-video"
            src="https://res.cloudinary.com/dc2qifrvh/video/upload/f_auto,q_auto/v1777990749/HEEERO_vddvpy.mp4"
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
              <div className="s2-video-frame px-0 mx-0 border border-none">
                <div className="s2-corner s2-corner-tl" />
                <div className="s2-corner s2-corner-tr" />
                <div className="s2-corner s2-corner-bl" />
                <div className="s2-corner s2-corner-br" />
                <video
                  src="https://res.cloudinary.com/dc2qifrvh/video/upload/f_auto,q_auto/v1778036398/From_KlickPin_CF_Flower_Vase_-_3D_Printing___3d_printing_3dprinting_design_3d_printer_designs_-_Pin-1033505814469649993_n0uty7.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ textAlign: undefined }}
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

        {/* SECTION 3 — PRODUCTS SCROLL */}
        <section className="s3" id="products">
          <div className="s3-header">
            <div className="s3-eyebrow">
              <div className="s3-eyebrow-line" />
              <span className="s3-eyebrow-text">What We Print</span>
              <div className="s3-eyebrow-line" />
            </div>
            <h2 className="s3-title">OUR <span>PRECISION</span> PRODUCTS</h2>
            <p className="s3-sub">Drag to explore · Each object printed to perfection</p>
          </div>

          <div className="s3-track-wrap" ref={trackWrapRef}>
            <div className="s3-track">
              {[
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778040440/ChatGPT_Image_May_6_2026_09_28_57_AM_1_arlblw.webp", name: "Anatomical Brain", cat: "Medical & Healthcare" },
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778040440/ChatGPT_Image_May_6_2026_09_26_44_AM_1_d9suyk.webp", name: "Collectible Rabbit", cat: "Toys & Collectibles" },
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778040440/ChatGPT_Image_May_6_2026_09_30_27_AM_1_u3ddmp.webp", name: "Dental Gum Model", cat: "Medical & Healthcare" },
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778040440/ChatGPT_Image_May_6_2026_09_33_48_AM_wz2kjj.webp", name: "Designer Tissue Box", cat: "Smart Home Utility" },
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778040601/ChatGPT_Image_May_6_2026_09_39_12_AM_ursh6k.webp", name: "Full Brain Section", cat: "Medical & Healthcare" },
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778041007/ChatGPT_Image_May_6_2026_09_36_02_AM_lvkvmp.webp", name: "Volcano Night Light", cat: "Home Décor & Lifestyle" },
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778041268/ChatGPT_Image_May_6_2026_09_48_30_AM_zmo8bu.webp", name: "Geometric Vase", cat: "Home Décor & Lifestyle" },
              ].map((p, i) => (
                <div className="prod-card" key={i} data-index={i}>
                  <div className="prod-img-wrap">
                    <img src={p.src} alt={p.name} loading="eager" decoding="async" fetchPriority="high" />
                  </div>
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-cat">{p.cat}</div>
                  <div className="prod-dot" />
                </div>
              ))}
            </div>
          </div>

          <div className="s3-dots">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`s3-dot${i === 0 ? " active" : ""}`} data-i={i} />
            ))}
          </div>
        </section>

        {/* SECTION 4 — 3D ARCHITECTURE MODEL HOUSE SHOWCASE */}
        <style dangerouslySetInnerHTML={{ __html: `
        .s4{position:relative;z-index:6;width:100%;background:#060E1C;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:60px 0 80px;}
        .s4-fade-top{position:absolute;top:0;left:0;right:0;height:180px;background:linear-gradient(to bottom,#060E1C 0%,transparent 100%);z-index:3;pointer-events:none;}
        .s4-fade-bottom{position:absolute;bottom:0;left:0;right:0;height:200px;background:linear-gradient(to top,#060E1C 0%,transparent 100%);z-index:3;pointer-events:none;}
        .s4-fade-left{position:absolute;top:0;left:0;bottom:0;width:140px;background:linear-gradient(to right,#060E1C 0%,transparent 100%);z-index:3;pointer-events:none;}
        .s4-fade-right{position:absolute;top:0;right:0;bottom:0;width:140px;background:linear-gradient(to left,#060E1C 0%,transparent 100%);z-index:3;pointer-events:none;}
        .s4-glow{position:absolute;top:48%;left:50%;transform:translate(-50%,-50%);width:70%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(18,62,120,0.7) 0%,rgba(10,42,87,0.4) 40%,transparent 70%);filter:blur(70px);z-index:1;animation:s4glow 4s ease-in-out infinite;}
        @keyframes s4glow{0%,100%{opacity:0.7;transform:translate(-50%,-50%) scale(1);}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08);}}
        .s4-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(58,143,232,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(58,143,232,0.03) 1px,transparent 1px);background-size:60px 60px;z-index:2;pointer-events:none;mix-blend-mode:overlay;}
        .s4-scan{position:absolute;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,rgba(58,143,232,0.2),transparent);z-index:4;animation:s4scan 5s linear infinite;pointer-events:none;}
        @keyframes s4scan{from{top:0%;}to{top:100%;}}
        .s4-video-wrap{position:relative;z-index:2;width:100%;max-width:720px;margin:0 auto;}
        .s4-video-wrap video{width:100%;display:block;background:transparent;mix-blend-mode:screen;filter:brightness(1.05) contrast(1.05);}
        .s4-label{position:relative;z-index:5;margin-top:24px;text-align:center;font-family:'Bebas Neue','Barlow Condensed',sans-serif;font-size:22px;letter-spacing:6px;color:rgba(255,255,255,0.92);text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:14px;}
        .s4-label::before,.s4-label::after{content:'';width:36px;height:1px;background:#3A8FE8;display:inline-block;}
        .s4-label-dot{width:6px;height:6px;border-radius:50%;background:#3A8FE8;display:inline-block;}
        @media(max-width:1024px){.s4-video-wrap{max-width:560px;}.s4-label{font-size:18px;letter-spacing:5px;}}
        @media(max-width:768px){.s4-video-wrap{max-width:92%;}.s4-label{font-size:15px;letter-spacing:3.5px;gap:10px;}.s4-label::before,.s4-label::after{width:22px;}.s4-fade-left,.s4-fade-right{width:60px;}.s4-fade-top{height:100px;}.s4-fade-bottom{height:120px;}.s4{padding:40px 0 56px;}}
        @media(max-width:400px){.s4-label{font-size:13px;letter-spacing:2.5px;}}
        ` }} />
        <section className="s4">
          <div className="s4-glow" />
          <div className="s4-grid" />
          <div className="s4-scan" />
          <div className="s4-fade-top" />
          <div className="s4-fade-bottom" />
          <div className="s4-fade-left" />
          <div className="s4-fade-right" />
          <div className="s4-video-wrap">
            <video
              id="s4vid"
              src="https://res.cloudinary.com/dc2qifrvh/video/upload/f_auto,q_auto/v1778466315/Firefly_Smooth_cinematic_3D_product_animation._The_product_slowly_rotates_360_degrees_to_the_left_in_1_i6mseb.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              ref={(el) => {
                if (!el || (el as any)._s4bound) return;
                (el as any)._s4bound = true;
                const restart = () => {
                  setTimeout(() => {
                    try { el.currentTime = 0; el.play().catch(() => {}); } catch {}
                  }, 1000);
                };
                el.addEventListener("ended", restart);
                el.addEventListener("pause", () => { if (el.ended) restart(); });
                setInterval(() => {
                  if (el.paused && !document.hidden) { el.play().catch(() => {}); }
                }, 2000);
              }}
            />
          </div>
          <div className="s4-label">
            <span className="s4-label-dot" />
            3D Architecture Model House
          </div>
        </section>

        {/* SECTION 5 — SECOND PRODUCT SCROLL */}
        <style dangerouslySetInnerHTML={{ __html: `
        .s5{width:100%;padding:80px 0 100px;background:linear-gradient(180deg,#060E1C 0%,#0A2A57 45%,#060E1C 100%);position:relative;overflow:hidden;z-index:6;}
        .s5::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(58,143,232,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(58,143,232,0.03) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0;}
        .s5-header{text-align:center;padding:0 24px 56px;position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:12px;}
        .s5-eyebrow{display:inline-flex;align-items:center;gap:12px;}
        .s5-eyebrow-line{width:28px;height:1px;background:#3A8FE8;}
        .s5-eyebrow-text{font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#3A8FE8;font-family:'Barlow',sans-serif;}
        .s5-sub{font-size:14px;font-weight:300;color:rgba(255,255,255,0.4);letter-spacing:1px;font-family:'Barlow',sans-serif;margin:0;}
        .s5-wrap{position:relative;width:100%;overflow-x:scroll;overflow-y:visible;cursor:grab;user-select:none;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
        .s5-wrap::-webkit-scrollbar{display:none;}
        .s5-wrap:active{cursor:grabbing;}
        .s5-track{display:flex;gap:40px;padding:20px 80px 48px;width:max-content;align-items:flex-end;}
        .s5-card{position:relative;flex-shrink:0;width:280px;display:flex;flex-direction:column;align-items:center;transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1),opacity 0.5s ease;transform:scale(0.8);opacity:0.38;cursor:pointer;}
        .s5-card[data-index="0"]{width:336px;}
        .s5-card[data-index="2"]{width:350px;}
        .s5-card[data-index="4"]{width:378px;}
        .s5-card.active{transform:scale(1);opacity:1;}
        .s5-img-wrap{width:260px;height:320px;position:relative;display:flex;align-items:center;justify-content:center;}
        .s5-card[data-index="0"] .s5-img-wrap{width:312px;height:384px;}
        .s5-card[data-index="2"] .s5-img-wrap{width:325px;height:400px;}
        .s5-card[data-index="4"] .s5-img-wrap{width:351px;height:432px;}
        .s5-img-wrap img{max-width:100%;max-height:100%;object-fit:contain;object-position:center bottom;display:block;transition:transform 0.6s ease,filter 0.5s ease;filter:drop-shadow(0 20px 40px rgba(0,0,0,0.5));}
        .s5-card.active .s5-img-wrap img{transform:scale(1.06) translateY(-6px);filter:drop-shadow(0 30px 50px rgba(0,0,0,0.7)) drop-shadow(0 0 30px rgba(58,143,232,0.2));}
        .s5-img-wrap::after{content:'';position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);width:60%;height:20px;border-radius:50%;background:radial-gradient(ellipse,rgba(58,143,232,0.18) 0%,transparent 70%);opacity:0;transition:opacity 0.5s ease;}
        .s5-card.active .s5-img-wrap::after{opacity:1;}
        .s5-name{margin-top:20px;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.3);text-align:center;transition:color 0.4s ease;}
        .s5-card.active .s5-name{color:#FFFFFF;}
        .s5-industry{font-size:10px;font-weight:400;letter-spacing:2px;text-transform:uppercase;color:transparent;margin-top:6px;text-align:center;transition:color 0.4s ease;font-family:'Barlow',sans-serif;}
        .s5-card.active .s5-industry{color:#3A8FE8;}
        .s5-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.12);margin-top:12px;transition:background 0.4s ease,transform 0.4s ease;}
        .s5-card.active .s5-dot{background:#3A8FE8;transform:scale(1.6);}
        .s5-dots{display:flex;justify-content:center;gap:8px;margin-top:40px;position:relative;z-index:2;}
        .s5-navdot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.15);transition:all 0.3s ease;cursor:pointer;}
        .s5-navdot.active{background:#3A8FE8;width:24px;border-radius:3px;}
        @media(max-width:768px){.s5-card{width:200px;}.s5-card[data-index="0"]{width:240px;}.s5-card[data-index="2"]{width:250px;}.s5-card[data-index="4"]{width:270px;}.s5-img-wrap{width:180px;height:240px;}.s5-card[data-index="0"] .s5-img-wrap{width:216px;height:288px;}.s5-card[data-index="2"] .s5-img-wrap{width:225px;height:300px;}.s5-card[data-index="4"] .s5-img-wrap{width:243px;height:324px;}.s5-track{gap:24px;padding:20px 32px 48px;}}
        @media(max-width:400px){.s5-card{width:170px;}.s5-card[data-index="0"]{width:204px;}.s5-card[data-index="2"]{width:212px;}.s5-card[data-index="4"]{width:230px;}.s5-img-wrap{width:155px;height:210px;}.s5-card[data-index="0"] .s5-img-wrap{width:186px;height:252px;}.s5-card[data-index="2"] .s5-img-wrap{width:194px;height:262px;}.s5-card[data-index="4"] .s5-img-wrap{width:209px;height:284px;}}
        ` }} />
        <section className="s5">
          <div className="s5-header">
            <div className="s5-eyebrow">
              <div className="s5-eyebrow-line" />
              <span className="s5-eyebrow-text">More From JUA</span>
              <div className="s5-eyebrow-line" />
            </div>
            <p className="s5-sub">Swipe to explore · Every product engineered to impress</p>
          </div>

          <div className="s5-wrap" id="s5wrap">
            <div className="s5-track" id="s5track">
              {[
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778420230/ChatGPT_Image_May_10_2026_06_55_09_PM_rplstl.webp", name: "Modular Desk Organiser", industry: "Advanced Desk & Work Setup" },
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778420231/ChatGPT_Image_May_9_2026_04_48_10_PM_lxgpbj.webp", name: "Headset Display Stand", industry: "Gaming & Tech" },
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778420228/ChatGPT_Image_May_10_2026_07_06_26_PM_wkapvv.webp", name: "Articulated Octopus Toy", industry: "Toys & Collectibles" },
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778420231/ChatGPT_Image_May_10_2026_06_52_10_PM_hrj3ir.webp", name: "Designer Brush Holder", industry: "Home Décor & Lifestyle" },
                { src: "https://res.cloudinary.com/dc2qifrvh/image/upload/f_auto,q_auto/v1778420309/ChatGPT_Image_May_8_2026_10_25_39_AM_lwqqwa.png", name: "Laptop & iPad Stand", industry: "Advanced Desk & Work Setup" },
              ].map((p, i) => (
                <div className="s5-card" data-index={i} key={i}>
                  <div className="s5-img-wrap">
                    <img src={p.src} alt={p.name} loading="eager" decoding="async" fetchPriority="high" />
                  </div>
                  <div className="s5-name">{p.name}</div>
                  <div className="s5-industry">{p.industry}</div>
                  <div className="s5-dot" />
                </div>
              ))}
            </div>
          </div>

          <div className="s5-dots" id="s5dots">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="s5-navdot" data-i={i} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
