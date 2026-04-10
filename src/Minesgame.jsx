import { useState, useEffect, useRef } from "react";

const TOTAL    = 25;
const INIT_BAL = 1000;
const SMOOTH   = 0.6;
const HOUSE    = 0.97;

const APPLE = {
  blue:    "#0A84FF",
  green:   "#30D158",
  red:     "#FF453A",
  orange:  "#FF9F0A",
  purple:  "#BF5AF2",
  indigo:  "#5E5CE6",
  text:    "#FFFFFF",
  sub:     "rgba(255,255,255,0.45)",
  hint:    "rgba(255,255,255,0.22)",
  glass:   "rgba(255,255,255,0.07)",
  glassMd: "rgba(255,255,255,0.11)",
  border:  "0.5px solid rgba(255,255,255,0.12)",
  borderHi:"0.5px solid rgba(255,255,255,0.22)",
  font:    `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`,
};

function calcMult(numMines, gemsFound) {
  if (gemsFound === 0) return 1;
  const safe = TOTAL - numMines;
  let m = 1;
  for (let i = 0; i < gemsFound; i++) {
    m *= Math.pow((TOTAL - i) / (safe - i), SMOOTH);
  }
  return +(m * HOUSE).toFixed(4);
}

function shuffleMines(n) {
  const arr = Array.from({ length: TOTAL }, (_, i) => i);
  for (let i = TOTAL - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return new Set(arr.slice(0, n));
}

const CSS = `
@keyframes tpop{0%{transform:scale(.25);opacity:0}65%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes tshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
@keyframes toast-in{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.t-pop{animation:tpop .38s cubic-bezier(.34,1.56,.64,1) both}
.t-shake{animation:tshake .42s ease both}
.t-toast{animation:toast-in .22s ease both}
.tile{transition:transform .12s ease,filter .12s ease;border:none;outline:none}
.tile:not(:disabled):hover{transform:scale(1.06);filter:brightness(1.22)}
.tile:not(:disabled):active{transform:scale(0.96)}
input[type=range]{-webkit-appearance:none;appearance:none;height:3px;border-radius:3px;outline:none;border:none;background:rgba(255,255,255,0.15)}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#fff;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.4);transition:transform .15s}
input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:none;cursor:pointer}
input[type=range]:not(:disabled)::-webkit-slider-thumb:hover{transform:scale(1.15)}
input[type=range]:disabled{opacity:0.3}
input[type=number]{-moz-appearance:textfield}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
`;

function Pill({ label, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, background: APPLE.glass, border: APPLE.border,
      borderRadius: 20, color: disabled ? APPLE.hint : APPLE.sub,
      fontSize: 12, fontWeight: 500, padding: "6px 0",
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: APPLE.font, letterSpacing: "-0.1px",
    }}>
      {label}
    </button>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: 12, color: APPLE.hint, letterSpacing: "-0.1px" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 500, color, letterSpacing: "-0.3px" }}>{value}</span>
    </div>
  );
}

function Tile({ index, phase, mineSet, rev, anims, xray, onTileClick }) {
  const isRev      = rev.has(index);
  const isMine     = mineSet.has(index);
  const isOver     = phase === "over";
  const isGem      = isRev && !isMine;
  const isHit      = isRev && isMine;
  const isExposed  = !isRev && isOver && isMine;
  const isXrayMine = xray && !isRev && !isOver && isMine;
  const anim       = anims[index];
  const disabled   = phase !== "play" || isRev;

  let bg, border, content, cls = "tile";

  if (isGem) {
    bg = "rgba(48,209,88,0.14)"; border = `0.5px solid ${APPLE.green}`;
    content = <span style={{ fontSize: 22 }}>💎</span>;
    cls += anim === "pop" ? " t-pop" : "";
  } else if (isHit) {
    bg = "rgba(255,69,58,0.18)"; border = `0.5px solid ${APPLE.red}`;
    content = <span style={{ fontSize: 22 }}>💣</span>;
    cls += " t-shake";
  } else if (isExposed) {
    bg = "rgba(255,69,58,0.08)"; border = "0.5px solid rgba(255,69,58,0.4)";
    content = <span style={{ fontSize: 22, opacity: 0.55 }}>💣</span>;
  } else if (isXrayMine) {
    bg = "rgba(255,69,58,0.05)"; border = "0.5px solid rgba(255,69,58,0.25)";
    content = <span style={{ fontSize: 18, opacity: 0.3 }}>💣</span>;
  } else {
    bg = APPLE.glass; border = APPLE.border; content = null;
  }

  return (
    <button onClick={() => onTileClick(index)} disabled={disabled} className={cls}
      style={{
        aspectRatio: "1", background: bg, border, borderRadius: 16,
        cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0,
      }}>
      {content}
    </button>
  );
}

