'use client'

import { reportLabels } from '@/lib/report-labels'

import { useEffect, useMemo, useRef } from 'react'
import { type PerceptionReportData } from '@/lib/perception-report'

/**
 * OPM Perception Report — 1:1 port of the approved mockup.
 * Fonts (Cormorant Garamond, Inter, JetBrains Mono) are injected on mount.
 * All CSS is scoped under `.opm-report`; keyframes are prefixed (opmDrift,
 * opmRise) so nothing leaks into the rest of the app.
 */

const REPORT_CSS = `
.opm-report {
  --bg: #080b11; --bg-2: #0b0f18; --panel: #0e131e; --panel-2: #111827;
  --line: rgba(255,255,255,0.07); --line-strong: rgba(255,255,255,0.12);
  --ink: #eef2f8; --muted: #9aa6b8; --muted-2: #6b7688;
  --signal: #70f0de; --signal-dim: rgba(112,240,222,0.14);
  --gold: #d8c290; --gold-dim: rgba(216,194,144,0.12);
  --warn: #f0b36e; --danger: #ef7d7d; --ok: #7fdca0;
  --radius: 18px; --shadow: 0 24px 80px rgba(0,0,0,0.55);
  position: relative; min-height: 100vh;
  background:
    radial-gradient(1200px 700px at 82% -8%, rgba(112,240,222,0.06), transparent 60%),
    radial-gradient(900px 600px at 5% 4%, rgba(216,194,144,0.05), transparent 55%),
    var(--bg);
  color: var(--ink); font-family: 'Inter', system-ui, sans-serif; line-height: 1.5;
  -webkit-font-smoothing: antialiased; letter-spacing: 0.1px;
}
.opm-report * { box-sizing: border-box; }
.opm-report .dust { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.opm-report .dust span { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: rgba(216,194,144,0.5); opacity: 0; animation: opmDrift linear infinite; }
@keyframes opmDrift { 0% { transform: translateY(20px); opacity: 0; } 12% { opacity: 0.5; } 88% { opacity: 0.35; } 100% { transform: translateY(-110vh); opacity: 0; } }
.opm-report .wrap { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 40px 28px 80px; }
.opm-report .masthead { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding-bottom: 22px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.opm-report .brand { display: flex; align-items: center; gap: 12px; }
.opm-report .brand .mark { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg, rgba(112,240,222,0.9), rgba(112,240,222,0.25)); display: grid; place-items: center; color: #06231f; font-weight: 800; font-size: 15px; box-shadow: 0 0 22px rgba(112,240,222,0.35); }
.opm-report .brand .name { font-weight: 700; letter-spacing: 3px; font-size: 13px; color: var(--ink); }
.opm-report .brand .sub { font-size: 11px; color: var(--muted-2); letter-spacing: 2px; margin-top: 2px; }
.opm-report .eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 2px; color: var(--signal); text-transform: uppercase; }
.opm-report .report-title { margin: 26px 0 6px; }
.opm-report .report-title h1 { font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: clamp(34px, 5vw, 54px); line-height: 1.02; margin: 6px 0 0; letter-spacing: 0.3px; }
.opm-report .report-title h1 em { font-style: italic; color: var(--gold); }
.opm-report .report-sub { color: var(--muted); font-size: 15px; max-width: 640px; }
.opm-report .subject { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-top: 24px; padding: 16px 18px; background: linear-gradient(180deg, var(--panel), var(--bg-2)); border: 1px solid var(--line); border-radius: var(--radius); }
.opm-report .avatar { width: 46px; height: 46px; border-radius: 12px; background: linear-gradient(135deg,#243349,#141c29); display:grid; place-items:center; font-weight:700; color: var(--gold); border: 1px solid var(--line-strong); }
.opm-report .subject .who { display: flex; flex-direction: column; }
.opm-report .subject .who b { font-size: 16px; }
.opm-report .subject .who span { font-size: 13px; color: var(--muted); }
.opm-report .subject .spacer { flex: 1; }
.opm-report .meta-chip { font-family:'JetBrains Mono',monospace; font-size: 12px; color: var(--muted); display:flex; align-items:center; gap: 7px; padding: 8px 12px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,0.02); }
.opm-report .meta-chip b { color: var(--ink); font-weight: 500; }
.opm-report .dot { width: 7px; height: 7px; border-radius: 50%; }
.opm-report .badge { display:inline-flex; align-items:center; gap:7px; font-size: 12px; padding: 8px 13px; border-radius: 999px; font-weight: 600; letter-spacing: .2px; }
.opm-report .badge.ok { color: var(--ok); background: rgba(127,220,160,0.1); border: 1px solid rgba(127,220,160,0.25); }
.opm-report .btn-rec { display:inline-flex; align-items:center; gap:8px; font-size: 13px; font-weight:600; color:#06231f; background: var(--signal); border:none; padding: 9px 15px; border-radius: 10px; cursor:pointer; box-shadow: 0 0 18px rgba(112,240,222,0.3); transition: transform .15s ease, box-shadow .15s ease; }
.opm-report .btn-rec:hover { transform: translateY(-1px); box-shadow: 0 0 26px rgba(112,240,222,0.5); }
.opm-report .btn-rec:disabled { opacity: .55; cursor: not-allowed; box-shadow: none; }
.opm-report .congruence { margin-top: 28px; border: 1px solid var(--line-strong); border-radius: 22px; overflow: hidden; background: linear-gradient(180deg, rgba(18,26,40,0.9), rgba(9,13,20,0.9)); box-shadow: var(--shadow); }
.opm-report .congruence .head { display:flex; align-items:center; justify-content: space-between; padding: 20px 24px 4px; flex-wrap: wrap; gap: 10px; }
.opm-report .congruence .head .l .k { font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:2px; color: var(--signal); text-transform: uppercase; }
.opm-report .congruence .head .l h2 { font-family:'Cormorant Garamond',serif; font-weight:500; font-size: 26px; margin: 4px 0 0; }
.opm-report .score { text-align:right; }
.opm-report .score .num { font-family:'Cormorant Garamond',serif; font-size: 46px; line-height:1; color: var(--signal); }
.opm-report .score .lab { font-size: 11px; color: var(--muted-2); letter-spacing: 2px; text-transform: uppercase; font-family:'JetBrains Mono',monospace; }
.opm-report .tracks { padding: 12px 24px 22px; }
.opm-report .track { display:grid; grid-template-columns: 92px 1fr; align-items:center; gap: 16px; padding: 12px 0; border-bottom: 1px dashed var(--line); }
.opm-report .track:last-child { border-bottom: none; }
.opm-report .track .tlab { font-family:'JetBrains Mono',monospace; font-size: 11px; letter-spacing: 1px; color: var(--muted); text-transform: uppercase; }
.opm-report .bar { position: relative; height: 30px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--line); overflow: hidden; }
.opm-report .bar i { position:absolute; top:0; bottom:0; left:0; display:block; border-radius: 8px 0 0 8px; }
.opm-report .bar.verbal i { background: linear-gradient(90deg, rgba(216,194,144,0.85), rgba(216,194,144,0.45)); }
.opm-report .bar.signal i { background: linear-gradient(90deg, rgba(112,240,222,0.85), rgba(112,240,222,0.4)); }
.opm-report .bar .mark { position:absolute; top:-4px; bottom:-4px; width: 2px; background: rgba(239,125,125,0.8); }
.opm-report .bar .mark::after { content: attr(data-l); position:absolute; top:-18px; left: 50%; transform: translateX(-50%); font-family:'JetBrains Mono',monospace; font-size:9px; color: var(--danger); white-space:nowrap; }
.opm-report .legend { display:flex; gap: 18px; padding: 0 24px 20px; flex-wrap: wrap; font-size: 12px; color: var(--muted); }
.opm-report .legend span { display:flex; align-items:center; gap:7px; }
.opm-report .swatch { width: 11px; height: 11px; border-radius: 3px; }
.opm-report .congr-note { padding: 14px 24px; border-top: 1px solid var(--line); background: rgba(112,240,222,0.03); font-size: 13px; color: var(--muted); display:flex; gap: 10px; align-items:center; }
.opm-report .congr-note b { color: var(--ink); font-weight: 600; }
.opm-report .grid { display: grid; grid-template-columns: 1.55fr 1fr; gap: 22px; margin-top: 26px; align-items: start; }
.opm-report .panel { background: linear-gradient(180deg, var(--panel), var(--bg-2)); border: 1px solid var(--line); border-radius: var(--radius); }
.opm-report .panel .p-head { display:flex; align-items:center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--line); }
.opm-report .panel .p-head .k { font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:2px; text-transform: uppercase; }
.opm-report .panel .p-head h3 { font-family:'Cormorant Garamond',serif; font-weight:500; font-size: 24px; margin: 3px 0 0; }
.opm-report .k.lucid { color: #c9a0e0; }
.opm-report .k.answers { color: var(--gold); }
.opm-report .k.cygnus { color: var(--signal); }
.opm-report .k.oracle { color: var(--warn); }
.opm-report .pronoun { font-family:'JetBrains Mono',monospace; font-size: 10px; color: var(--muted-2); border: 1px solid var(--line); border-radius: 6px; padding: 3px 7px; }
.opm-report .lucid-body { padding: 8px 26px 24px; }
.opm-report .lucid-body p { font-family:'Cormorant Garamond', serif; font-size: 20px; line-height: 1.55; color: #e7ecf4; margin: 16px 0; }
.opm-report .lucid-body p .drop { float: left; font-size: 58px; line-height: 0.8; padding: 6px 12px 0 0; color: var(--gold); font-weight: 600; }
.opm-report .lucid-body .pull { border-left: 2px solid var(--signal); padding-left: 16px; margin: 20px 0; font-style: italic; color: var(--signal); font-size: 21px; font-family:'Cormorant Garamond', serif; }
.opm-report .lucid-meta { display:flex; gap: 16px; flex-wrap: wrap; padding: 14px 26px; border-top: 1px solid var(--line); font-family:'JetBrains Mono',monospace; font-size: 11px; color: var(--muted-2); }
.opm-report .qa { padding: 6px 22px 20px; }
.opm-report .qa .item { padding: 16px 0; border-bottom: 1px solid var(--line); }
.opm-report .qa .item:last-child { border-bottom: none; }
.opm-report .qa .q { font-size: 12px; color: var(--muted); font-weight: 600; letter-spacing:.2px; margin-bottom: 7px; display:flex; gap: 9px; align-items:baseline; }
.opm-report .qa .q .n { font-family:'JetBrains Mono',monospace; color: var(--gold); font-size: 11px; }
.opm-report .qa .a { font-family:'Cormorant Garamond', serif; font-size: 20px; color: var(--ink); line-height: 1.4; }
.opm-report .qa .a .tag { font-family:'Inter',sans-serif; font-size: 11px; color: var(--signal); background: var(--signal-dim); border-radius: 6px; padding: 2px 8px; margin-left: 8px; vertical-align: middle; }
.opm-report .stack { display:flex; flex-direction: column; gap: 22px; }
.opm-report .cyg { padding: 18px 22px 22px; }
.opm-report .expr { display:flex; align-items:center; justify-content: space-between; margin-bottom: 16px; }
.opm-report .expr .big { font-family:'Cormorant Garamond',serif; font-size: 30px; }
.opm-report .expr .pct { font-family:'JetBrains Mono',monospace; font-size: 22px; color: var(--signal); }
.opm-report .au { display:flex; align-items:center; gap: 12px; margin: 11px 0; }
.opm-report .au .name { font-family:'JetBrains Mono',monospace; font-size: 11px; color: var(--muted); width: 108px; flex-shrink:0; }
.opm-report .au .meter { flex:1; height: 7px; border-radius: 4px; background: rgba(255,255,255,0.05); overflow:hidden; }
.opm-report .au .meter i { display:block; height:100%; background: linear-gradient(90deg, var(--signal), rgba(112,240,222,0.4)); border-radius: 4px; }
.opm-report .au .val { font-family:'JetBrains Mono',monospace; font-size: 11px; color: var(--muted-2); width: 34px; text-align:right; }
.opm-report .blend { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line); display:flex; align-items:flex-end; gap: 3px; height: 46px; }
.opm-report .blend i { flex:1; background: linear-gradient(180deg, rgba(112,240,222,0.7), rgba(112,240,222,0.12)); border-radius: 2px 2px 0 0; }
.opm-report .blend-cap { font-family:'JetBrains Mono',monospace; font-size: 10px; color: var(--muted-2); margin-top: 8px; letter-spacing: 1px; }
.opm-report .oracle { padding: 16px 22px 22px; }
.opm-report .pattern { display:flex; gap: 12px; padding: 13px 0; border-bottom: 1px solid var(--line); }
.opm-report .pattern:last-child { border-bottom:none; }
.opm-report .pattern .pi { width: 30px; height: 30px; flex-shrink:0; border-radius: 8px; display:grid; place-items:center; font-size: 13px; background: var(--gold-dim); border: 1px solid var(--line); }
.opm-report .pattern .pt b { font-size: 13px; }
.opm-report .pattern .pt span { display:block; font-size: 12px; color: var(--muted); margin-top: 2px; }
.opm-report .pattern .conf { margin-left:auto; font-family:'JetBrains Mono',monospace; font-size: 11px; color: var(--muted-2); align-self:center; }
.opm-report .lower { display:grid; grid-template-columns: 1.55fr 1fr; gap: 22px; margin-top: 22px; align-items:start; }
.opm-report .transcript { padding: 6px 22px 20px; max-height: 340px; overflow:auto; }
.opm-report .line { display:flex; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--line); }
.opm-report .line:last-child { border-bottom:none; }
.opm-report .line .spk { font-family:'JetBrains Mono',monospace; font-size: 10px; letter-spacing:1px; width: 66px; flex-shrink:0; padding-top: 3px; }
.opm-report .line.clara .spk { color: var(--signal); }
.opm-report .line.guest .spk { color: var(--gold); }
.opm-report .line .txt { font-size: 14px; color: #d7dde7; }
.opm-report .line .t { font-family:'JetBrains Mono',monospace; font-size:10px; color: var(--muted-2); margin-left:auto; padding-top:3px; }
.opm-report .sched { padding: 16px 22px 22px; }
.opm-report .slot { display:flex; align-items:center; gap: 12px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; margin-bottom: 10px; background: rgba(255,255,255,0.02); transition: border-color .15s ease, background .15s ease; }
.opm-report .slot:hover { border-color: var(--signal); background: rgba(112,240,222,0.04); }
.opm-report .slot .cal { width: 34px; height: 34px; border-radius: 9px; background: var(--gold-dim); display:grid; place-items:center; font-family:'Cormorant Garamond',serif; font-size: 17px; color: var(--gold); }
.opm-report .slot b { font-size: 14px; }
.opm-report .slot span { font-size: 12px; color: var(--muted); }
.opm-report .legal { margin-top: 40px; padding-top: 22px; border-top: 1px solid var(--line); display:flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; font-size: 12px; color: var(--muted-2); }
.opm-report .legal .compliance { display:flex; align-items:center; gap: 9px; }
.opm-report .legal .compliance .dot { background: var(--ok); box-shadow: 0 0 8px var(--ok); }
.opm-report .section-label { font-family:'JetBrains Mono',monospace; font-size: 11px; letter-spacing: 2px; color: var(--muted-2); text-transform: uppercase; margin: 34px 4px 2px; }
.opm-report .fade { opacity: 0; transform: translateY(14px); animation: opmRise .7s cubic-bezier(.2,.7,.2,1) forwards; }
.opm-report .fade.d1 { animation-delay: .05s; } .opm-report .fade.d2 { animation-delay: .12s; } .opm-report .fade.d3 { animation-delay: .2s; } .opm-report .fade.d4 { animation-delay: .28s; } .opm-report .fade.d5 { animation-delay: .36s; }
@keyframes opmRise { to { opacity: 1; transform: none; } }
@media (max-width: 900px) { .opm-report .grid, .opm-report .lower { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .opm-report .fade { animation: none; opacity: 1; transform: none; } .opm-report .dust span { animation: none; display:none; } }
`

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'

