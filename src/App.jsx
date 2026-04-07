import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   EMAILJS CONFIG  ← paste your IDs here after setup
   1. Free account → https://emailjs.com
   2. Email Services → Add Gmail → copy Service ID
   3. Email Templates → create one with vars:
      {{from_name}}  {{from_email}}  {{message}}  {{to_email}}
      → copy Template ID
   4. Account → API Keys → copy Public Key
════════════════════════════════════════════════════════ */
const EMAILJS_SERVICE_ID  = "service_z4xulh8";
const EMAILJS_TEMPLATE_ID = "template_ihhpeot";
const EMAILJS_PUBLIC_KEY  = "1WmmI_huZUy1CNqCh";
const RECIPIENT_EMAIL     = "bmaurya147369@gmail.com";

/* ═══════════════ THEME TOKENS ═══════════════ */
const THEMES = {
  dark: {
    bg:"#080808", bg2:"#0d0d0d", card:"#111111", cardHov:"#161616",
    surf:"#1a1a1a", bdr:"rgba(255,255,255,0.07)", bdrHov:"rgba(184,151,90,0.45)",
    txt:"#f0ede6", sub:"#888880", muted:"#444441",
    gold:"#b8975a", goldL:"#d4b87a", goldF:"rgba(184,151,90,0.07)",
    nav:"rgba(8,8,8,0.93)", pillBg:"#1a1a1a", pillTxt:"#888880",
    inp:"#0d0d0d", foot:"#040404", dlBg:"#080808",
  },
  light: {
    bg:"#fafaf8", bg2:"#f2f0ea", card:"#ffffff", cardHov:"#f8f6f1",
    surf:"#ece9e2", bdr:"rgba(0,0,0,0.08)", bdrHov:"rgba(154,122,58,0.4)",
    txt:"#0a0a0a", sub:"#6b6b68", muted:"#b0aea8",
    gold:"#9a7a3a", goldL:"#b89050", goldF:"rgba(154,122,58,0.07)",
    nav:"rgba(250,250,248,0.93)", pillBg:"#ece9e2", pillTxt:"#6b6b68",
    inp:"#f2f0ea", foot:"#080808", dlBg:"#0a0a0a",
  },
};

/* ═══════════════ HOOKS ═══════════════ */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

