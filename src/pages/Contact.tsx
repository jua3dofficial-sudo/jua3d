import { useEffect, useState, type FormEvent } from "react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";

type FormState = {
  name: string; business: string; email: string; phone: string;
  industry: string; products: string; design_status: "" | "yes" | "no";
  order_type: "single" | "bulk"; bulk_qty: string; timeline: string; notes: string;
};

const initial: FormState = {
  name: "", business: "", email: "", phone: "",
  industry: "", products: "", design_status: "",
  order_type: "single", bulk_qty: "", timeline: "", notes: "",
};

const Contact = () => {
  const [data, setData] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = "Contact — JUA 3D Print Lab";
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((er) => {
      if (!er[k as string]) return er;
      const n = { ...er }; delete n[k as string]; return n;
    });
  };

  const step1Done = !!(data.name && data.email && data.phone);
  const step2Done = !!data.products;

  const requiredOrder: Array<{ key: keyof FormState; id: string }> = [
    { key: "name", id: "name" },
    { key: "business", id: "business" },
    { key: "email", id: "email" },
    { key: "phone", id: "phone" },
    { key: "industry", id: "industry" },
    { key: "products", id: "products" },
    { key: "design_status", id: "design_status_group" },
    { key: "timeline", id: "timeline" },
    { key: "notes", id: "notes" },
  ];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const fieldsToCheck = [...requiredOrder];
    if (data.order_type === "bulk") fieldsToCheck.push({ key: "bulk_qty", id: "bulk_qty_group" });

    const newErrors: Record<string, boolean> = {};
    for (const f of fieldsToCheck) {
      if (!String(data[f.key] ?? "").trim()) newErrors[f.key as string] = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstKey = fieldsToCheck.find((f) => newErrors[f.key as string]);
      if (firstKey) {
        const el = document.getElementById(firstKey.id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => { (el as HTMLElement).focus?.(); }, 450);
        }
      }
      return;
    }

    setSubmitting(true);
    const orderTypeLabel = data.order_type === "single" ? "Single / Prototype" : "Bulk Order";
    const designLabel =
      data.design_status === "yes" ? "Yes — has a design file ready"
      : data.design_status === "no" ? "No — needs JUA to design"
      : "Not specified";
    try {
      await fetch("https://formspree.io/f/xpwzgvqb", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _replyto: data.email,
          _subject: `New 3D Print Enquiry from ${data.name} — ${orderTypeLabel}`,
          name: data.name,
          business: data.business || "Not provided",
          email: data.email,
          phone: data.phone,
          industry: data.industry || "Not selected",
          products: data.products,
          design_status: designLabel,
          order_type: orderTypeLabel,
          bulk_quantity: data.bulk_qty || "N/A",
          timeline: data.timeline || "Not specified",
          notes: data.notes || "None",
        }),
      });
    } catch { /* swallow */ }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const orderTypeLabel = data.order_type === "single" ? "Single / Prototype" : "Bulk Order";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@600;700;800&display=swap');
        .jua-contact, .jua-contact *, .jua-contact *::before, .jua-contact *::after { box-sizing: border-box; }
        .jua-contact {
          --deep:#060E1C; --navy:#0A2A57; --blue:#123E78; --accent:#3A8FE8; --white:#FFFFFF;
          min-height:100vh; width:100%; background:var(--deep);
          font-family:'Barlow',sans-serif; color:var(--white);
          position:relative; overflow-x:hidden;
        }
        .jc-bg{
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(18,62,120,0.5) 0%,transparent 70%),
            radial-gradient(ellipse 40% 40% at 90% 90%, rgba(58,143,232,0.06) 0%,transparent 60%),
            var(--deep);
        }
        .jc-grid{
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(58,143,232,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(58,143,232,0.04) 1px,transparent 1px);
          background-size:64px 64px;
        }
        .contact-page{
          position:relative; z-index:2; min-height:100vh;
          display:grid; grid-template-columns:1fr 1.4fr; gap:0;
        }
        .contact-left{
          padding:140px 56px 80px;
          display:flex; flex-direction:column;
          border-right:1px solid rgba(58,143,232,0.1);
          position:sticky; top:0; height:100vh; overflow:hidden;
        }
        .contact-eyebrow{
          font-size:10px; font-weight:600; letter-spacing:5px;
          text-transform:uppercase; color:var(--accent);
          margin-bottom:24px; display:flex; align-items:center; gap:10px;
        }
        .contact-eyebrow-dot{
          width:6px; height:6px; border-radius:50%;
          background:var(--accent); box-shadow:0 0 8px var(--accent);
          animation: jcBlink 2s ease-in-out infinite;
        }
        @keyframes jcBlink{ 0%,100%{opacity:1;box-shadow:0 0 8px var(--accent);} 50%{opacity:.2;box-shadow:none;} }
        .contact-headline{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(48px,6vw,80px);
          letter-spacing:3px; line-height:.92;
          color:var(--white); margin-bottom:24px;
        }
        .contact-headline em{ font-style:normal; color:transparent; -webkit-text-stroke:1px var(--accent); }
        .contact-desc{
          font-size:14px; font-weight:300; color:rgba(255,255,255,0.45);
          line-height:1.8; max-width:320px; margin-bottom:48px;
        }
        .contact-info-list{ display:flex; flex-direction:column; gap:20px; }
        .contact-info-item{ display:flex; align-items:flex-start; gap:14px; }
        .cii-icon{
          width:36px; height:36px; border-radius:8px;
          border:1px solid rgba(58,143,232,0.2);
          background:rgba(10,42,87,0.4);
          display:flex; align-items:center; justify-content:center;
          font-size:15px; flex-shrink:0;
        }
        .cii-label{ font-size:9px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:rgba(58,143,232,0.6); margin-bottom:3px; }
        .cii-value{ font-size:12px; color:rgba(255,255,255,0.5); line-height:1.5; }
        .cii-value a{ color:rgba(255,255,255,0.5); text-decoration:none; transition:color .3s; }
        .cii-value a:hover{ color:var(--white); }
        .contact-left-line{
          margin-top:auto; padding-top:40px;
          border-top:1px solid rgba(255,255,255,0.06);
          font-size:10px; font-weight:400; letter-spacing:2px;
          text-transform:uppercase; color:rgba(255,255,255,0.18);
        }
        .contact-right{ padding:140px 56px 80px; }
        .contact-form{ max-width:580px; display:flex; flex-direction:column; }
        .form-progress{ display:flex; align-items:center; margin-bottom:48px; }
        .form-step{
          display:flex; align-items:center; gap:8px;
          font-size:10px; font-weight:600; letter-spacing:3px;
          text-transform:uppercase; color:rgba(255,255,255,0.2);
          transition:color .4s;
        }
        .form-step.active{ color:var(--accent); }
        .form-step.done{ color:rgba(255,255,255,0.35); }
        .step-num{
          width:24px; height:24px; border-radius:50%;
          border:1px solid rgba(255,255,255,0.1);
          display:flex; align-items:center; justify-content:center;
          font-size:10px; transition:all .4s;
        }
        .form-step.active .step-num{ border-color:var(--accent); color:var(--accent); box-shadow:0 0 12px rgba(58,143,232,0.3); }
        .form-step.done .step-num{ background:rgba(58,143,232,0.15); border-color:rgba(58,143,232,0.3); color:rgba(58,143,232,0.7); }
        .step-line{ flex:1; height:1px; background:rgba(255,255,255,0.07); margin:0 12px; }
        .form-group{ margin-bottom:28px; }
        .form-group.half-row{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:28px; }
        .form-label{
          display:block; font-size:10px; font-weight:600; letter-spacing:3px;
          text-transform:uppercase; color:#ffffff; margin-bottom:10px;
        }
        .form-input, .form-textarea, .form-select{
          width:100%;
          background:rgba(10,42,87,0.2);
          border:1px solid rgba(58,143,232,0.15);
          border-radius:4px; padding:14px 18px;
          font-family:'Barlow',sans-serif;
          font-size:14px; font-weight:400; color:var(--white);
          outline:none; transition:border-color .3s, box-shadow .3s, background .3s;
          -webkit-appearance:none;
        }
        .form-input::placeholder, .form-textarea::placeholder{ color:rgba(255,255,255,0.2); }
        .form-input:focus, .form-textarea:focus, .form-select:focus{
          border-color:rgba(58,143,232,0.5);
          background:rgba(10,42,87,0.35);
          box-shadow:0 0 0 3px rgba(58,143,232,0.07), 0 4px 20px rgba(0,0,0,0.2);
        }
        .form-textarea{ resize:vertical; min-height:120px; line-height:1.6; }
        .form-select{
          cursor:pointer;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%233A8FE8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 16px center; padding-right:40px;
        }
        .form-select option{ background:#0A2A57; color:var(--white); }
        .option-cards{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .option-card{
          position:relative; padding:16px 18px;
          border:1px solid rgba(58,143,232,0.15);
          border-radius:4px; cursor:pointer;
          background:rgba(10,42,87,0.2); transition:all .3s; user-select:none;
        }
        .option-card:hover{ border-color:rgba(58,143,232,0.35); background:rgba(10,42,87,0.35); }
        .option-card.selected{
          border-color:var(--accent);
          background:rgba(58,143,232,0.1);
          box-shadow:0 0 0 1px rgba(58,143,232,0.2), 0 4px 20px rgba(58,143,232,0.1);
        }
        .option-card-icon{ font-size:22px; margin-bottom:8px; display:block; }
        .option-card-title{
          font-family:'Barlow Condensed',sans-serif;
          font-size:14px; font-weight:700; letter-spacing:1px;
          text-transform:uppercase; color:var(--white); margin-bottom:4px;
        }
        .option-card-desc{ font-size:11px; font-weight:300; color:rgba(255,255,255,0.4); line-height:1.4; }
        .option-card-check{
          position:absolute; top:12px; right:12px;
          width:18px; height:18px; border-radius:50%;
          border:1px solid rgba(58,143,232,0.3);
          display:flex; align-items:center; justify-content:center;
          transition:all .3s;
        }
        .option-card.selected .option-card-check{ background:var(--accent); border-color:var(--accent); }
        .option-card.selected .option-card-check::after{ content:'✓'; font-size:10px; color:#fff; line-height:1; }
        .order-tabs{
          display:flex; border:1px solid rgba(58,143,232,0.15);
          border-radius:4px; overflow:hidden;
        }
        .order-tab{
          flex:1; padding:12px 16px;
          font-family:'Barlow Condensed',sans-serif;
          font-size:12px; font-weight:700; letter-spacing:2px;
          text-transform:uppercase;
          background:rgba(10,42,87,0.2); color:rgba(255,255,255,0.4);
          border:none; cursor:pointer; transition:all .3s;
          border-right:1px solid rgba(58,143,232,0.1);
        }
        .order-tab:last-child{ border-right:none; }
        .order-tab:hover{ background:rgba(10,42,87,0.4); color:var(--white); }
        .order-tab.active{ background:rgba(58,143,232,0.15); color:var(--white); box-shadow:inset 0 -2px 0 var(--accent); }
        .bulk-qty{ display:flex; flex-wrap:wrap; gap:10px; margin-top:16px; }
        .bulk-qty-label{ width:100%; font-size:10px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:rgba(58,143,232,0.6); margin-bottom:4px; }
        .qty-btn{
          padding:10px 20px;
          border:1px solid rgba(58,143,232,0.15);
          border-radius:3px;
          font-family:'Barlow Condensed',sans-serif;
          font-size:13px; font-weight:700; letter-spacing:1px;
          color:rgba(255,255,255,0.45);
          background:rgba(10,42,87,0.2);
          cursor:pointer; transition:all .3s;
        }
        .qty-btn:hover{ border-color:rgba(58,143,232,0.4); color:var(--white); }
        .qty-btn.active{ border-color:var(--accent); color:var(--white); background:rgba(58,143,232,0.12); }
        .form-divider{ display:flex; align-items:center; gap:16px; margin:8px 0 32px; }
        .form-divider-line{ flex:1; height:1px; background:rgba(255,255,255,0.06); }
        .form-divider-label{ font-size:9px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:rgba(255,255,255,0.18); }
        .form-submit{
          position:relative; width:100%; margin-top:16px;
          padding:18px 40px; border-radius:4px;
          font-family:'Barlow Condensed',sans-serif;
          font-size:13px; font-weight:700; letter-spacing:4px;
          text-transform:uppercase; color:var(--white);
          cursor:pointer;
          background:linear-gradient(135deg,#0A2A57,#1a5299);
          border:1px solid rgba(58,143,232,0.3);
          overflow:hidden; transition:all .3s;
          display:flex; align-items:center; justify-content:center; gap:12px;
        }
        .form-submit::before{
          content:''; position:absolute; top:0; left:-100%;
          width:100%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);
          transition:left .5s;
        }
        .form-submit:hover::before{ left:100%; }
        .form-submit:hover{
          background:linear-gradient(135deg,#123E78,#1e5fa8);
          border-color:rgba(58,143,232,0.5);
          box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 20px rgba(58,143,232,0.1);
          transform:translateY(-1px);
        }
        .form-submit:disabled{ opacity:.6; cursor:not-allowed; transform:none; }
        .submit-arrow{ transition:transform .3s; }
        .form-submit:hover .submit-arrow{ transform:translateX(4px); }
        .thankyou{
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; min-height:60vh; padding:60px 24px;
          animation: jcFadeUp .8s ease both;
        }
        @keyframes jcFadeUp{ from{opacity:0; transform:translateY(24px);} to{opacity:1; transform:translateY(0);} }
        .ty-icon{
          width:80px; height:80px; border-radius:50%;
          border:1px solid rgba(58,143,232,0.3);
          background:rgba(58,143,232,0.08);
          display:flex; align-items:center; justify-content:center;
          font-size:36px; margin-bottom:32px;
          box-shadow:0 0 40px rgba(58,143,232,0.15);
          animation: jcIconPop .6s cubic-bezier(0.34,1.56,0.64,1) .3s both;
        }
        @keyframes jcIconPop{ from{transform:scale(.5); opacity:0;} to{transform:scale(1); opacity:1;} }
        .ty-headline{ font-family:'Bebas Neue',sans-serif; font-size:clamp(36px,5vw,60px); letter-spacing:3px; color:var(--white); margin-bottom:16px; line-height:1; }
        .ty-sub{ font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--accent); margin-bottom:24px; }
        .ty-body{ font-size:14px; font-weight:300; color:rgba(255,255,255,0.5); line-height:1.8; max-width:420px; margin-bottom:40px; }
        .ty-details{
          background:rgba(10,42,87,0.3);
          border:1px solid rgba(58,143,232,0.12);
          border-radius:4px; padding:20px 28px;
          text-align:left; width:100%; max-width:420px; margin-bottom:40px;
        }
        .ty-detail-row{
          display:flex; justify-content:space-between; align-items:center;
          padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:12px;
        }
        .ty-detail-row:last-child{ border-bottom:none; }
        .ty-detail-key{ font-weight:600; letter-spacing:2px; text-transform:uppercase; color:rgba(58,143,232,0.6); }
        .ty-detail-val{ color:rgba(255,255,255,0.6); text-align:right; }
        .ty-btn{
          display:inline-flex; align-items:center; gap:10px;
          font-family:'Barlow Condensed',sans-serif;
          font-size:12px; font-weight:700; letter-spacing:3px;
          text-transform:uppercase; color:rgba(255,255,255,0.5);
          text-decoration:none;
          border:1px solid rgba(255,255,255,0.1);
          padding:12px 28px; border-radius:3px; transition:all .3s;
        }
        .ty-btn:hover{ color:var(--white); border-color:rgba(58,143,232,0.3); }
        @media(max-width:900px){
          .contact-page{ grid-template-columns:1fr; }
          .contact-left{
            position:static; height:auto;
            padding:120px 32px 48px;
            border-right:none; border-bottom:1px solid rgba(58,143,232,0.1);
          }
          .contact-right{ padding:48px 32px 80px; }
          .contact-left-line{ display:none; }
        }
        @media(max-width:600px){
          .contact-left{ padding:110px 20px 40px; }
          .contact-right{ padding:40px 20px 80px; }
          .form-group.half-row{ grid-template-columns:1fr; }
          .option-cards{ grid-template-columns:1fr; }
          .form-progress{ display:none; }
        }
        .form-input.invalid, .form-textarea.invalid, .form-select.invalid{
          border-color:#ff5577 !important;
          box-shadow:0 0 0 3px rgba(255,85,119,0.12) !important;
          background:rgba(120,20,40,0.18) !important;
          animation: jcShake .45s ease;
        }
        .option-cards.invalid, .order-tabs.invalid, .bulk-qty.invalid{
          outline:1px solid #ff5577;
          outline-offset:4px;
          border-radius:6px;
          animation: jcShake .45s ease;
        }
        @keyframes jcShake{
          0%,100%{transform:translateX(0);}
          25%{transform:translateX(-4px);}
          75%{transform:translateX(4px);}
        }
        @media(min-width:901px){
          .contact-left{ padding-top:220px; }
          .contact-right{ padding-top:220px; }
        }
      `}</style>

      <SiteNav />

      <div className="jua-contact">
        <div className="jc-bg" />
        <div className="jc-grid" />

        <div className="contact-page">
          <div className="contact-left">
            <div className="contact-eyebrow">
              <div className="contact-eyebrow-dot" />
              Get In Touch
            </div>
            <h1 className="contact-headline">
              LET'S BUILD<br />SOMETHING<br /><em>REAL.</em>
            </h1>
            <p className="contact-desc">
              Tell us about your project. Whether it's a single prototype or a full bulk production run — JUA 3D Print Lab is ready to deliver with precision.
            </p>
            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="cii-icon">✉</div>
                <div>
                  <div className="cii-label">Email</div>
                  <div className="cii-value"><a href="mailto:jua3d.official@gmail.com">jua3d.official@gmail.com</a></div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="cii-icon">📞</div>
                <div>
                  <div className="cii-label">Phone</div>
                  <div className="cii-value"><a href="tel:+919656033791">+91 96560 33791</a></div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="cii-icon">📍</div>
                <div>
                  <div className="cii-label">Location</div>
                  <div className="cii-value">Thiruvali, Wandoor<br />Kerala, India — 676123</div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="cii-icon">⏱</div>
                <div>
                  <div className="cii-label">Response Time</div>
                  <div className="cii-value">We reply within 24 hours</div>
                </div>
              </div>
            </div>
            <div className="contact-left-line">Design · Engineer · Print · Kerala, India</div>
          </div>

          <div className="contact-right">
            {!done ? (
              <>
                <div className="form-progress">
                  <div className={`form-step${step1Done ? " done" : " active"}`}>
                    <span className="step-num">1</span>Your Details
                  </div>
                  <div className="step-line" />
                  <div className={`form-step${step2Done ? " done" : step1Done ? " active" : ""}`}>
                    <span className="step-num">2</span>Your Project
                  </div>
                  <div className="step-line" />
                  <div className={`form-step${step2Done ? " active" : ""}`}>
                    <span className="step-num">3</span>Order Info
                  </div>
                </div>

                <form className="contact-form" onSubmit={submit} noValidate>
                  <div className="form-divider">
                    <div className="form-divider-line" />
                    <div className="form-divider-label">01 — Your Details</div>
                    <div className="form-divider-line" />
                  </div>

                  <div className="form-group half-row">
                    <div>
                      <label className="form-label" htmlFor="name">Full Name *</label>
                      <input className="form-input" type="text" id="name" placeholder="Your name" required
                        value={data.name} onChange={(e) => set("name", e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="business">Business / Company</label>
                      <input className="form-input" type="text" id="business" placeholder="Company name (optional)"
                        value={data.business} onChange={(e) => set("business", e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group half-row">
                    <div>
                      <label className="form-label" htmlFor="email">Email Address *</label>
                      <input className="form-input" type="email" id="email" placeholder="your@email.com" required
                        value={data.email} onChange={(e) => set("email", e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="phone">Phone Number *</label>
                      <input className="form-input" type="tel" id="phone" placeholder="+91 XXXXX XXXXX" required
                        value={data.phone} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                  </div>

                  <div className="form-divider">
                    <div className="form-divider-line" />
                    <div className="form-divider-label">02 — Your Project</div>
                    <div className="form-divider-line" />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="industry">Industry / Category</label>
                    <select className="form-select" id="industry"
                      value={data.industry} onChange={(e) => set("industry", e.target.value)}>
                      <option value="" disabled>Select your industry</option>
                      <option>Medical & Healthcare</option>
                      <option>Architecture & Interior Design</option>
                      <option>Gaming & Tech</option>
                      <option>Home Décor & Lifestyle</option>
                      <option>Smart Home Utility</option>
                      <option>Custom Gift & Business</option>
                      <option>Automotive & Travel</option>
                      <option>Toys & Collectibles</option>
                      <option>Kitchen & Household</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="products">What Products Are You Looking to Print? *</label>
                    <textarea className="form-textarea" id="products" required
                      placeholder="Describe the products you need — e.g. Anatomical brain model for medical training, 1:100 scale building model for architecture presentation..."
                      value={data.products} onChange={(e) => set("products", e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Do You Have a Design Ready?</label>
                    <div className="option-cards">
                      <label className={`option-card${data.design_status === "yes" ? " selected" : ""}`}>
                        <input type="radio" name="design_status" value="yes"
                          checked={data.design_status === "yes"}
                          onChange={() => set("design_status", "yes")}
                          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                        <span className="option-card-icon">📁</span>
                        <div className="option-card-title">Yes, I have a design</div>
                        <div className="option-card-desc">I have a 3D file (STL, OBJ, STEP etc.) ready to print</div>
                        <div className="option-card-check" />
                      </label>
                      <label className={`option-card${data.design_status === "no" ? " selected" : ""}`}>
                        <input type="radio" name="design_status" value="no"
                          checked={data.design_status === "no"}
                          onChange={() => set("design_status", "no")}
                          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                        <span className="option-card-icon">✏️</span>
                        <div className="option-card-title">I need a design</div>
                        <div className="option-card-desc">I have an idea but need JUA to design and engineer it</div>
                        <div className="option-card-check" />
                      </label>
                    </div>
                  </div>

                  <div className="form-divider">
                    <div className="form-divider-line" />
                    <div className="form-divider-label">03 — Order Information</div>
                    <div className="form-divider-line" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Order Type</label>
                    <div className="order-tabs">
                      <button type="button"
                        className={`order-tab${data.order_type === "single" ? " active" : ""}`}
                        onClick={() => set("order_type", "single")}>Single / Prototype</button>
                      <button type="button"
                        className={`order-tab${data.order_type === "bulk" ? " active" : ""}`}
                        onClick={() => set("order_type", "bulk")}>Bulk Order</button>
                    </div>

                    {data.order_type === "bulk" && (
                      <div className="bulk-qty">
                        <div className="bulk-qty-label">Approximate Quantity</div>
                        {[
                          ["20", "Up to 20 units"],
                          ["50", "Up to 50 units"],
                          ["100", "Up to 100 units"],
                          ["500", "Up to 500 units"],
                          ["500+", "500+ units"],
                        ].map(([label, val]) => (
                          <button type="button" key={label}
                            className={`qty-btn${data.bulk_qty === val ? " active" : ""}`}
                            onClick={() => set("bulk_qty", val)}>{label}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="timeline">Timeline / Deadline</label>
                    <select className="form-select" id="timeline"
                      value={data.timeline} onChange={(e) => set("timeline", e.target.value)}>
                      <option value="" disabled>When do you need it?</option>
                      <option>ASAP — Urgent</option>
                      <option>Within 1 week</option>
                      <option>Within 2 weeks</option>
                      <option>Within a month</option>
                      <option>Flexible — no rush</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">Any Additional Notes</label>
                    <textarea className="form-textarea" id="notes" style={{ minHeight: 90 }}
                      placeholder="Special requirements, material preferences, color, finish, reference images to share later..."
                      value={data.notes} onChange={(e) => set("notes", e.target.value)} />
                  </div>

                  <button type="submit" className="form-submit" disabled={submitting}>
                    <span>{submitting ? "Sending..." : "Send Enquiry to JUA"}</span>
                    <span className="submit-arrow">→</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="thankyou">
                <div className="ty-icon">✓</div>
                <h2 className="ty-headline">Message Sent!</h2>
                <p className="ty-sub">JUA 3D Print Lab · We Got You</p>
                <p className="ty-body">
                  Thank you for reaching out. Our team has received your enquiry and will get back to you within <strong>24 hours</strong>. We're excited to bring your idea to life — layer by layer.
                </p>
                <div className="ty-details">
                  <div className="ty-detail-row"><span className="ty-detail-key">Name</span><span className="ty-detail-val">{data.name}</span></div>
                  <div className="ty-detail-row"><span className="ty-detail-key">Email</span><span className="ty-detail-val">{data.email}</span></div>
                  <div className="ty-detail-row"><span className="ty-detail-key">Order Type</span><span className="ty-detail-val">{orderTypeLabel}</span></div>
                  <div className="ty-detail-row"><span className="ty-detail-key">Industry</span><span className="ty-detail-val">{data.industry || "Not selected"}</span></div>
                  <div className="ty-detail-row"><span className="ty-detail-key">Response In</span><span className="ty-detail-val">Within 24 hours</span></div>
                </div>
                <a href="/" className="ty-btn">← Back to Home</a>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
