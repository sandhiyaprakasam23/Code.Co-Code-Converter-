import { useState, useRef, useEffect, useCallback } from "react";

// ── Django backend base URL ───────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:8000/api";

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

const LANGS = [
  "Python","JavaScript","TypeScript","Java","C","C++","C#","Go","Rust","Swift",
  "Kotlin","Ruby","PHP","Scala","R","MATLAB","Perl","Haskell","Lua","Dart",
  "Elixir","Clojure","F#","Groovy","Julia","COBOL","Fortran","Assembly","SQL","Bash"
];

/* ── Particles canvas ── */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");
    let W, H, pts = [], raf;
    function rsz() { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
    rsz();
    window.addEventListener("resize", rsz);
    for (let i = 0; i < 60; i++)
      pts.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4, o: Math.random() * 0.5 + 0.1 });
    function tick() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.o})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      });
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rsz); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }} />;
}

/* ── Login Page ── */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const cardRef = useRef(null);

  function validate() {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email";
    if (pass.length < 4) e.pass = "Password must be at least 4 characters";
    return e;
  }

  async function doLogin() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); setShake(true); setTimeout(() => setShake(false), 500); return; }
    setErrors({}); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid email or password.");
      localStorage.setItem("access_token",  data.access);
      localStorage.setItem("refresh_token", data.refresh);
      onLogin({ name: email.split("@")[0], email });
    } catch (err) {
      setErrors({ pass: err.message });
      setShake(true); setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }

  function demoLogin() {
    onLogin({ name: "Demo User", email: "demo@codeco.app" });
  }

  const styles = {
    page: { position:"relative", zIndex:1, minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", padding:24, animation:"fadeIn 0.5s ease" },
    wrap: { width:"100%", maxWidth:440 },
    logoArea: { textAlign:"center", marginBottom:40 },
    logoIcon: { width:58, height:58, borderRadius:16,
      background:"linear-gradient(135deg,#6366f1,#a855f7)", display:"inline-flex",
      alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff",
      boxShadow:"0 8px 32px rgba(99,102,241,0.45)", verticalAlign:"middle", marginRight:10 },
    logoText: { fontSize:38, fontWeight:800, letterSpacing:"-1.5px",
      background:"linear-gradient(135deg,#6366f1 0%,#a855f7 50%,#ec4899 100%)",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", verticalAlign:"middle" },
    logoSub: { color:"rgba(148,163,184,0.7)", fontSize:14, marginTop:8 },
    card: { background:"rgba(15,15,30,0.88)", backdropFilter:"blur(24px)",
      border:"1px solid rgba(99,102,241,0.25)", borderRadius:24, padding:"44px 40px",
      boxShadow:"0 32px 80px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.05)",
      transition:"transform 0.1s" },
    cardShake: { animation:"shake 0.4s ease" },
    h2: { color:"#f1f5f9", fontSize:23, fontWeight:700, textAlign:"center", letterSpacing:"-0.5px", marginBottom:6 },
    subtitle: { color:"rgba(148,163,184,0.7)", fontSize:14, textAlign:"center", marginBottom:32 },
    fieldLabel: { color:"rgba(148,163,184,0.75)", fontSize:12, fontWeight:600,
      letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:8 },
    input: { width:"100%", padding:"13px 16px", background:"rgba(255,255,255,0.04)",
      border:"1px solid rgba(99,102,241,0.25)", borderRadius:12, color:"#e2e8f0",
      fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none",
      transition:"border-color 0.2s,background 0.2s", boxSizing:"border-box" },
    inputFocus: { borderColor:"rgba(99,102,241,0.7)", background:"rgba(99,102,241,0.06)" },
    errMsg: { color:"#f87171", fontSize:12, marginTop:6 },
    loginBtn: { width:"100%", padding:14, marginTop:8,
      background:"linear-gradient(135deg,#6366f1,#a855f7)", border:"none", borderRadius:13,
      color:"#fff", fontSize:15, fontWeight:600, fontFamily:"'Outfit',sans-serif", cursor:"pointer",
      boxShadow:"0 4px 20px rgba(99,102,241,0.4)", display:"flex", alignItems:"center",
      justifyContent:"center", gap:10 },
    divider: { display:"flex", alignItems:"center", gap:14, margin:"24px 0" },
    dividerHr: { flex:1, border:"none", borderTop:"1px solid rgba(255,255,255,0.07)" },
    dividerSpan: { color:"rgba(148,163,184,0.4)", fontSize:11 },
    demoBtn: { width:"100%", padding:12, background:"rgba(255,255,255,0.03)",
      border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"rgba(148,163,184,0.7)",
      fontSize:13, fontWeight:500, fontFamily:"'Outfit',sans-serif", cursor:"pointer" },
    features: { display:"flex", justifyContent:"center", gap:22, marginTop:28 },
    featureSpan: { color:"rgba(148,163,184,0.5)", fontSize:12 },
    footer: { color:"rgba(100,116,139,0.55)", fontSize:11, textAlign:"center", marginTop:22 },
  };

  const [focusedField, setFocusedField] = useState(null);

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.logoArea}>
          <span style={styles.logoIcon}>&lt;/&gt;</span>
          <span style={styles.logoText}>code.co</span>
          <p style={styles.logoSub}>Transform code instantly across 30+ languages</p>
        </div>
        <div ref={cardRef} style={{ ...styles.card, ...(shake ? styles.cardShake : {}) }}>
          <h2 style={styles.h2}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>

          <div style={{ marginBottom:18 }}>
            <label style={styles.fieldLabel}>Email Address</label>
            <input type="email" placeholder="you@example.com" autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && document.getElementById("pass-input")?.focus()}
              onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
              style={{ ...styles.input, ...(focusedField === "email" ? styles.inputFocus : {}) }} />
            {errors.email && <div style={styles.errMsg}>{errors.email}</div>}
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={styles.fieldLabel}>Password</label>
            <input id="pass-input" type="password" placeholder="Enter your password" autoComplete="current-password"
              value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doLogin()}
              onFocus={() => setFocusedField("pass")} onBlur={() => setFocusedField(null)}
              style={{ ...styles.input, ...(focusedField === "pass" ? styles.inputFocus : {}) }} />
            {errors.pass && <div style={styles.errMsg}>{errors.pass}</div>}
          </div>

          <button style={{ ...styles.loginBtn, opacity: loading ? 0.6 : 1 }}
            disabled={loading} onClick={doLogin}>
            {loading
              ? <><div style={{ width:17, height:17, border:"2px solid rgba(255,255,255,0.25)",
                  borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                  <span>Signing in...</span></>
              : <span>Sign In</span>}
          </button>

          <div style={styles.divider}>
            <hr style={styles.dividerHr} />
            <span style={styles.dividerSpan}>or</span>
            <hr style={styles.dividerHr} />
          </div>

          <button style={styles.demoBtn} onClick={demoLogin}>
            👤 &nbsp;Continue as Demo User
          </button>

          <div style={styles.features}>
            <span style={styles.featureSpan}>🔐 Secure</span>
            <span style={styles.featureSpan}>⚡ Instant</span>
            <span style={styles.featureSpan}>🌐 30+ Languages</span>
          </div>
        </div>
        <p style={styles.footer}>By signing in, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
}

/* ── Converter Page ── */
function ConverterPage({ user, onSignOut }) {
  const [fromLang, setFromLang] = useState("Python");
  const [toLang, setToLang]     = useState("JavaScript");
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const inNumsRef  = useRef(null);
  const outNumsRef = useRef(null);
  const inpRef     = useRef(null);
  const outRef     = useRef(null);

  const inputLines  = inputCode ? inputCode.split("\n") : [""];
  const outputLines = outputCode ? outputCode.split("\n") : [];

  function swapLangs() {
    const f = fromLang, t = toLang;
    setFromLang(t); setToLang(f);
    if (outputCode) { setInputCode(outputCode); setOutputCode(""); setError(""); }
  }

  async function convertCode() {
    const code = inputCode.trim();
    if (!code) return;
    setConverting(true); setError(""); setOutputCode("");
    try {
      // Always call Django backend — it holds the API key and proxies to Anthropic
      const res = await fetch(`${API_BASE}/converter/convert/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_lang: fromLang, to_lang: toLang, code }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setOutputCode(data.output_code);
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ERR_CONNECTION_REFUSED")) {
        setError("Cannot reach Django backend. Run: python manage.py runserver 8000");
      } else {
        setError(msg || "Conversion failed. Please try again.");
      }
    } finally {
      setConverting(false);
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(outputCode).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  const displayName = user.name.charAt(0).toUpperCase() + user.name.slice(1).split("@")[0];
  const initial     = user.name[0].toUpperCase();

  const s = {
    page: { position:"relative", zIndex:1, minHeight:"100vh" },
    header: { position:"sticky", top:0, zIndex:100, background:"rgba(5,5,16,0.9)",
      backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(99,102,241,0.14)",
      height:64, padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between" },
    hLogoIcon: { width:36, height:36, borderRadius:10,
      background:"linear-gradient(135deg,#6366f1,#a855f7)", display:"flex",
      alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#fff",
      boxShadow:"0 4px 16px rgba(99,102,241,0.35)" },
    hLogoText: { fontSize:22, fontWeight:800, letterSpacing:"-1px",
      background:"linear-gradient(135deg,#6366f1 0%,#a855f7 50%,#ec4899 100%)",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
    badgePill: { padding:"4px 12px", borderRadius:20, background:"rgba(99,102,241,0.15)",
      border:"1px solid rgba(99,102,241,0.25)", color:"#a5b4fc", fontSize:12, fontWeight:500 },
    userBtn: { display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)",
      border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"6px 12px 6px 6px",
      cursor:"pointer", fontFamily:"'Outfit',sans-serif" },
    avatar: { width:28, height:28, borderRadius:"50%",
      background:"linear-gradient(135deg,#6366f1,#a855f7)", display:"flex",
      alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff",
      border:"2px solid rgba(99,102,241,0.4)" },
    dropdown: { position:"absolute", right:0, top:"calc(100% + 8px)",
      background:"rgba(15,15,30,0.98)", backdropFilter:"blur(20px)",
      border:"1px solid rgba(99,102,241,0.2)", borderRadius:14, padding:8, minWidth:210,
      boxShadow:"0 16px 48px rgba(0,0,0,0.55)", zIndex:200, display: dropOpen ? "block" : "none" },
    main: { maxWidth:1440, margin:"0 auto", padding:"32px 24px 56px", position:"relative", zIndex:1 },
    pageTitle: { textAlign:"center", marginBottom:32 },
    h1: { fontSize:"clamp(24px,4vw,44px)", fontWeight:800, letterSpacing:"-1.5px",
      background:"linear-gradient(135deg,#e2e8f0 0%,#a5b4fc 50%,#c084fc 100%)",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:8 },
    toolbar: { background:"rgba(15,15,30,0.75)", backdropFilter:"blur(16px)",
      border:"1px solid rgba(99,102,241,0.2)", borderRadius:16, padding:"20px 24px",
      display:"flex", alignItems:"flex-end", gap:14, marginBottom:20, flexWrap:"wrap" },
    langGroup: { flex:1, minWidth:140 },
    langLabel: { color:"rgba(148,163,184,0.7)", fontSize:11, fontWeight:600,
      letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 },
    langSelect: { width:"100%", padding:"10px 36px 10px 14px",
      background:"rgba(15,15,30,0.9) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\") no-repeat right 12px center",
      border:"1px solid rgba(99,102,241,0.3)", borderRadius:10, color:"#e2e8f0",
      fontSize:14, fontWeight:500, fontFamily:"'Outfit',sans-serif",
      appearance:"none", cursor:"pointer", outline:"none" },
    swapBtn: { width:44, height:44, borderRadius:12, flexShrink:0,
      background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)",
      cursor:"pointer", fontSize:18, color:"#a5b4fc", display:"flex",
      alignItems:"center", justifyContent:"center", transition:"all 0.25s" },
    convertBtn: { padding:"10px 32px", height:44,
      background: converting ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#a855f7)",
      border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:600,
      cursor: converting ? "not-allowed" : "pointer",
      boxShadow:"0 4px 20px rgba(99,102,241,0.4)", display:"flex",
      alignItems:"center", gap:8, fontFamily:"'Outfit',sans-serif", whiteSpace:"nowrap",
      opacity: converting ? 0.5 : 1 },
    editorGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 },
    panel: { background:"rgba(10,10,24,0.85)", backdropFilter:"blur(16px)",
      border:"1px solid rgba(99,102,241,0.2)", borderRadius:16, overflow:"hidden",
      display:"flex", flexDirection:"column", transition:"border-color 0.3s" },
    panelHeader: { padding:"12px 16px", borderBottom:"1px solid rgba(99,102,241,0.1)",
      background:"rgba(99,102,241,0.04)", display:"flex", alignItems:"center",
      justifyContent:"space-between", flexShrink:0 },
    traffic: { display:"flex", gap:6 },
    panelTitle: { color:"rgba(148,163,184,0.8)", fontSize:12, fontWeight:500, marginLeft:10 },
    editorWrap: { display:"flex", flex:1, position:"relative", minHeight:440 },
    lineNums: { width:48, background:"rgba(5,5,16,0.55)",
      borderRight:"1px solid rgba(99,102,241,0.09)", padding:"16px 0", userSelect:"none",
      overflow:"hidden", flexShrink:0, fontFamily:"'JetBrains Mono',monospace",
      fontSize:13, lineHeight:"1.6em", color:"rgba(99,102,241,0.32)", textAlign:"right" },
    textarea: { flex:1, resize:"none", border:"none", outline:"none",
      background:"transparent", color:"#e2e8f0", fontSize:13, lineHeight:"1.6em",
      fontFamily:"'JetBrains Mono',monospace", padding:16, minHeight:440, tabSize:2 },
    panelFooter: { padding:"8px 16px", borderTop:"1px solid rgba(99,102,241,0.07)",
      display:"flex", justifyContent:"flex-end" },
    clearBtn: { background:"transparent", border:"1px solid rgba(255,255,255,0.08)",
      color:"rgba(148,163,184,0.45)", fontSize:12, padding:"4px 12px",
      borderRadius:6, cursor:"pointer", fontFamily:"'Outfit',sans-serif" },
    copyBtn: { background: copied ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)",
      border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(99,102,241,0.25)",
      color: copied ? "#86efac" : "#a5b4fc", fontSize:12, padding:"4px 14px",
      borderRadius:6, cursor: outputCode ? "pointer" : "not-allowed",
      fontFamily:"'Outfit',sans-serif", opacity: outputCode ? 1 : 0.35 },
    outputBody: { flex:1, position:"relative", minHeight:440, display:"flex", overflow:"hidden" },
    placeholder: { position:"absolute", inset:0, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:12 },
    placeholderIcon: { width:64, height:64, borderRadius:16, background:"rgba(99,102,241,0.1)",
      border:"1px solid rgba(99,102,241,0.2)", display:"flex",
      alignItems:"center", justifyContent:"center", fontSize:28 },
    loadingOverlay: { position:"absolute", inset:0, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:16,
      background:"rgba(5,5,16,0.7)", backdropFilter:"blur(4px)", zIndex:10 },
    bigSpinner: { width:48, height:48, border:"3px solid rgba(99,102,241,0.2)",
      borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.8s linear infinite" },
    errorBox: { margin:16, padding:"14px 16px", background:"rgba(248,113,113,0.1)",
      border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, color:"#fca5a5",
      fontSize:13, lineHeight:1.5 },
    outPre: { flex:1, margin:0, padding:16, color:"#a5b4fc", fontSize:13, lineHeight:"1.6em",
      fontFamily:"'JetBrains Mono',monospace", whiteSpace:"pre", overflow:"auto",
      background:"transparent" },
    statsBar: { marginTop:20, display:"flex", alignItems:"center", justifyContent:"center",
      gap:40, padding:16, background:"rgba(15,15,30,0.5)",
      border:"1px solid rgba(99,102,241,0.12)", borderRadius:12, flexWrap:"wrap" },
    statVal: { fontSize:20, fontWeight:800,
      background:"linear-gradient(135deg,#6366f1,#a855f7)",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
    statLabel: { color:"rgba(148,163,184,0.45)", fontSize:11, marginTop:2 },
  };

  // Sync scroll for input
  const syncInScroll = () => { if (inNumsRef.current && inpRef.current) inNumsRef.current.scrollTop = inpRef.current.scrollTop; };
  const syncOutScroll = () => { if (outNumsRef.current && outRef.current) outNumsRef.current.scrollTop = outRef.current.scrollTop; };

  function handleTab(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = e.target.selectionStart;
      const val = e.target.value;
      setInputCode(val.substring(0, s) + "  " + val.substring(e.target.selectionEnd));
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
    }
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={s.hLogoIcon}>&lt;/&gt;</div>
          <span style={s.hLogoText}>code.co</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={s.badgePill}>⚡ Unlimited Conversions</div>
          <div style={{ position:"relative" }}>
            <button style={s.userBtn} onClick={() => setDropOpen(o => !o)}>
              <div style={s.avatar}>{initial}</div>
              <span style={{ color:"#e2e8f0", fontSize:13, fontWeight:500 }}>{displayName}</span>
              <span style={{ color:"rgba(148,163,184,0.5)", fontSize:10 }}>▾</span>
            </button>
            <div style={s.dropdown}>
              <div style={{ padding:"10px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)", marginBottom:4 }}>
                <div style={{ color:"#e2e8f0", fontSize:13, fontWeight:600 }}>{displayName}</div>
                <div style={{ color:"rgba(148,163,184,0.55)", fontSize:11, marginTop:2 }}>{user.email}</div>
              </div>
              <button style={{ width:"100%", padding:"9px 12px", background:"transparent",
                border:"none", borderRadius:8, cursor:"pointer", textAlign:"left",
                color:"#f87171", fontSize:13, fontWeight:500, fontFamily:"'Outfit',sans-serif",
                display:"flex", alignItems:"center", gap:8 }}
                onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); setDropOpen(false); onSignOut(); }}>
                ⎋ &nbsp;Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.pageTitle}>
          <h1 style={s.h1}>AI-Powered Code Converter</h1>
          <p style={{ color:"rgba(148,163,184,0.6)", fontSize:15 }}>Paste any code below — convert instantly to any language, unlimited lines</p>
        </div>

        <div style={s.toolbar}>
          <div style={s.langGroup}>
            <label style={s.langLabel}>From Language</label>
            <select style={s.langSelect} value={fromLang} onChange={e => setFromLang(e.target.value)}>
              {LANGS.map(l => <option key={l} value={l} style={{ background:"#0f0f1e" }}>{l}</option>)}
            </select>
          </div>
          <button style={s.swapBtn} onClick={swapLangs} title="Swap">⇄</button>
          <div style={s.langGroup}>
            <label style={s.langLabel}>To Language</label>
            <select style={s.langSelect} value={toLang} onChange={e => setToLang(e.target.value)}>
              {LANGS.map(l => <option key={l} value={l} style={{ background:"#0f0f1e" }}>{l}</option>)}
            </select>
          </div>
          <button style={s.convertBtn} disabled={converting || !inputCode.trim()} onClick={convertCode}>
            {converting
              ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)",
                  borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", flexShrink:0 }} />
                  <span>Converting...</span></>
              : <><span>⚡</span><span>Convert Code</span></>}
          </button>
        </div>

        <div style={s.editorGrid}>
          {/* Input Panel */}
          <div style={{ ...s.panel, borderColor: inputCode ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.2)" }}>
            <div style={s.panelHeader}>
              <div style={{ display:"flex", alignItems:"center" }}>
                <div style={s.traffic}>
                  <span style={{ width:12, height:12, borderRadius:"50%", background:"#ff5f57", display:"block" }} />
                  <span style={{ width:12, height:12, borderRadius:"50%", background:"#febc2e", display:"block" }} />
                  <span style={{ width:12, height:12, borderRadius:"50%", background:"#28c840", display:"block" }} />
                </div>
                <span style={s.panelTitle}>{fromLang} — Input</span>
              </div>
              <span style={{ color:"rgba(99,102,241,0.6)", fontSize:11 }}>
                {inputLines.length} {inputLines.length === 1 ? "line" : "lines"} · {inputCode.length} chars
              </span>
            </div>
            <div style={s.editorWrap}>
              <div ref={inNumsRef} style={s.lineNums}>
                {inputLines.map((_, i) => <div key={i} style={{ paddingRight:12, height:"1.6em" }}>{i+1}</div>)}
              </div>
              <textarea ref={inpRef} style={s.textarea}
                placeholder={"Paste your code here...\n\n# No limit on code length\n# All languages supported"}
                spellCheck={false} value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                onScroll={syncInScroll} onKeyDown={handleTab} />
            </div>
            <div style={s.panelFooter}>
              <button style={s.clearBtn} onClick={() => { setInputCode(""); setOutputCode(""); setError(""); }}>Clear</button>
            </div>
          </div>

          {/* Output Panel */}
          <div style={{ ...s.panel, borderColor: outputCode ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.2)" }}>
            <div style={s.panelHeader}>
              <div style={{ display:"flex", alignItems:"center" }}>
                <div style={s.traffic}>
                  <span style={{ width:12, height:12, borderRadius:"50%", background:"#ff5f57", display:"block" }} />
                  <span style={{ width:12, height:12, borderRadius:"50%", background:"#febc2e", display:"block" }} />
                  <span style={{ width:12, height:12, borderRadius:"50%", background:"#28c840", display:"block" }} />
                </div>
                <span style={s.panelTitle}>{toLang} — Output</span>
              </div>
              <button style={s.copyBtn} disabled={!outputCode} onClick={copyOutput}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <div style={s.outputBody}>
              {converting && (
                <div style={s.loadingOverlay}>
                  <div style={s.bigSpinner} />
                  <p style={{ color:"#a5b4fc", fontSize:14, fontWeight:500 }}>Converting to {toLang}...</p>
                  <small style={{ color:"rgba(148,163,184,0.5)", fontSize:12, marginTop:-10 }}>Analyzing your code with AI</small>
                </div>
              )}
              {!converting && !outputCode && !error && (
                <div style={s.placeholder}>
                  <div style={s.placeholderIcon}>⚡</div>
                  <p style={{ color:"rgba(148,163,184,0.35)", fontSize:13 }}>Converted code will appear here</p>
                </div>
              )}
              {!converting && error && (
                <div style={s.errorBox}>
                  ⚠ <strong>Conversion failed:</strong> {error}<br />
                  <small style={{ opacity:0.7, marginTop:4, display:"block" }}>Check your internet connection and try again.</small>
                </div>
              )}
              {outputCode && !converting && (
                <>
                  <div ref={outNumsRef} style={{ ...s.lineNums, display:"block" }}>
                    {outputLines.map((_, i) => <div key={i} style={{ paddingRight:12, height:"1.6em" }}>{i+1}</div>)}
                  </div>
                  <pre ref={outRef} style={s.outPre} onScroll={syncOutScroll}>{outputCode}</pre>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={s.statsBar}>
          {[["30+","Languages"],["∞","Line Limit"],["<5s","Avg Speed"],["AI","Powered"]].map(([v,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={s.statVal}>{v}</div>
              <div style={s.statLabel}>{l}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ── Root App ── */
export default function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#050510;font-family:'Outfit',sans-serif;overflow-x:hidden}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
        textarea::placeholder{color:rgba(99,102,241,0.28)}
        textarea::-webkit-scrollbar{width:6px}
        textarea::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:3px}
        pre::-webkit-scrollbar{width:6px;height:6px}
        pre::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:3px}
        select option{background:#0f0f1e}
      `}</style>

      {/* Background orbs */}
      <div style={{ position:"fixed", width:700, height:700, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(99,102,241,0.13) 0%,transparent 70%)",
        top:-150, left:-150, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:550, height:550, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(168,85,247,0.09) 0%,transparent 70%)",
        bottom:-100, right:-100, pointerEvents:"none", zIndex:0 }} />

      <Particles />

      {!user
        ? <LoginPage onLogin={setUser} />
        : <ConverterPage user={user} onSignOut={() => setUser(null)} />
      }
    </>
  );
}