export default function PerceptionReport({ data }: { data: PerceptionReportData }) {
  const dustRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const id = 'opm-report-fonts'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = FONT_HREF
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    const host = dustRef.current
    if (!host) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const nodes: HTMLSpanElement[] = []
    for (let i = 0; i < 26; i += 1) {
      const s = document.createElement('span')
      s.style.left = `${Math.random() * 100}%`
      s.style.bottom = '-10px'
      const d = 14 + Math.random() * 22
      s.style.animationDuration = `${d}s`
      s.style.animationDelay = `${-Math.random() * d}s`
      const sc = 0.6 + Math.random() * 1.6
      s.style.width = `${sc}px`
      s.style.height = `${sc}px`
      host.appendChild(s)
      nodes.push(s)
    }
    return () => {
      nodes.forEach((n) => n.remove())
    }
  }, [])

  const locale = data.locale || data.call.language.toLowerCase()
  const labels = reportLabels[locale as keyof typeof reportLabels] || reportLabels.en
  const blendMax = useMemo(() => Math.max(1, ...data.cygnus.blendshapes), [data.cygnus.blendshapes])

  return (
    <div className="opm-report" lang={locale}>
      <style>{REPORT_CSS}</style>
      <div className="dust" ref={dustRef} />

      <div className="wrap">
        <div className="masthead fade">
          <div className="brand">
            <div className="mark">O</div>
            <div>
              <div className="name">ONIOKO</div>
              <div className="sub">{labels.observation}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="eyebrow">{labels.report}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--muted-2)', marginTop: 4 }}>
              REF · {data.ref} · {data.date}
            </div>
          </div>
        </div>

        <div className="report-title fade d1">
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>{data.eyebrow}</div>
          <h1>
            {labels.title}
          </h1>
        </div>
        <p className="report-sub fade d1">
          {labels.intro}
        </p>

        <div className="subject fade d2">
          <div className="avatar">{data.guest.initials}</div>
          <div className="who">
            <b>{data.guest.name}</b>
            <span>{data.guest.role} · {data.guest.company}</span>
          </div>
          <div className="spacer" />
          <div className="meta-chip"><span className="dot" style={{ background: 'var(--signal)' }} />{labels.duration} <b>{data.call.duration}</b></div>
          <div className="meta-chip">{labels.language} <b>{data.call.language}</b></div>
          {data.call.consent ? <span className="badge ok">{labels.consent}</span> : null}
          <button
            className="btn-rec"
            disabled={!data.call.recordingUrl}
            onClick={() => {
              if (data.call.recordingUrl) window.open(data.call.recordingUrl, '_blank', 'noopener')
            }}
          >
            {labels.recording}
          </button>
        </div>

        <div className="section-label fade d2">{labels.assessment}</div>
        <div className="congruence fade d2">
          <div className="head">
            <div className="l">
              <div className="k">{labels.congruence}</div>
              <h2>{labels.comparison}</h2>
            </div>
            <div className="score">
              <div className="num">
                {data.congruence.score ?? '—'}
                {data.congruence.score != null && <span style={{ fontSize: 22, color: 'var(--muted-2)' }}>%</span>}
              </div>
              <div className="lab">{labels.congruence}</div>
            </div>
          </div>
          {data.congruence.score != null && <><div className="tracks">
            <div className="track">
              <div className="tlab">{labels.verbal}</div>
              <div className="bar verbal"><i style={{ width: `${data.congruence.verbal}%` }} /></div>
            </div>
            <div className="track">
              <div className="tlab">{labels.signal}</div>
              <div className="bar signal">
                <i style={{ width: `${data.congruence.signal}%` }} />
                {data.congruence.mismatch ? (
                  <span className="mark" style={{ left: `${data.congruence.mismatch.pos}%` }} data-l={data.congruence.mismatch.label} />
                ) : null}
              </div>
            </div>
          </div>
          <div className="legend">
            <span><span className="swatch" style={{ background: 'rgba(216,194,144,0.8)' }} />{labels.verbalLegend}</span>
            <span><span className="swatch" style={{ background: 'rgba(112,240,222,0.8)' }} />{labels.signalLegend}</span>
            <span><span className="swatch" style={{ background: 'rgba(239,125,125,0.8)' }} />{labels.mismatch}</span>
          </div>
          </>}<div className="congr-note">
            <span>◆</span>
            <span>{data.congruence.note}</span>
          </div>
        </div>

        <div className="grid">
          <div className="panel fade d3">
            <div className="p-head">
              <div>
                <div className="k lucid">{labels.narrative}</div>
                <h3>{labels.story}</h3>
              </div>
              
            </div>
            <div className="lucid-body">
              {data.lucid.paragraphs.map((para, i) => (
                <p key={i}>
                  {i === 0 ? <span className="drop">{para.charAt(0)}</span> : null}
                  {i === 0 ? para.slice(1) : para}
                </p>
              ))}
              {data.lucid.pull ? <div className="pull">{data.lucid.pull}</div> : null}
            </div>
            <div className="lucid-meta">
              <span>{labels.model} · {data.lucid.model}</span>
              <span>{data.lucid.words} {labels.words}</span>
              <span>{data.lucid.latency}</span>
              
            </div>
          </div>

          <div className="stack">
            <div className="panel fade d3">
              <div className="p-head">
                <div>
                  <div className="k cygnus">{labels.signals}</div>
                  <h3>{labels.visible}</h3>
                </div>
                
              </div>
              <div className="cyg">
                <div className="expr">
                  <div className="big">{data.cygnus.expression}</div>
                  {data.cygnus.expressionPct != null && <div className="pct">{data.cygnus.expressionPct}%</div>}
                </div>
                {data.cygnus.aus.map((au) => (
                  <div className="au" key={au.name}>
                    <div className="name">{au.name}</div>
                    <div className="meter"><i style={{ width: `${au.value}%` }} /></div>
                    <div className="val">.{String(au.value).padStart(2, '0')}</div>
                  </div>
                ))}
                <div className="blend">
                  {data.cygnus.blendshapes.map((b, i) => (
                    <i key={i} style={{ height: `${Math.round((b / blendMax) * 100)}%` }} />
                  ))}
                </div>
                <div className="blend-cap">
                  {data.cygnus.resolution}
                </div>
              </div>
            </div>

            <div className="panel fade d4">
              <div className="p-head">
                <div>
                  <div className="k oracle">{labels.patterns}</div>
                  <h3>{labels.connections}</h3>
                </div>
                
              </div>
              <div className="oracle">
                {!data.oracle.patterns.length && <p>{labels.noPatterns}</p>}
                {data.oracle.patterns.map((p) => (
                  <div className="pattern" key={p.title}>
                    <div className="pi">{p.icon}</div>
                    <div className="pt">
                      <b>{p.title}</b>
                      <span>{p.detail}</span>
                    </div>
                    <div className="conf">{p.conf}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="section-label">{labels.answers}</div>
        <div className="panel fade">
          <div className="p-head">
            <div>
              <div className="k answers">{labels.fromCall}</div>
              <h3>{labels.topics}</h3>
            </div>
            <span className="pronoun" style={{ color: 'var(--gold)', borderColor: 'var(--gold-dim)' }}>
              {data.answers.length} {labels.questions}
            </span>
          </div>
          <div className="qa">
            {data.answers.map((item) => (
              <div className="item" key={item.n}>
                <div className="q"><span className="n">{item.n}</span>{item.q}</div>
                <div className="a">
                  {item.a}
                  {item.tag ? (
                    <span
                      className="tag"
                      style={item.tag.warn ? { color: 'var(--warn)', background: 'rgba(240,179,110,0.12)' } : undefined}
                    >
                      {item.tag.label}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lower">
          <div className="panel fade">
            <div className="p-head">
              <div>
                <div className="k" style={{ color: 'var(--muted)' }}>{labels.transcript}</div>
                <h3>{labels.wording}</h3>
              </div>
              <span className="pronoun">{labels.original}</span>
            </div>
            <div className="transcript">
              {data.transcript.map((line, i) => (
                <div className={`line ${line.speaker}`} key={i}>
                  <span className="spk">{line.name}</span>
                  <span className="txt">{line.text}</span>
                  <span className="t">{line.t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel fade">
            <div className="p-head">
              <div>
                <div className="k answers">{labels.appointment}</div>
                <h3>{labels.proposed}</h3>
              </div>
            </div>
            <div className="sched">
              {data.scheduling.map((slot) => (
                <div className="slot" key={slot.label}>
                  <div className="cal">{slot.day}</div>
                  <div>
                    <b>{slot.label}</b>
                    <span>{slot.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="legal">
          <div className="compliance">
            <span className="dot" />{labels.legal}
          </div>
          <div>ONIOKO · EXIDEUS LLC · {labels.report}</div>
        </div>
      </div>
    </div>
  )
}