/* ═══════════════ MICRO COMPONENTS ═══════════════ */

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(22px)",
      transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Aurora({ isDark }) {
  const [pos, setPos] = useState({ x: -400, y: -400 });
  useEffect(() => {
    if (!isDark) return;
    const h = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [isDark]);
  if (!isDark) return null;
  return (
    <div style={{
      position:"fixed", pointerEvents:"none", zIndex:0,
      left: pos.x - 240, top: pos.y - 240, width:480, height:480,
      borderRadius:"50%",
      background:"radial-gradient(circle, rgba(184,151,90,0.05) 0%, transparent 70%)",
      transition:"left .08s, top .08s",
    }}/>
  );
}

function Typewriter({ words }) {
  const [idx, setIdx] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  const [blink, setBlink] = useState(true);
  useEffect(() => { const t = setInterval(() => setBlink(b => !b), 530); return () => clearInterval(t); }, []);
  useEffect(() => {
    const cur = words[idx];
    const id = setTimeout(() => {
      if (!del) {
        const n = cur.slice(0, txt.length + 1);
        setTxt(n);
        if (n === cur) setTimeout(() => setDel(true), 1800);
      } else {
        const n = cur.slice(0, txt.length - 1);
        setTxt(n);
        if (!n) { setDel(false); setIdx(i => (i + 1) % words.length); }
      }
    }, del ? 32 : 72);
    return () => clearTimeout(id);
  }, [txt, del, idx, words]);
  return <span>{txt}<span style={{ opacity: blink ? 1 : 0 }}>|</span></span>;
}

function SkillBar({ label, pct, gold, goldL, bdr, sub, delay = 0 }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:12, color:sub }}>{label}</span>
        <span style={{ fontSize:11, color:gold, fontWeight:500 }}>{pct}%</span>
      </div>
      <div style={{ height:2, background:bdr, borderRadius:2, overflow:"hidden" }}>
        <div style={{
          height:"100%", borderRadius:2,
          width: vis ? `${pct}%` : "0%",
          background:`linear-gradient(90deg,${gold},${goldL})`,
          transition:`width 1.2s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        }}/>
      </div>
    </div>
  );
}

function SectionHead({ tag, title, gold }) {
  return (
    <Reveal>
      <div style={{ marginBottom:"1.8rem" }}>
        <span style={{ fontSize:10, letterSpacing:".22em", textTransform:"uppercase", color:gold, display:"block", marginBottom:10 }}>{tag}</span>
        <div style={{ width:36, height:1, background:gold, marginBottom:14 }}/>
        <h2
          style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.7rem,3vw,2.6rem)", fontWeight:300, lineHeight:1.15 }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </div>
    </Reveal>
  );
}

/* ═══════════════ MAIN APP ═══════════════ */
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const c = THEMES[theme];
  const dk = theme === "dark";
  const vw = useWindowWidth();
  const mob = vw <= 860;
  const sm  = vw <= 560;

  /* scroll spy for nav background */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* lock body when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
    setMenuOpen(false);
  };

  /* ── Contact form state ── */
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [fState, setFState] = useState("idle"); // idle | sending | success | error
  const [fErr, setFErr] = useState("");

  const onChange = (e) => {
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  const sendEmail = useCallback(async () => {
    const { name, email, message } = form;

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFErr("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFErr("Please enter a valid email address.");
      return;
    }

    setFErr("");
    setFState("sending");

    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            time: new Date().toLocaleString(),
            to_email: RECIPIENT_EMAIL,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      setFState("success");
      setForm({ name: "", email: "", message: "" });

      setTimeout(() => {
        setFState("idle");
      }, 6000);
    } catch (error) {
      console.error("Email send failed:", error);
      setFErr("Failed to send message. Please try again.");
      setFState("error");

      setTimeout(() => {
        setFState("idle");
      }, 5000);
    }
  }, [form]);
  /* ── Data ── */
  const skillGroups = {
    Backend:  [{ label:"Java / Spring Boot", pct:95 },{ label:"Apache Kafka", pct:88 },{ label:"Microservices", pct:90 },{ label:"Spring Security / OAuth2", pct:85 }],
    Frontend: [{ label:"Angular", pct:90 },{ label:"React / Redux", pct:88 },{ label:"TypeScript", pct:85 },{ label:"RxJS / NgRx", pct:82 }],
    "Data & DevOps": [{ label:"PostgreSQL / MySQL", pct:85 },{ label:"Redis / MongoDB", pct:80 },{ label:"Docker / Kubernetes", pct:78 },{ label:"AWS / CI/CD", pct:75 }],
  };

  const exp = [
    { period:"2025 — Present", role:"Senior Software Engineer", co:"KPIT TECHNOLOGY",
      desc:"Lead full stack development of enterprise-grade applications. Architect event-driven microservices using Apache Kafka for high-throughput data pipelines. Deliver scalable REST APIs with Spring Boot and responsive SPAs with React and Angular.",
      tags:["Java","Spring Boot","Kafka","React","Angular","AWS"] },
    { period:"2023 — 2025", role:"Software Engineer", co:"KPIT TECHNOLOGY",
      desc:"Built RESTful APIs and business logic in Spring Boot while creating rich UIs in Angular. Improved performance by 40% through query optimisation and Redis caching strategies.",
      tags:["Java","Spring MVC","Angular","PostgreSQL","Redis","Docker"] },
    { period:"2022 — 2023", role:"Junior Software Developer", co:"KPIT TECHNOLOGY",
      desc:"Started my professional journey building web applications, writing unit & integration tests, and collaborating in agile cycles. Rapidly grew to owning complete features end-to-end.",
      tags:["Java","Spring","JavaScript","MySQL","JUnit"] },
  ];

  const projects = [
    { n:"01", cat:"Event-Driven Architecture", title:"Real-Time Data Streaming Platform",    desc:"High-throughput event streaming with Kafka. Handles millions of events/day with guaranteed delivery, replay, and consumer group management.",    tech:["Kafka","Spring Boot","Java","Elasticsearch"] },
    { n:"02", cat:"Full Stack Application",    title:"Enterprise Order Management System",   desc:"End-to-end OMS with real-time inventory tracking, workflow automation, RBAC, and an intuitive Angular ops dashboard.",                             tech:["Angular","Spring Boot","PostgreSQL","Docker"] },
    { n:"03", cat:"Microservices",             title:"Distributed Authentication Service",   desc:"Centralised auth with JWT, OAuth2, and SSO. Spring Security + Redis session management + React admin portal.",                                    tech:["Spring Security","React","Redis","OAuth2"] },
    { n:"04", cat:"API Development",           title:"RESTful Microservices Suite",          desc:"API Gateway, Eureka discovery, centralised config, Zipkin tracing, and full Swagger docs across all services.",                                   tech:["Spring Cloud","Eureka","Zipkin","Kubernetes"] },
    { n:"05", cat:"Frontend SPA",             title:"Analytics Dashboard — React",           desc:"Real-time charts, advanced filtering, lazy loading, and Redux state. 60% faster initial load via code splitting.",                                 tech:["React","Redux","TypeScript","REST APIs"] },
    { n:"06", cat:"DevOps & CI/CD",           title:"CI/CD Pipeline Automation",            desc:"Automated build/test/deploy pipelines. Reduced deployment time from hours to minutes with zero-downtime rolling updates.",                         tech:["Jenkins","Docker","Kubernetes","AWS"] },
  ];

  const allTech  = ["Java","Spring Boot","Kafka","Angular","React","TypeScript","PostgreSQL","Redis","Docker","Kubernetes","AWS","Hibernate","Spring Security","OAuth2","JUnit","Mockito","Git","Maven"];
  const featTech = ["Java","Spring Boot","Kafka","Angular","React"];

  const SP = sm ? "2.5rem 5vw" : mob ? "3rem 5vw" : "4.5rem 5vw";

  /* ── Dynamic CSS injected as <style> — NO @import here ── */
  const dynCSS = `
    ::selection { background:${c.gold}; color:#000; }
    ::-webkit-scrollbar-thumb { background:${c.gold}; }

    .nav-link { color:${c.sub}; text-decoration:none; font-size:11px; letter-spacing:.15em; text-transform:uppercase; transition:color .2s; }
    .nav-link:hover { color:${c.gold}; }

    .hire-btn { padding:7px 18px; border:1px solid ${c.gold}; color:${c.gold}; font-size:10px; letter-spacing:.14em; text-transform:uppercase; text-decoration:none; font-family:'DM Sans',sans-serif; background:transparent; cursor:pointer; transition:all .25s; }
    .hire-btn:hover { background:${c.gold}; color:${dk ? "#080808" : "#fff"}; }

    .tog { width:46px; height:24px; border-radius:12px; border:1px solid ${c.bdr}; background:${c.surf}; cursor:pointer; display:flex; align-items:center; padding:3px; flex-shrink:0; }
    .knob { width:16px; height:16px; border-radius:50%; background:${c.gold}; transform:translateX(${dk ? "0" : "22px"}); transition:transform .3s cubic-bezier(.34,1.56,.64,1); display:flex; align-items:center; justify-content:center; font-size:9px; }

    .ham { background:transparent; border:none; cursor:pointer; padding:5px; display:flex; flex-direction:column; gap:5px; }
    .ham-line { width:22px; height:1.5px; background:${c.txt}; display:block; border-radius:1px; transition:all .3s; }
    .ham.is-open .ham-line:nth-child(1) { transform:translateY(6.5px) rotate(45deg); }
    .ham.is-open .ham-line:nth-child(2) { opacity:0; transform:scaleX(0); }
    .ham.is-open .ham-line:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg); }

    .mob-menu { position:fixed; inset:0; background:${c.bg}; z-index:200; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2rem; transition:opacity .3s, transform .3s; }
    .mob-menu.closed { opacity:0; pointer-events:none; transform:translateY(-8px); }
    .mob-menu.open   { opacity:1; pointer-events:auto; transform:none; }
    .mob-link { font-family:'Cormorant Garamond',serif; font-size:clamp(1.7rem,6vw,2.4rem); font-weight:300; color:${c.txt}; text-decoration:none; letter-spacing:.04em; transition:color .2s; }
    .mob-link:hover { color:${c.gold}; }

    .btn-p { padding:11px 28px; background:${c.gold}; color:${dk ? "#080808" : "#fff"}; border:none; font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:.13em; text-transform:uppercase; cursor:pointer; font-weight:500; transition:background .25s; white-space:nowrap; }
    .btn-p:hover { background:${c.goldL}; }
    .btn-g { background:transparent; border:1px solid ${c.bdr}; color:${c.txt}; padding:11px 26px; font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:.13em; text-transform:uppercase; cursor:pointer; transition:all .25s; white-space:nowrap; }
    .btn-g:hover { border-color:${c.gold}; color:${c.gold}; }

    .hl-card { padding:1.25rem; border:1px solid ${c.bdr}; background:${c.card}; transition:all .3s; display:flex; flex-direction:column; min-height:130px; }
    .hl-card:hover { border-color:${c.gold}; transform:translateY(-2px); }

    .pill { padding:4px 12px; border:1px solid ${c.bdr}; font-size:11px; color:${c.pillTxt}; background:${c.pillBg}; transition:all .2s; cursor:default; display:inline-block; }
    .pill:hover { border-color:${c.gold}; color:${c.gold}; }
    .pill.ft { background:${c.gold}; border-color:${c.gold}; color:${dk ? "#080808" : "#fff"}; font-weight:500; }

    .proj-grid { display:grid; gap:1px; background:${c.bdr}; }
    .proj-card { background:${c.card}; border:1px solid ${c.bdr}; padding:1.6rem; transition:all .3s; position:relative; overflow:hidden; display:flex; flex-direction:column; }
    .proj-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,${c.goldF} 0%,transparent 60%); opacity:0; transition:opacity .3s; pointer-events:none; }
    .proj-card:hover { border-color:${c.bdrHov}; background:${c.cardHov}; transform:translateY(-3px); }
    .proj-card:hover::before { opacity:1; }

    .exp-card { border-left:1px solid ${c.bdr}; padding-left:1.8rem; margin-bottom:2.5rem; position:relative; transition:border-color .3s; }
    .exp-card:last-child { margin-bottom:0; }
    .exp-card:hover { border-left-color:${c.gold}; }
    .exp-card::before { content:''; position:absolute; left:-5px; top:5px; width:9px; height:9px; border-radius:50%; background:${c.gold}; box-shadow:0 0 8px ${c.gold}55; }

    .stat-card { border:1px solid ${c.bdr}; padding:1.5rem; background:${c.card}; text-align:center; transition:border-color .3s; }
    .stat-card:hover { border-color:${c.gold}; }

    .c-input { background:${c.inp}; border:1px solid ${c.bdr}; padding:11px 14px; color:${c.txt}; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; width:100%; transition:border-color .2s; }
    .c-input:focus { border-color:${c.gold}; }
    .c-input::placeholder { color:${c.muted}; }
    textarea.c-input { resize:vertical; min-height:100px; }

    .c-row { display:flex; align-items:center; gap:12px; text-decoration:none; color:${c.sub}; font-size:13px; padding:12px 0; border-bottom:1px solid ${c.bdr}; transition:color .2s; }
    .c-row:hover { color:${c.gold}; }
    .c-icon { width:36px; height:36px; border:1px solid ${c.bdr}; display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; transition:border-color .2s; }
    .c-row:hover .c-icon { border-color:${c.gold}; }

    @keyframes fup   { from { opacity:0; transform:translateY(36px); } to { opacity:1; transform:none; } }
    @keyframes spin  { from { transform:rotate(0); } to { transform:rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity:.45; transform:scale(1); } 50% { opacity:.9; transform:scale(1.07); } }
    @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }

    .h-a { animation:fup .7s ease both .05s; }
    .h-b { animation:fup .7s ease both .18s; font-family:'Cormorant Garamond',serif; font-size:clamp(2.8rem,8.5vw,6.8rem); font-weight:300; line-height:1; letter-spacing:-.02em; }
    .h-bold { font-weight:600; display:block; background:linear-gradient(90deg,${c.gold},${c.goldL},${c.gold}); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 4s linear infinite, fup .7s ease both .28s; }
    .h-c { animation:fup .7s ease both .38s; }
    .h-d { animation:fup .7s ease both .5s; }
    .h-e { animation:fup .7s ease both .62s; }
    .h-img { animation:fup .9s ease both .3s; }
    .orb { position:absolute; border-radius:50%; border:1px solid ${c.bdr}; animation:spin linear infinite; }
  `;

  /* ── shared inline style shortcuts ── */
  const serif = (size, weight = 300) => ({ fontFamily:"'Cormorant Garamond',serif", fontSize:size, fontWeight:weight });
  const tag10 = { fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color:c.gold };

  return (
    <div style={{ background:c.bg, color:c.txt, fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:16, lineHeight:1.7, minHeight:"100vh", transition:"background .4s, color .4s", overflowX:"hidden" }}>

      {/* Injected dynamic CSS */}
      <style>{dynCSS}</style>

      <Aurora isDark={dk}/>

      {/* ════════ MOBILE MENU ════════ */}
      <div className={`mob-menu ${menuOpen ? "open" : "closed"}`}>
        <div style={{ position:"absolute", top:"1rem", right:"5vw", display:"flex", alignItems:"center", gap:".7rem" }}>
          <button className="tog" onClick={() => setTheme(dk ? "light" : "dark")}><div className="knob">{dk ? "☾" : "☀"}</div></button>
          <button className="ham is-open" onClick={() => setMenuOpen(false)}>
            <span className="ham-line"/><span className="ham-line"/><span className="ham-line"/>
          </button>
        </div>
        {["about","skills","experience","projects","contact"].map(l => (
          <a key={l} href={`#${l}`} className="mob-link" onClick={e => { e.preventDefault(); scrollTo(l); }}>
            {l[0].toUpperCase() + l.slice(1)}
          </a>
        ))}
        <button className="hire-btn" onClick={() => scrollTo("contact")}>Hire Me</button>
      </div>

      {/* ════════ NAV ════════ */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"1rem 5vw",
        background: scrolled ? c.nav : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${c.bdr}` : "1px solid transparent",
        transition:"all .4s",
      }}>
        <a href="#home" onClick={e => { e.preventDefault(); scrollTo("home"); }}
          style={{ ...serif("1.35rem", 500), color:c.txt, textDecoration:"none", letterSpacing:".04em" }}>
          BM
        </a>

        {!mob && (
          <div style={{ display:"flex", gap:"2.2rem" }}>
            {["about","skills","experience","projects","contact"].map(l => (
              <a key={l} href={`#${l}`} className="nav-link" onClick={e => { e.preventDefault(); scrollTo(l); }}>{l}</a>
            ))}
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:".7rem" }}>
          <button className="tog" onClick={() => setTheme(dk ? "light" : "dark")}><div className="knob">{dk ? "☾" : "☀"}</div></button>
          {!mob && <a href="#contact" className="hire-btn" onClick={e => { e.preventDefault(); scrollTo("contact"); }}>Hire Me</a>}
          {mob  && (
            <button className="ham" onClick={() => setMenuOpen(true)}>
              <span className="ham-line"/><span className="ham-line"/><span className="ham-line"/>
            </button>
          )}
        </div>
      </nav>

      {/* ════════ HERO ════════ */}
      <section id="home" style={{
        minHeight: mob ? "auto" : "100vh",
        display:"grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
        padding:`0 5vw`, paddingTop: mob ? 80 : 72, paddingBottom: mob ? "3rem" : 0,
        position:"relative", overflow:"hidden",
      }}>
        {/* orbit rings */}
        <div style={{ position:"absolute", top:"6%", right:"2%", width:mob?200:440, height:mob?200:440, pointerEvents:"none", zIndex:0 }}>
          <div className="orb" style={{ inset:0, animationDuration:"34s" }}/>
          <div className="orb" style={{ inset:"13%", animationDuration:"22s", animationDirection:"reverse" }}/>
          <div className="orb" style={{ inset:"27%", animationDuration:"15s" }}/>
          <div style={{ position:"absolute", inset:"40%", borderRadius:"50%", background:`radial-gradient(circle,${c.goldF} 0%,transparent 70%)`, animation:"pulse 4s ease-in-out infinite" }}/>
        </div>

        {/* Left */}
        <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", padding: mob ? "1.5rem 0 2rem" : "4rem 3rem 4rem 0", position:"relative", zIndex:1 }}>
          <span className="h-a" style={{ fontSize:10, letterSpacing:".26em", textTransform:"uppercase", color:c.gold, marginBottom:"1.2rem", display:"block" }}>
            Senior Full Stack Engineer
          </span>
          <h1 className="h-b" style={{ marginBottom:".4rem" }}>
            Bhoopesh
            <span className="h-bold">Maurya</span>
          </h1>
          <p className="h-c" style={{ fontSize:"clamp(.88rem,1.4vw,1rem)", color:c.sub, maxWidth:390, marginBottom:"2rem", lineHeight:1.7, minHeight:"1.8em" }}>
            <Typewriter words={["Building scalable microservices.","Crafting seamless UIs.","Architecting event-driven systems.","Shipping production-grade code."]}/>
          </p>
          <div className="h-d" style={{ display:"flex", gap:".75rem", flexWrap:"wrap" }}>
            <button className="btn-p" onClick={() => scrollTo("projects")}>View My Work</button>
            <button className="btn-g" onClick={() => scrollTo("contact")}>Let's Connect</button>
          </div>
          <div className="h-e" style={{ display:"flex", gap: sm ? "1.4rem" : "2.2rem", marginTop:"2.5rem", flexWrap:"wrap" }}>
            {[["3+","Years Exp"],["20+","Projects"],["10+","Technologies"]].map(([n,l]) => (
              <div key={l} style={{ borderLeft:`2px solid ${c.gold}`, paddingLeft:".9rem" }}>
                <div style={{ ...serif("1.75rem", 600), color:c.gold, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:10, letterSpacing:".13em", textTransform:"uppercase", color:c.sub, marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — desktop only */}
        {!mob && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1
                  }}
                >
                  <div className="h-img" style={{ position: "relative" }}>
                    
                    {/* Image Container */}
                    <div
                      style={{
                        width: 250,
                        height: 310,
                        borderRadius: "20px",
                        overflow: "hidden",
                        position: "relative",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                      }}
                    >
                      <img
                        src="/profile.jpeg"   // 👉 put image in public folder
                        alt="Bhoopesh Maurya"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />

                      {/* Gradient overlay */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "40%",
                          background: "linear-gradient(transparent, rgba(0,0,0,0.4))"
                        }}
                      />
                    </div>

                    {/* Badge */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: -16,
                        right: -16,
                        width: 78,
                        height: 78,
                        borderRadius: "50%",
                        background: c.bg,
                        border: `1px solid ${c.bdr}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <span style={{ ...serif("1.3rem", 600), color: c.gold, lineHeight: 1 }}>
                        Sr
                      </span>
                      <span
                        style={{
                          fontSize: 8,
                          letterSpacing: ".11em",
                          textTransform: "uppercase",
                          color: c.sub,
                          textAlign: "center",
                          lineHeight: 1.3
                        }}
                      >
                        Eng
                      </span>
                    </div>
                  </div>
                </div>
              )}
      </section>

      {/* ════════ ABOUT ════════ */}
      <section id="about" style={{ padding:SP, background:c.bg2 }}>
        <SectionHead tag="About Me" title="Crafting <em>software</em> that <strong style='font-weight:600'>scales</strong>" gold={c.gold}/>
        <div style={{ display:"grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? "2rem" : "4rem", alignItems:"start" }}>
          <div>
            {["I'm Bhoopesh Maurya, a Senior Software Engineer with deep expertise across the full stack. I specialise in building robust, event-driven microservices on the backend and intuitive, performant UIs on the frontend.",
              "End-to-end ownership is my approach — from architecting Kafka data pipelines and designing REST APIs with Spring Boot, to crafting pixel-perfect interfaces in Angular or React.",
              "I thrive in collaborative environments, enjoy mentoring junior developers, and bring a pragmatic mindset to solving real business problems through technology.",
            ].map((p, i) => (
              <Reveal key={i} delay={i * .1}>
                <p style={{ color:c.sub, marginBottom:"1rem", lineHeight:1.8, fontSize:".94rem" }}>{p}</p>
              </Reveal>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns: sm ? "1fr" : "1fr 1fr", gap:".75rem" }}>
            {[["⚙","Backend Architecture","Microservices, event-driven systems, REST APIs with Spring Boot & Kafka."],
              ["🖥","Frontend Engineering","Responsive, accessible UIs with Angular & React. Focus on performance."],
              ["☁","Cloud & DevOps","CI/CD pipelines, containerisation, cloud-native deployments."],
              ["◈","Clean Code","SOLID principles, TDD, code reviews, maintainable architecture."],
            ].map(([icon, title, desc], i) => (
              <Reveal key={title} delay={i * .08}>
                <div className="hl-card">
                  <div style={{ fontSize:"1.2rem", marginBottom:".6rem" }}>{icon}</div>
                  <h4 style={{ fontSize:12, fontWeight:500, marginBottom:".35rem", color:c.txt }}>{title}</h4>
                  <p style={{ fontSize:11, color:c.sub, lineHeight:1.6, flex:1 }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SKILLS ════════ */}
      <section id="skills" style={{ padding:SP }}>
        <SectionHead tag="Technical Expertise" title="Technologies I <strong style='font-weight:600'>master</strong>" gold={c.gold}/>
        <div style={{ display:"grid", gridTemplateColumns: sm ? "1fr" : mob ? "1fr 1fr" : "repeat(4,1fr)", gap:"1px", background:c.bdr, border:`1px solid ${c.bdr}` }}>
          {Object.entries(skillGroups).map(([group, items], gi) => (
            <Reveal key={group} delay={gi * .07} style={{ display:"contents" }}>
              <div style={{ background:c.card, padding:"1.6rem" }}>
                <div style={{ ...tag10, fontSize:9, marginBottom:"1.2rem" }}>{group}</div>
                {items.map((s, i) => (
                  <SkillBar key={s.label} label={s.label} pct={s.pct} gold={c.gold} goldL={c.goldL} bdr={c.bdr} sub={c.sub} delay={gi * .08 + i * .06}/>
                ))}
              </div>
            </Reveal>
          ))}
          <Reveal delay={.25} style={{ display:"contents" }}>
            <div style={{ background:c.card, padding:"1.6rem" }}>
              <div style={{ ...tag10, fontSize:9, marginBottom:"1.2rem" }}>All Technologies</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem" }}>
                {allTech.map(t => <span key={t} className={`pill${featTech.includes(t) ? " ft" : ""}`}>{t}</span>)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════ EXPERIENCE ════════ */}
      <section id="experience" style={{ padding:SP, background:c.bg2 }}>
        <SectionHead tag="Career Journey" title="Where I've <strong style='font-weight:600'>worked</strong>" gold={c.gold}/>
        {exp.map((e, i) => (
          <Reveal key={e.role} delay={i * .1}>
            <div className="exp-card">
              <div style={{ ...tag10, fontSize:9, marginBottom:5 }}>{e.period}</div>
              <h3 style={{ ...serif("clamp(1.2rem,2.2vw,1.5rem)", 500), marginBottom:3 }}>{e.role}</h3>
              <div style={{ fontSize:12, color:c.sub, marginBottom:".8rem" }}>{e.co}</div>
              <p style={{ color:c.sub, fontSize:13, lineHeight:1.8, maxWidth:660, marginBottom:".8rem" }}>{e.desc}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:".35rem" }}>
                {e.tags.map(tg => (
                  <span key={tg} style={{ fontSize:9, padding:"2px 9px", background:c.goldF, color:c.gold, border:`1px solid ${c.bdrHov}`, letterSpacing:".06em" }}>{tg}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ════════ PROJECTS ════════ */}
      <section id="projects" style={{ padding:SP }}>
        <SectionHead tag="Selected Work" title="Projects I've <strong style='font-weight:600'>built</strong>" gold={c.gold}/>
        <div className="proj-grid" style={{ gridTemplateColumns: sm ? "1fr" : mob ? "1fr 1fr" : "repeat(3,1fr)" }}>
          {projects.map((p, i) => (
            <Reveal key={p.n} delay={i * .06} style={{ display:"contents" }}>
              <div className="proj-card">
                <div style={{ ...serif("2.4rem", 300), color:c.bdr, position:"absolute", top:".9rem", right:".9rem", lineHeight:1, userSelect:"none", pointerEvents:"none" }}>{p.n}</div>
                <div style={{ ...tag10, fontSize:9, marginBottom:".6rem" }}>{p.cat}</div>
                <h3 style={{ ...serif("clamp(1rem,1.6vw,1.2rem)", 500), marginBottom:".6rem", lineHeight:1.3, paddingRight:"2rem" }}>{p.title}</h3>
                <p style={{ fontSize:12, color:c.sub, lineHeight:1.7, marginBottom:"1rem", flex:1 }}>{p.desc}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:".35rem" }}>
                  {p.tech.map(tc => <span key={tc} style={{ fontSize:9, padding:"2px 7px", background:c.surf, color:c.sub, border:`1px solid ${c.bdr}` }}>{tc}</span>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════ STATS ════════ */}
      <section style={{ padding: sm ? "2rem 5vw" : "3rem 5vw", background:c.bg2 }}>
        <div style={{ display:"grid", gridTemplateColumns: sm ? "1fr 1fr" : "repeat(4,1fr)", gap:"1px", background:c.bdr, border:`1px solid ${c.bdr}` }}>
          {[["3+","Years of Experience"],["20+","Projects Shipped"],["10+","Technologies"],["100%","Dedication"]].map(([n, l], i) => (
            <Reveal key={l} delay={i * .08} style={{ display:"contents" }}>
              <div className="stat-card">
                <div style={{ ...serif("clamp(1.5rem,3.5vw,2.6rem)", 600), color:c.gold, lineHeight:1, marginBottom:6 }}>{n}</div>
                <div style={{ fontSize:9, letterSpacing:".14em", textTransform:"uppercase", color:c.sub }}>{l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════ RESUME BANNER ════════ */}
      <div style={{ background:c.gold, padding: sm ? "1.8rem 5vw" : "2.2rem 5vw", display:"flex", justifyContent:"space-between", alignItems: mob ? "flex-start" : "center", gap:"1rem", flexDirection: mob ? "column" : "row" }}>
        <div>
          <h3 style={{ ...serif("clamp(1.2rem,2.5vw,1.6rem)", 500), color: dk ? "#080808" : "#0a0a0a", marginBottom:3 }}>Download My Resume</h3>
          <p style={{ fontSize:12, color:"rgba(0,0,0,.55)" }}>Full profile, experience & references available on request.</p>
        </div>
       <a
        href="/bhoopesh-Maurya-cv.pdf"
        download
        style={{
          padding:"10px 24px",
          background:c.dlBg,
          color:c.gold,
          fontFamily:"'DM Sans',sans-serif",
          fontSize:10,
          letterSpacing:".14em",
          textTransform:"uppercase",
          textDecoration:"none",
          fontWeight:500,
          display:"flex",
          alignItems:"center",
          gap:7,
          whiteSpace:"nowrap"
        }}
      >
        ↓ &nbsp;Download Resume (PDF)
      </a>
      </div>

      {/* ════════ CONTACT ════════ */}
      <section id="contact" style={{ padding:SP, background: dk ? "#050505" : c.bg2 }}>
        <SectionHead tag="Get In Touch" title="Let's build something <strong style='font-weight:600'>great</strong>" gold={c.gold}/>
        <div style={{ display:"grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? "2.5rem" : "4rem", alignItems:"start" }}>

          {/* Left — contact info */}
          <div>
            <Reveal delay={.1}>
              <p style={{ fontSize:".93rem", color:c.sub, lineHeight:1.8, marginBottom:"1.5rem" }}>
                Open to senior engineering roles, technical leadership opportunities, and interesting consulting projects.
              </p>
            </Reveal>
            {[
              { icon:"✉",  label:"bmaurya147369@gmail.com",          href:"mailto:bmaurya147369@gmail.com" },
              { icon:"in", label:"linkedin.com/in/bhoopeshmaurya",   href:"https://www.linkedin.com/in/bhupesh-maurya" },
              { icon:"gh", label:"github.com/bhoopeshmaurya",        href:"https://github.com/bhupesh147" },
              { icon:"<>",  label:"https://leetcode.com/bhoopeshmaurya", href:"https://leetcode.com/u/bhoopeshmaurya147369/" },
              { icon:"☎",  label:"+91 8175808977",                  href:"tel:+918175808977" },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * .08}>
                <a href={item.href} className="c-row">
                  <div className="c-icon">{item.icon}</div>
                  <span style={{ wordBreak:"break-all", fontSize: sm ? 11 : 13 }}>{item.label}</span>
                </a>
              </Reveal>
            ))}
          </div>

          {/* Right — form */}
          <Reveal delay={.15}>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>

              <div>
                <div style={{ fontSize:9, letterSpacing:".16em", textTransform:"uppercase", color:c.sub, marginBottom:5 }}>Your Name</div>
                <input name="name" type="text" className="c-input" placeholder="John Smith" value={form.name} onChange={onChange} disabled={fState === "sending"}/>
              </div>

              <div>
                <div style={{ fontSize:9, letterSpacing:".16em", textTransform:"uppercase", color:c.sub, marginBottom:5 }}>Email Address</div>
                <input name="email" type="email" className="c-input" placeholder="john@company.com" value={form.email} onChange={onChange} disabled={fState === "sending"}/>
              </div>

              <div>
                <div style={{ fontSize:9, letterSpacing:".16em", textTransform:"uppercase", color:c.sub, marginBottom:5 }}>Message</div>
                <textarea name="message" className="c-input" placeholder="Tell me about the opportunity or project..." value={form.message} onChange={onChange} disabled={fState === "sending"}/>
              </div>

              {fErr && (
                <div style={{ fontSize:12, color:"#e05a5a", padding:"8px 12px", border:"1px solid rgba(224,90,90,.3)", background:"rgba(224,90,90,.06)" }}>{fErr}</div>
              )}

              {fState === "success" && (
                <div style={{ fontSize:12, color:c.gold, padding:"10px 14px", border:`1px solid ${c.bdrHov}`, background:c.goldF, display:"flex", alignItems:"center", gap:8 }}>
                  <span>✓</span><span>Message sent! Bhoopesh will get back to you shortly.</span>
                </div>
              )}

              {fState === "error" && (
                <div style={{ fontSize:12, color:"#e05a5a", padding:"10px 14px", border:"1px solid rgba(224,90,90,.3)", background:"rgba(224,90,90,.06)", display:"flex", alignItems:"center", gap:8 }}>
                  <span>✕</span><span>Could not send. Check your EmailJS config and try again.</span>
                </div>
              )}

              <button
                className="btn-p"
                style={{ alignSelf:"flex-start", opacity: fState === "sending" ? .7 : 1, cursor: fState === "sending" ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:8 }}
                onClick={sendEmail}
                disabled={fState === "sending"}
              >
                {fState === "sending"
                  ? <><span style={{ width:12, height:12, border:`2px solid ${dk ? "#08080866" : "#ffffff66"}`, borderTopColor: dk ? "#080808" : "#fff", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }}/> Sending…</>
                  : "Send Message →"
                }
              </button>

              <p style={{ fontSize:10, color:c.muted, lineHeight:1.5 }}>
                Delivered to <span style={{ color:c.gold }}>bmaurya147369@gmail.com</span>
              </p>

            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ padding:"1.2rem 5vw", background:c.foot, borderTop:`1px solid ${dk ? "#111" : c.bdr}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:".5rem" }}>
          <p style={{ fontSize:11, color: dk ? "#2e2e2e" : c.muted }}>© 2024 Bhoopesh Maurya. All rights reserved.</p>
          <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
            style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:11, color:c.gold, fontFamily:"'DM Sans',sans-serif", letterSpacing:".1em" }}>
            Back to top ↑
          </button>
        </div>
      </footer>
    </div>
  );
}
