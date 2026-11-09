// Interactive SVG charts: no external dependency.
import { useState, useRef, useEffect, useId } from 'react'
import Icon from './icons'

const PAL = ['#CF2030', '#2F6FDE', '#1F9D6B', '#F5A623', '#7A5AF8', '#8A93A0']
const noMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export const Panel = ({ title, hint, children, className = '' }) => (
  <section className={`panel ${className}`}>
    <div className="panel-heading"><h3>{title}</h3>{hint && <span className="chart-hint">{hint}</span>}</div>
    {children}
  </section>
)

const Empty = () => <div className="empty-block compact"><span className="empty-ico"><Icon name="chart" size={22} /></span><b>No data yet</b><span>This chart fills in as records are added.</span></div>

// "Nice" axis ticks (0, 25, 50 … rather than 0, 23, 46).
function niceTicks(mx, n = 4) {
  const raw = Math.max(mx, 1) / n, mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag, step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag
  const top = Math.ceil(Math.max(mx, 1) / step) * step, out = []
  for (let v = 0; v <= top + step / 1000; v += step) out.push(Math.round(v * 1e6) / 1e6)
  return { ticks: out, top }
}

// Left margin that fits the widest axis label.
const leftFor = (ticks, fmt) => Math.max(40, 16 + Math.max(...ticks.map(t => String(fmt(t)).length)) * 6.4)
const clip = (t, n) => { t = String(t); return t.length > n ? t.slice(0, Math.max(1, n - 1)) + '…' : t }

// Tooltip that follows the cursor inside a relatively-positioned wrapper.
function useTip() {
  const wrap = useRef(null), [tip, setTip] = useState(null)
  const show = (e, content) => {
    const r = wrap.current?.getBoundingClientRect(); if (!r) return
    setTip({ x: Math.min(Math.max(e.clientX - r.left, 80), r.width - 80), y: e.clientY - r.top, content })
  }
  const hide = () => setTip(null)
  const node = tip && <div className="ctip" style={{ left: tip.x, top: tip.y }}>{tip.content}</div>
  return { wrap, show, hide, node }
}

