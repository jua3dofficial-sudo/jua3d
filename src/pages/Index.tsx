import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "JUA 3D Print Lab — Precision Manufacturing in Kerala";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute(
      "content",
      "JUA 3D Print Lab — engineering, refining and delivering professional 3D printed objects across medicine, architecture, automotive and beyond."
    );
  }, []);

  return (
    <div className="jua-root">
      <style>{`
        .jua-root { width:100%; overflow-x:hidden; background:#060E1C; font-family:'Barlow',sans-serif; color:#fff; }
        .jua-root *, .jua-root *::before, .jua-root *::after { box-sizing:border-box; }

        nav.jua-nav {
          position: fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding: 22px 60px;
          background: linear-gradient(to bottom, rgba(6,14,28,0.85) 0%, transparent 100%);
          animation: juaFadeDown 1s ease 0.3s both;
        }
        .jua-logo { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:4px; color:#fff; line-height:1; }
        .jua-logo span { color:#3A8FE8; }
        .jua-nav-links { display:flex; gap:36px; list-style:none; margin:0; padding:0; }
        .jua-nav-links a {
          font-family:'Barlow',sans-serif; font-size:13px; font-weight:600;
          letter-spacing:2px; text-transform:uppercase;
          color:rgba(255,255,255,0.65); text-decoration:none; transition:color .3s;
        }
        .jua-nav-links a:hover { color:#fff; }
        .jua-nav-cta {
          font-family:'Barlow',sans-serif; font-size:12px; font-weight:600;
          letter-spacing:2px; text-transform:uppercase; color:#fff;
          border:1px solid rgba(255,255,255,0.4); padding:10px 24px; border-radius:2px;
          text-decoration:none; transition:all .3s; backdrop-filter:blur(4px);
        }
        .jua-nav-cta:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.8); }

        .jua-hero {
          position:relative; width:100%; height:100vh; min-height:600px;
          overflow:hidden; display:flex; align-items:flex-end; justify-content:center;
        }
        .jua-hero-video {
          position:absolute; inset:0; width:100%; height:100%;
          object-fit:cover; object-position:center top;
        }
        .jua-overlay-sides {
          position:absolute; inset:0; pointer-events:none;
          background: linear-gradient(to right, rgba(6,14,28,0.55) 0%, transparent 35%, transparent 65%, rgba(6,14,28,0.55) 100%);
        }
        .jua-overlay-bottom {
          position:absolute; inset:0; pointer-events:none;
          background: linear-gradient(to bottom, transparent 40%, rgba(6,14,28,0.3) 65%, rgba(10,42,87,0.85) 85%, #060E1C 100%);
        }

        .jua-bottom-bar {
          position:relative; z-index:10; width:100%;
          padding: 0 60px 48px;
          display:flex; align-items:flex-end; justify-content:space-between;
          animation: juaFadeUp 1.2s ease 1.2s both;
        }
        .jua-stat-strip { display:flex; gap:40px; }
        .jua-stat-number { font-family:'Bebas Neue',sans-serif; font-size:32px; letter-spacing:2px; color:#fff; line-height:1; }
        .jua-stat-label { font-size:11px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; color:rgba(255,255,255,0.45); margin-top:2px; }

        .jua-scroll-hint { display:flex; flex-direction:column; align-items:center; gap:8px; }
        .jua-scroll-label {
          font-size:10px; font-weight:600; letter-spacing:3px; text-transform:uppercase;
          color:rgba(255,255,255,0.35); writing-mode:vertical-rl; text-orientation:mixed;
        }
        .jua-scroll-line {
          width:1px; height:48px;
          background: linear-gradient(to bottom, rgba(58,143,232,0.8), transparent);
          animation: juaScrollPulse 2s ease-in-out infinite;
        }

        .jua-bridge {
          position:relative; overflow:hidden;
          background: linear-gradient(to bottom, #060E1C 0%, #0A2A57 100%);
          padding: 80px 60px;
          display:flex; align-items:center; gap:64px;
        }
        .jua-bridge-line { width:1px; height:80px; background: linear-gradient(to bottom, #3A8FE8, transparent); margin-bottom:24px; }
        .jua-bridge-eyebrow { font-size:11px; font-weight:600; letter-spacing:4px; text-transform:uppercase; color:#3A8FE8; margin-bottom:16px; }
        .jua-bridge-headline {
          font-family:'Barlow Condensed',sans-serif; font-size:clamp(36px,4vw,56px);
          font-weight:800; color:#fff; line-height:1.05; letter-spacing:1px; margin-bottom:20px;
        }
        .jua-bridge-body { font-size:15px; font-weight:300; color:rgba(255,255,255,0.6); line-height:1.8; max-width:480px; }

        .jua-scan-line {
          position:absolute; left:0; right:0; height:1px;
          background: linear-gradient(to right, transparent, rgba(58,143,232,0.4), transparent);
          animation: juaScanDown 8s linear infinite; top:0; pointer-events:none;
        }

        @keyframes juaFadeDown { from{opacity:0;transform:translateY(-20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes juaFadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes juaScrollPulse { 0%,100%{opacity:.3;transform:scaleY(1);} 50%{opacity:1;transform:scaleY(1.1);} }
        @keyframes juaScanDown { from{top:0%;} to{top:100%;} }

        @media (max-width: 768px) {
          nav.jua-nav { padding: 18px 24px; }
          .jua-nav-links { display:none; }
          .jua-bottom-bar { padding: 0 24px 32px; flex-direction:column; align-items:flex-start; gap:24px; }
          .jua-stat-strip { gap:24px; }
          .jua-stat-number { font-size:26px; }
          .jua-bridge { padding: 60px 24px; }
        }
      `}</style>

      <nav className="jua-nav">
        <div className="jua-logo">JUA <span>3D</span> PRINT LAB</div>
        <ul className="jua-nav-links">
          <li><a href="#products">Products</a></li>
          <li><a href="#industries">Industries</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#contact" className="jua-nav-cta">Get a Quote</a>
      </nav>

      <section className="jua-hero">
        <video
          className="jua-hero-video"
          src="https://res.cloudinary.com/dc2qifrvh/video/upload/v1777987171/3D_animation_poster_design_202605051845_xvt0vx.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="jua-overlay-sides" />
        <div className="jua-overlay-bottom" />

        <div className="jua-bottom-bar">
          <div className="jua-stat-strip">
            <div>
              <div className="jua-stat-number">10+</div>
              <div className="jua-stat-label">Industries Served</div>
            </div>
            <div>
              <div className="jua-stat-number">50+</div>
              <div className="jua-stat-label">Product Types</div>
            </div>
            <div>
              <div className="jua-stat-number">100%</div>
              <div className="jua-stat-label">Custom Orders</div>
            </div>
          </div>

          <div className="jua-scroll-hint">
            <div className="jua-scroll-line" />
            <span className="jua-scroll-label">Scroll</span>
          </div>
        </div>
      </section>

      <section className="jua-bridge">
        <div className="jua-scan-line" />
        <div style={{ flex: 1 }}>
          <div className="jua-bridge-line" />
          <div className="jua-bridge-eyebrow">Precision Manufacturing · Kerala, India</div>
          <h1 className="jua-bridge-headline">FROM DIGITAL FILE<br />TO PHYSICAL REALITY.</h1>
          <p className="jua-bridge-body">
            We don't just print — we engineer, refine, and deliver objects that meet professional
            standards across medicine, architecture, automotive, and beyond.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
