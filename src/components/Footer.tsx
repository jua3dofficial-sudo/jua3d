import { Link } from "react-router-dom";
import juaEmblem from "@/assets/jua-emblem.png";

const Footer = () => (
  <>
    <style>{`
      .s8{ position:relative; z-index:1; isolation:isolate; width:100%; background:#060E1C; border-top:1px solid rgba(58,143,232,0.1); overflow:hidden; font-family:'Barlow',sans-serif; }
      .s8-accent{ width:100%; height:2px; background:linear-gradient(to right, transparent 0%, rgba(58,143,232,0.3) 20%, #3A8FE8 50%, rgba(58,143,232,0.3) 80%, transparent 100%); }
      .s8::before{ content:''; position:absolute; inset:0; background-image: linear-gradient(rgba(58,143,232,0.025) 1px,transparent 1px), linear-gradient(90deg,rgba(58,143,232,0.025) 1px,transparent 1px); background-size:60px 60px; pointer-events:none; z-index:0; }
      .s8-orb{ position:absolute; top:-80px; left:-80px; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(18,62,120,0.3) 0%,transparent 70%); filter:blur(80px); pointer-events:none; z-index:0; }
      .s8-inner{ position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:72px 48px 0; display:grid; grid-template-columns:2fr 1fr 1fr 1.5fr; gap:48px; }
      .s8-logo-wrap{ display:flex; align-items:center; gap:12px; margin-bottom:20px; }
      .s8-logo-img{ width:48px; height:48px; object-fit:contain; filter:brightness(0) invert(1) drop-shadow(0 0 8px rgba(58,143,232,0.5)); }
      .s8-logo-text{ font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:3px; color:#FFFFFF; line-height:1; }
      .s8-logo-text span{ color:#3A8FE8; }
      .s8-tagline{ font-size:12px; font-weight:300; letter-spacing:2px; color:rgba(255,255,255,0.35); line-height:1.7; max-width:240px; margin-bottom:28px; text-transform:uppercase; }
      .s8-socials{ display:flex; gap:12px; }
      .s8-social-btn{ display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:8px; border:1px solid rgba(58,143,232,0.2); background:rgba(10,42,87,0.3); color:rgba(255,255,255,0.5); text-decoration:none; font-size:18px; transition:all .3s ease; backdrop-filter:blur(8px); }
      .s8-social-btn:hover{ border-color:rgba(58,143,232,0.6); background:rgba(58,143,232,0.15); color:#fff; transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,0.3), 0 0 12px rgba(58,143,232,0.15); }
      .s8-col-title{ font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; letter-spacing:4px; text-transform:uppercase; color:#3A8FE8; margin-bottom:24px; padding-bottom:12px; border-bottom:1px solid rgba(58,143,232,0.12); }
      .s8-links{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px; }
      .s8-links a{ font-size:13px; font-weight:400; letter-spacing:1.5px; color:rgba(255,255,255,0.45); text-decoration:none; text-transform:uppercase; transition:color .3s ease, padding-left .3s ease; display:inline-flex; align-items:center; gap:8px; }
      .s8-links a::before{ content:''; width:0; height:1px; background:#3A8FE8; transition:width .3s ease; flex-shrink:0; }
      .s8-links a:hover{ color:#FFFFFF; padding-left:4px; }
      .s8-links a:hover::before{ width:16px; }
      .s8-contact-list{ display:flex; flex-direction:column; gap:20px; }
      .s8-contact-item{ display:flex; align-items:flex-start; gap:12px; }
      .s8-contact-icon{ font-size:16px; margin-top:1px; flex-shrink:0; opacity:0.7; }
      .s8-contact-label{ font-size:9px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:rgba(58,143,232,0.6); margin-bottom:3px; }
      .s8-contact-value{ font-size:12px; font-weight:400; color:rgba(255,255,255,0.5); line-height:1.5; text-decoration:none; transition:color .3s ease; display:block; }
      a.s8-contact-value:hover{ color:#FFFFFF; }
      .s8-bottom{ position:relative; z-index:2; max-width:1200px; margin:56px auto 0; padding:32px 48px; border-top:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
      .s8-copyright{ font-size:11px; font-weight:300; letter-spacing:2px; color:rgba(255,255,255,0.2); display:flex; align-items:center; gap:6px; }
      .s8-copyright-icon{ font-size:12px; opacity:0.7; }
      .s8-bottom-right{ font-size:10px; font-weight:400; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.15); }
      .s8-bottom-right span{ color:rgba(58,143,232,0.4); }
      @media(max-width:1024px){
        .s8-inner{ grid-template-columns:1fr 1fr; gap:40px; padding:56px 32px 0; }
        .s8-brand{ grid-column:1/-1; }
      }
      @media(max-width:600px){
        .s8-inner{ grid-template-columns:1fr; padding:48px 20px 0; gap:36px; }
        .s8-brand{ grid-column:1; }
        .s8-bottom{ flex-direction:column; text-align:center; padding:28px 20px; gap:12px; }
      }
    `}</style>

    <footer className="s8">
      <div className="s8-accent" />
      <div className="s8-orb" />

      <div className="s8-inner">
        <div className="s8-brand">
          <div className="s8-logo-wrap">
            <img className="s8-logo-img" src={juaEmblem} alt="JUA 3D Print Lab" />
            <div className="s8-logo-text">JUA <span>3D</span> PRINT LAB</div>
          </div>
          <p className="s8-tagline">
            Design · Engineer · Print<br />
            Precision manufacturing for every industry
          </p>
          <div className="s8-socials">
            <a
              className="s8-social-btn"
              href="https://www.instagram.com/jua_3d_print_lab?igsh=MTh6NTN0ZjdtempoNw=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="JUA 3D on Instagram"
              title="JUA 3D on Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <div className="s8-col-title">Pages</div>
          <ul className="s8-links">
            <li><Link to="/">Home</Link></li>
            <li><a href="/#about">About Us</a></li>
            <li><a href="/#products">Products</a></li>
            <li><a href="/#industries">Industries</a></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <div className="s8-col-title">Industries</div>
          <ul className="s8-links">
            <li><a href="/#industries">Medical</a></li>
            <li><a href="/#industries">Architecture</a></li>
            <li><a href="/#industries">Gaming & Tech</a></li>
            <li><a href="/#industries">Automotive</a></li>
            <li><a href="/#industries">Home Décor</a></li>
          </ul>
        </div>

        <div>
          <div className="s8-col-title">Contact Us</div>
          <div className="s8-contact-list">
            <div className="s8-contact-item">
              <span className="s8-contact-icon">✉</span>
              <div>
                <div className="s8-contact-label">Email</div>
                <a href="mailto:jua3d.official@gmail.com" className="s8-contact-value">jua3d.official@gmail.com</a>
              </div>
            </div>
            <div className="s8-contact-item">
              <span className="s8-contact-icon">📞</span>
              <div>
                <div className="s8-contact-label">Phone</div>
                <a href="tel:+919656033791" className="s8-contact-value">+91 96560 33791</a>
              </div>
            </div>
            <div className="s8-contact-item">
              <span className="s8-contact-icon">📍</span>
              <div>
                <div className="s8-contact-label">Address</div>
                <span className="s8-contact-value">
                  Kulakattiri, Thiruvali, Malappuram<br />
                  Kerala, India — 676123
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="s8-bottom">
        <div className="s8-copyright">
          <span className="s8-copyright-icon">©</span>
          2026 All Rights Reserved · JUA 3D Print Lab
        </div>
        <div className="s8-bottom-right">
          Designed with precision · <span>Made in Kerala</span>
        </div>
      </div>
    </footer>
  </>
);

export default Footer;
