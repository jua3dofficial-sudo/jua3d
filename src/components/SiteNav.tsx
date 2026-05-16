import { useState } from "react";
import { Link } from "react-router-dom";
import juaEmblem from "@/assets/jua-emblem.png";

type MenuItem = { label: string; href: string; external?: boolean };

const DEFAULT_ITEMS: MenuItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Products", href: "/#products" },
  { label: "Process", href: "/#process" },
  { label: "Industries", href: "/#industries" },
  { label: "Contact", href: "/contact" },
];

const SiteNav = ({ items = DEFAULT_ITEMS }: { items?: MenuItem[] }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        .site-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
          display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
          padding: 12px 18px;
          background: rgba(10, 20, 40, 0.32);
          backdrop-filter: blur(20px) saturate(170%);
          -webkit-backdrop-filter: blur(20px) saturate(170%);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-family: 'Barlow', sans-serif;
        }
        .site-nav .site-nav-brand {
          grid-column: 2; display: flex; flex-direction: column; align-items: center; gap: 4px;
          text-decoration: none;
        }
        .site-nav .site-nav-emblem {
          width: 32px; height: 32px; object-fit: contain;
          filter: brightness(0) invert(1) drop-shadow(0 0 6px rgba(58,143,232,0.6));
        }
        .site-nav .site-nav-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px; letter-spacing: 3px; color: #fff;
          line-height: 1; white-space: nowrap;
        }
        .site-nav .site-nav-logo span { color: #3A8FE8; }
        .site-nav .site-nav-burger {
          grid-column: 3; justify-self: end;
          width: 42px; height: 42px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px; cursor: pointer; padding: 0;
          backdrop-filter: blur(8px); transition: all .3s;
        }
        .site-nav .site-nav-burger:hover { background: rgba(58,143,232,0.18); border-color: #3A8FE8; }
        .site-nav .site-nav-burger span {
          display: block; width: 18px; height: 2px; background: #fff; border-radius: 2px;
          transition: transform .3s, opacity .3s;
        }
        .site-nav .site-nav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .site-nav .site-nav-burger.open span:nth-child(2) { opacity: 0; }
        .site-nav .site-nav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .site-nav-menu {
          position: fixed; inset: 0; z-index: 9998;
          background: rgba(6,14,28,0.78);
          backdrop-filter: blur(26px) saturate(180%);
          -webkit-backdrop-filter: blur(26px) saturate(180%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 22px; padding: 100px 28px 40px;
          opacity: 0; pointer-events: none; transition: opacity .35s ease;
          font-family: 'Barlow Condensed', sans-serif;
        }
        .site-nav-menu.open { opacity: 1; pointer-events: auto; }
        .site-nav-menu a {
          font-size: 22px; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase; color: #fff; text-decoration: none;
          padding: 10px 18px; border-bottom: 1px solid rgba(255,255,255,0.08);
          width: 100%; max-width: 320px; text-align: center;
          transition: color .2s, border-color .2s;
        }
        .site-nav-menu a:hover { color: #3A8FE8; border-color: #3A8FE8; }

        @media (min-width: 768px) and (max-width: 1023px) {
          .site-nav { padding: 14px 28px; }
          .site-nav .site-nav-emblem { width: 44px; height: 44px; }
          .site-nav .site-nav-logo { font-size: 22px; letter-spacing: 3.5px; }
          .site-nav .site-nav-burger { width: 48px; height: 48px; }
          .site-nav .site-nav-burger span { width: 20px; }
          .site-nav-menu a { font-size: 26px; letter-spacing: 3.5px; max-width: 420px; }
        }
        @media (min-width: 1024px) {
          .site-nav { padding: 18px clamp(32px, 3vw, 56px); }
          .site-nav .site-nav-brand { gap: 8px; }
          .site-nav .site-nav-emblem { width: clamp(52px, 4vw, 68px); height: clamp(52px, 4vw, 68px); }
          .site-nav .site-nav-logo { font-size: clamp(24px, 1.9vw, 30px); letter-spacing: 4px; }
          .site-nav .site-nav-burger { width: clamp(52px, 3.6vw, 60px); height: clamp(52px, 3.6vw, 60px); border-radius: 12px; }
          .site-nav .site-nav-burger span { width: 22px; }
          .site-nav-menu { gap: clamp(18px, 2vw, 28px); padding: 140px 40px 60px; }
          .site-nav-menu a { font-size: clamp(28px, 2.4vw, 38px); letter-spacing: 4px; max-width: 520px; padding: 14px 24px; }
        }
      `}</style>

      <header className="site-nav">
        <Link to="/" className="site-nav-brand" aria-label="JUA 3D Print Lab — Home">
          <img src={juaEmblem} alt="" className="site-nav-emblem" />
          <div className="site-nav-logo">JUA <span>3D</span> PRINT LAB</div>
        </Link>
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className={`site-nav-burger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </header>
      <div className={`site-nav-menu${menuOpen ? " open" : ""}`} role="dialog" aria-hidden={!menuOpen}>
        {items.map((it) =>
          it.href.startsWith("/") && !it.href.includes("#") ? (
            <Link key={it.label} to={it.href} onClick={close}>{it.label}</Link>
          ) : (
            <a key={it.label} href={it.href} onClick={close}>{it.label}</a>
          )
        )}
      </div>
    </>
  );
};

export default SiteNav;