function Footer() {
  return (
    <footer style={{ textAlign: "center", padding: "12px 0 18px", borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.18)", letterSpacing: "0.2px" }}>&copy; hexinova.cc</p>
    </footer>
  );
}

export default function MinesGame() {
  const [bal, setBal]         = useState(INIT_BAL);
  const [betStr, setBetStr]   = useState("10");
  const [numMines, setMines]  = useState(3);
  const [phase, setPhase]     = useState("idle");
  const [mineSet, setMineSet] = useState(new Set());
  const [rev, setRev]         = useState(new Set());
  const [gems, setGems]       = useState(0);
  const [anims, setAnims]     = useState({});
  const [toast, setToast]     = useState(null);
  const [xray, setXray]       = useState(false);
  const seqRef      = useRef([]);
  const seqTimerRef = useRef(null);
  const CHEAT = ["F5", "F9", "F8"];

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!CHEAT.includes(e.key)) return;
      e.preventDefault();
      const next = [...seqRef.current, e.key].slice(-3);
      seqRef.current = next;
      if (seqTimerRef.current) clearTimeout(seqTimerRef.current);
      seqTimerRef.current = setTimeout(() => { seqRef.current = []; seqTimerRef.current = null; }, 5000);
      if (next.join(",") === CHEAT.join(",")) {
        setXray(x => !x);
        seqRef.current = [];
        clearTimeout(seqTimerRef.current);
        seqTimerRef.current = null;
      }
    };
    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); clearTimeout(seqTimerRef.current); };
  }, []);

  const bet      = Math.max(0, parseFloat(betStr) || 0);
  const safe     = TOTAL - numMines;
  const curMult  = calcMult(numMines, gems);
  const nextMult = calcMult(numMines, gems + 1);
  const curWin   = +(bet * curMult).toFixed(2);
  const profit   = gems > 0 ? +(curWin - bet).toFixed(2) : 0;

  const flash = (text, ok) => { setToast({ text, ok }); setTimeout(() => setToast(null), 3200); };

  const startGame = () => {
    if (bet <= 0 || bet > bal) { flash("Invalid bet amount", false); return; }
    setBal(b => +(b - bet).toFixed(2));
    setMineSet(shuffleMines(numMines));
    setRev(new Set()); setGems(0); setAnims({});
    setPhase("play"); setToast(null);
  };

  const clickTile = (i) => {
    if (phase !== "play" || rev.has(i)) return;
    const next = new Set(rev); next.add(i); setRev(next);
    if (mineSet.has(i)) {
      setAnims(a => ({ ...a, [i]: "shake" })); setPhase("over");
      flash(`Lost ${bet.toFixed(2)} pts`, false);
    } else {
      setAnims(a => ({ ...a, [i]: "pop" }));
      const g = gems + 1; setGems(g);
      if (g === safe) {
        const win = +(bet * calcMult(numMines, g)).toFixed(2);
        setBal(b => +(b + win).toFixed(2)); setPhase("over");
        flash(`Board cleared — +${win} pts`, true);
      }
    }
  };

  const cashout = () => {
    if (phase !== "play" || gems === 0) return;
    setBal(b => +(b + curWin).toFixed(2)); setPhase("over");
    flash(`Cashed out ${curWin} pts · ${curMult.toFixed(2)}×`, true);
  };

  const reset = () => {
    setPhase("idle"); setRev(new Set()); setGems(0);
    setAnims({}); setMineSet(new Set()); setToast(null);
  };

  const isPlay = phase === "play";
  const isOver = phase === "over";

  const card = {
    background: APPLE.glass, border: APPLE.border,
    borderRadius: 18, padding: "14px 16px",
  };

  return (
    <div style={{ fontFamily: APPLE.font, background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 16, padding: "24px 20px", flex: 1 }}>

        {/* ── Sidebar ── */}
        <div style={{ width: 216, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>

          <div style={{ padding: "4px 2px 8px" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: APPLE.text, letterSpacing: "-0.5px" }}>Mines</div>
            <div style={{ fontSize: 12, color: APPLE.hint, marginTop: 1 }}>Virtual points only</div>
          </div>

          <div style={card}>
            <div style={{ fontSize: 11, color: APPLE.hint, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 }}>Balance</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: APPLE.text, letterSpacing: "-0.8px", lineHeight: 1 }}>
              {bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span style={{ fontSize: 13, fontWeight: 400, color: APPLE.hint, marginLeft: 5 }}>pts</span>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: 11, color: APPLE.hint, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 }}>Bet Amount</div>
            <input type="number" min="1" value={betStr} onChange={e => setBetStr(e.target.value)} disabled={isPlay}
              style={{
                width: "100%", boxSizing: "border-box", background: APPLE.glassMd,
                border: APPLE.borderHi, borderRadius: 10, color: APPLE.text,
                padding: "9px 12px", fontSize: 15, fontWeight: 500,
                fontFamily: APPLE.font, letterSpacing: "-0.3px", outline: "none",
              }} />
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <Pill label="½"   onClick={() => setBetStr(v => String(Math.max(1, Math.floor(parseFloat(v)/2))))} disabled={isPlay} />
              <Pill label="2×"  onClick={() => setBetStr(v => String(Math.min(bal, parseFloat(v)*2)))}           disabled={isPlay} />
              <Pill label="Max" onClick={() => setBetStr(String(bal))}                                            disabled={isPlay} />
            </div>
          </div>

          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: APPLE.hint, letterSpacing: "0.5px", textTransform: "uppercase" }}>Mines</div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px" }}>
                <span style={{ color: APPLE.red }}>{numMines}</span>
                <span style={{ fontSize: 11, fontWeight: 400, color: APPLE.hint, marginLeft: 6 }}>{safe} safe</span>
              </div>
            </div>
            <input type="range" min="1" max="24" value={numMines} step="1"
              onChange={e => setMines(+e.target.value)} disabled={isPlay}
              style={{ width: "100%" }} />
          </div>

          <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
            <StatRow label="Profit"    value={profit > 0 ? `+${profit.toFixed(2)}` : profit.toFixed(2)} color={profit > 0 ? APPLE.green : APPLE.hint} />
            <StatRow label="Current ×" value={`${curMult.toFixed(2)}×`}  color={APPLE.purple} />
            <StatRow label="Next ×"    value={`${nextMult.toFixed(2)}×`} color={APPLE.blue}   />
          </div>

          {!isPlay ? (
            <button onClick={isOver ? reset : startGame} style={{
              background: isOver ? APPLE.indigo : APPLE.blue, border: "none",
              borderRadius: 14, color: "#fff", fontWeight: 600, fontSize: 15,
              padding: "14px 0", cursor: "pointer", fontFamily: APPLE.font, letterSpacing: "-0.2px",
            }}>
              {isOver ? "New Game" : "Place Bet"}
            </button>
          ) : gems > 0 ? (
            <button onClick={cashout} style={{
              background: APPLE.orange, border: "none", borderRadius: 14,
              color: "#fff", fontWeight: 600, fontSize: 14, padding: "14px 0",
              cursor: "pointer", fontFamily: APPLE.font, letterSpacing: "-0.2px",
            }}>
              Cash Out · {curWin.toFixed(2)} pts
            </button>
          ) : (
            <button disabled style={{
              background: APPLE.glass, border: APPLE.border, borderRadius: 14,
              color: APPLE.hint, fontWeight: 600, fontSize: 15, padding: "14px 0",
              cursor: "not-allowed", fontFamily: APPLE.font,
            }}>
              Cash Out
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>

          {toast && (
            <div className="t-toast" style={{
              position: "absolute", top: 0, left: "50%",
              background: toast.ok ? "rgba(48,209,88,0.15)" : "rgba(255,69,58,0.15)",
              border: toast.ok ? `0.5px solid ${APPLE.green}` : `0.5px solid ${APPLE.red}`,
              color: toast.ok ? APPLE.green : APPLE.red,
              padding: "9px 22px", borderRadius: 24,
              fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", zIndex: 20, letterSpacing: "-0.1px",
            }}>
              {toast.text}
            </div>
          )}

          {xray && (
            <div style={{
              position: "absolute", top: 0, right: 0,
              background: "rgba(94,92,230,0.15)", border: `0.5px solid ${APPLE.indigo}`,
              color: APPLE.indigo, fontSize: 11, fontWeight: 600,
              padding: "5px 12px", borderRadius: "0 0 0 12px",
              letterSpacing: "0.5px", textTransform: "uppercase",
            }}>
              X-Ray
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, width: "100%", maxWidth: 420 }}>
            {Array.from({ length: TOTAL }, (_, i) => (
              <Tile key={i} index={i} phase={phase}
                mineSet={mineSet} rev={rev} anims={anims} xray={xray}
                onTileClick={clickTile} />
            ))}
          </div>

          <div style={{ marginTop: 18, fontSize: 12, color: APPLE.hint, textAlign: "center", letterSpacing: "-0.1px", minHeight: 18 }}>
            {isPlay && `${gems} gem${gems !== 1 ? "s" : ""} found · ${safe - gems} safe tile${safe - gems !== 1 ? "s" : ""} remaining`}
            {phase === "idle" && "Place a bet to begin"}
            {isOver && "Round complete"}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}