const topRound = (x, y, w, h, r) => { r = Math.min(r, w / 2, h); return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z` }

/* ---------- Horizontal bars ---------- */
export function HBar({ title, hint, data, fmt = v => v, color = PAL[0], share = false }) {
  const mx = Math.max(1, ...data.map(d => d.v)), tot = data.reduce((a, d) => a + d.v, 0)
  const top = data.length > 1 && mx > 0 ? data.findIndex(d => d.v === mx) : -1
  return <Panel title={title} hint={hint}>
    {data.length ? <div className="hbar-list">{data.map((d, i) => (
      <div className={`hbar-row ${i === top ? 'is-top' : ''}`} key={d.l} title={`${d.l}: ${fmt(d.v)}`}>
        <span className="hbar-label">{d.l}</span>
        <div className="hbar-track"><i style={{ width: `${Math.max(d.v ? 2 : 0, d.v / mx * 100)}%`, background: `linear-gradient(90deg,${color},${color}cc)`, animationDelay: `${i * 45}ms` }} /></div>
        <b>{fmt(d.v)}{share && tot > 0 && <em>{Math.round(d.v / tot * 100)}%</em>}</b>
      </div>))}</div> : <Empty />}
  </Panel>
}

/* ---------- Vertical columns (grouped) ---------- */
export function Columns({ title, hint, groups, series, fmt = v => v }) {
  const W = 560, H = 230, B = 30, T = 22
  const [off, setOff] = useState([]), [hv, setHv] = useState(-1), { wrap, show, hide, node } = useTip()
  const live = series.map((_, i) => i).filter(i => !off.includes(i))
  const mx = Math.max(1, ...groups.flatMap(g => live.map(i => g.v[i] || 0)))
  const { ticks, top } = niceTicks(mx), L = leftFor(ticks, fmt)
  const gw = (W - L) / Math.max(1, groups.length), bw = Math.min(30, Math.max(6, (gw - 12) / Math.max(1, live.length)))
  const Y = v => T + (H - B - T) * (1 - v / top)
  const toggle = i => setOff(o => o.includes(i) ? o.filter(x => x !== i) : live.length > 1 ? [...o, i] : o)
  const labels = live.length === 1 && groups.length <= 10
  return <Panel title={title} hint={hint}>
    {groups.length ? <div className="chart-wrap" ref={wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className="col-svg" role="img" aria-label={title} onMouseLeave={() => { hide(); setHv(-1) }}>
        {ticks.map(t => <g key={t}><line x1={L} x2={W} y1={Y(t)} y2={Y(t)} className={t ? 'grid-line' : 'axis-line'} /><text x={L - 8} y={Y(t) + 3.5} textAnchor="end" className="axis-text">{fmt(t)}</text></g>)}
        {groups.map((g, gi) => {
          const x0 = L + gi * gw + (gw - bw * live.length) / 2
          return <g key={g.l + gi}>
            {hv === gi && <rect x={L + gi * gw + 2} y={T} width={gw - 4} height={H - B - T} rx="8" className="hover-band" />}
            {live.map((si, k) => { const v = g.v[si] || 0, h = (H - B - T) * v / top
              return <g key={si}><path d={topRound(x0 + k * bw + 1.5, H - B - Math.max(h, v ? 3 : 0), bw - 3, Math.max(h, v ? 3 : 0), 5)} fill={PAL[si % PAL.length]} className="bar-rect" style={{ animationDelay: `${gi * 35 + k * 20}ms`, opacity: hv < 0 || hv === gi ? 1 : .45 }} />
                {labels && v > 0 && <text x={x0 + k * bw + bw / 2} y={H - B - h - 6} textAnchor="middle" className="val-text">{fmt(v)}</text>}</g> })}
            <text x={L + gi * gw + gw / 2} y={H - 9} textAnchor="middle" className="axis-text x">{clip(g.l, Math.floor(gw / 6.4))}</text>
            <rect x={L + gi * gw} y={T} width={gw} height={H - B - T + 18} fill="transparent" onMouseMove={e => { setHv(gi); show(e, <><b>{g.l}</b>{live.map(si => <div key={si} className="ctip-row"><i style={{ background: PAL[si % PAL.length] }} />{series[si]}<strong>{fmt(g.v[si] || 0)}</strong></div>)}</>) }} />
          </g>
        })}
      </svg>
      {node}
      {series.length > 1 && <div className="legend">{series.map((s, i) => <button type="button" key={s} className={off.includes(i) ? 'is-off' : ''} onClick={() => toggle(i)} title="Click to show / hide"><i style={{ background: PAL[i % PAL.length] }} />{s}</button>)}</div>}
    </div> : <Empty />}
  </Panel>
}

export const Legend = ({ items }) => <div className="legend">{items.map((s, i) => <span key={s}><i style={{ background: PAL[i % PAL.length] }} />{s}</span>)}</div>

/* ---------- Donut ---------- */
export function Donut({ title, hint, data, centre }) {
  const tot = data.reduce((a, d) => a + d.v, 0), R = 15.9155, [hi, setHi] = useState(-1)
  const gap = data.filter(d => d.v > 0).length > 1 ? 0.7 : 0
  let off = 25
  const cur = hi >= 0 ? data[hi] : null
  return <Panel title={title} hint={hint}>
    {tot > 0 ? <div className="donut-wrap">
      <div className="donut">
        <svg viewBox="-3 -3 42 42" role="img" aria-label={title} onMouseLeave={() => setHi(-1)}>
          <circle cx="18" cy="18" r={R} fill="none" className="donut-bg" strokeWidth="4.6" />
          {data.map((d, i) => {
            const p = d.v / tot * 100, el = d.v > 0 && <circle key={d.l} cx="18" cy="18" r={R} fill="none" stroke={PAL[i % PAL.length]} strokeWidth={hi === i ? 5.8 : 4.6}
              strokeDasharray={`${Math.max(p - gap, .2)} ${100 - Math.max(p - gap, .2)}`} strokeDashoffset={off - gap / 2} className="donut-seg" style={{ opacity: hi < 0 || hi === i ? 1 : .3 }} onMouseEnter={() => setHi(i)} />
            off -= p; return el
          })}
        </svg>
        <div className="donut-centre"><b>{cur ? cur.v : (centre ?? tot)}</b><small>{cur ? `${Math.round(cur.v / tot * 100)}% · ${cur.l}` : 'Total'}</small></div>
      </div>
      <ul className="donut-legend">{data.map((d, i) => <li key={d.l} className={hi === i ? 'is-hi' : ''} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(-1)}>
        <i style={{ background: PAL[i % PAL.length] }} /><span>{d.l}</span><b>{d.v}</b><em>{Math.round(d.v / tot * 100)}%</em></li>)}</ul>
    </div> : <Empty />}
  </Panel>
}

/* ---------- Smooth line / area ---------- */
function smooth(p) {
  if (p.length < 3) return p.map((q, i) => `${i ? 'L' : 'M'}${q[0]},${q[1]}`).join('')
  let d = `M${p[0][0]},${p[0][1]}`
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c
    d += `C${b[0] + (c[0] - a[0]) / 6},${b[1] + (c[1] - a[1]) / 6} ${c[0] - (e[0] - b[0]) / 6},${c[1] - (e[1] - b[1]) / 6} ${c[0]},${c[1]}`
  }
  return d
}
export function Line({ title, hint, points, fmt = v => v, max }) {
  const W = 560, H = 230, B = 30, T = 22, id = 'lg' + useId().replace(/:/g, '')
  const [hv, setHv] = useState(-1), { wrap, show, hide, node } = useTip()
  const mx = max || Math.max(1, ...points.map(p => p.v)), { ticks, top } = niceTicks(mx), L = leftFor(ticks, fmt)
  const step = points.length > 1 ? (W - L - 34) / (points.length - 1) : 0
  const Y = v => T + (H - B - T) * (1 - Math.min(v, top) / top)
  const xy = points.map((p, i) => [L + 16 + i * step, Y(p.v)])
  const d = smooth(xy), base = H - B
  const area = xy.length ? `${d}L${xy[xy.length - 1][0]},${base}L${xy[0][0]},${base}Z` : ''
  const avg = points.length ? points.reduce((a, p) => a + p.v, 0) / points.length : 0
  const move = e => {
    const r = e.currentTarget.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W
    let best = 0; xy.forEach((q, i) => { if (Math.abs(q[0] - x) < Math.abs(xy[best][0] - x)) best = i })
    setHv(best); show(e, <><b>{points[best].l}</b><div className="ctip-row"><i style={{ background: PAL[0] }} />Value<strong>{fmt(points[best].v)}</strong></div></>)
  }
  return <Panel title={title} hint={hint}>
    {points.length ? <div className="chart-wrap" ref={wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className="col-svg" role="img" aria-label={title} onMouseMove={move} onMouseLeave={() => { hide(); setHv(-1) }}>
        <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={PAL[0]} stopOpacity=".22" /><stop offset="1" stopColor={PAL[0]} stopOpacity="0" /></linearGradient></defs>
        {ticks.map(t => <g key={t}><line x1={L} x2={W} y1={Y(t)} y2={Y(t)} className={t ? 'grid-line' : 'axis-line'} /><text x={L - 8} y={Y(t) + 3.5} textAnchor="end" className="axis-text">{fmt(t)}</text></g>)}
        {points.length > 2 && <g><line x1={L} x2={W} y1={Y(avg)} y2={Y(avg)} className="avg-line" /><text x={W - 4} y={Y(avg) - 5} textAnchor="end" className="avg-text">Avg {fmt(Math.round(avg))}</text></g>}
        <path d={area} fill={`url(#${id})`} className="area-in" />
        <path d={d} fill="none" stroke={PAL[0]} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="line-draw" />
        {hv >= 0 && <line x1={xy[hv][0]} x2={xy[hv][0]} y1={T} y2={base} className="guide" />}
        {xy.map((q, i) => <g key={i}><circle cx={q[0]} cy={q[1]} r={hv === i ? 6 : 3.8} fill="#fff" stroke={PAL[0]} strokeWidth="2.2" className="pt" /><text x={q[0]} y={H - 9} textAnchor="middle" className={`axis-text x ${hv === i ? 'on' : ''}`}>{clip(points[i].l, Math.max(5, Math.floor(step / 6.4)))}</text></g>)}
        <rect x={L} y={T} width={W - L} height={H - B - T + 18} fill="transparent" />
      </svg>
      {node}
    </div> : <Empty />}
  </Panel>
}

/* ---------- Sparkline (for metric cards) ---------- */
export function Spark({ data, color = PAL[0], className = '' }) {
  const id = 'sp' + useId().replace(/:/g, ''), W = 96, H = 34
  const mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1
  const p = data.map((v, i) => [2 + i * (W - 4) / (data.length - 1), H - 4 - (v - mn) / rg * (H - 10)])
  const d = smooth(p)
  return <svg className={`spark ${className}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
    <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".25" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    <path d={`${d}L${p[p.length - 1][0]},${H}L${p[0][0]},${H}Z`} fill={`url(#${id})`} className="area-in" />
    <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" pathLength="1" className="line-draw" />
    <circle cx={p[p.length - 1][0]} cy={p[p.length - 1][1]} r="2.8" fill={color} />
  </svg>
}

/* ---------- Count-up number (keeps ₹ / % / text around the number) ---------- */
export function CountUp({ value }) {
  const str = String(value), m = str.match(/\d[\d,]*\.?\d*/)
  const [n, setN] = useState(0)
  const target = m ? parseFloat(m[0].replace(/,/g, '')) : 0
  useEffect(() => {
    if (!m || noMotion()) { setN(target); return }
    let raf, t0
    const tick = t => { t0 = t0 ?? t; const k = Math.min(1, (t - t0) / 800); setN(target * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [str])
  if (!m) return <>{str}</>
  const dec = (m[0].split('.')[1] || '').length
  const shown = (m[0].includes(',') ? n.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : n.toFixed(dec))
  return <>{str.slice(0, m.index)}{shown}{str.slice(m.index + m[0].length)}</>
}
