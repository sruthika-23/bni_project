import Icon from './icons'
export { fm } from './store'
export const Pill = ({ c = 'n', children }) => <span className={`pill pill-${c}`}>{children}</span>
export const Tile = ({ label, value }) => <div className="card tile"><div className="tile-label">{label}</div><div className="tile-value">{value}</div></div>
export const Tiles = ({ items }) => <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">{items.map(([l, v]) => <Tile key={l} label={l} value={v} />)}</div>
export const Table = ({ head, rows }) => (
  <div className="card !p-0 overflow-x-auto"><table className="w-full"><thead><tr>{head.map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
    <tbody>{rows.length ? rows : <tr><td className="td empty-cell" colSpan={head.length}><div className="empty-block"><span className="empty-ico"><Icon name="inbox" size={26} /></span><b>Nothing here yet</b><span>Records you add or that match your filters will appear here.</span></div></td></tr>}</tbody></table></div>)
export function Bars({ title, data, fmt = v => v }) {
  const mx = Math.max(1, ...data.map(d => d.v))
  return <div className="card"><div className="font-semibold mb-3">{title}</div>{data.map(d => (
    <div key={d.l} className="flex items-center gap-2 mb-1.5 text-xs"><span className="w-36 truncate text-gray-600">{d.l}</span>
      <div className="flex-1 bg-gray-100 rounded h-3"><div className="bg-bni h-3 rounded" style={{ width: `${d.v / mx * 100}%` }} /></div>
      <span className="w-16 text-right font-semibold">{fmt(d.v)}</span></div>))}</div>
}
const PC = ['#CF2030', '#f5a623', '#1f9d6b', '#3b6fd4', '#888']
export function Pie({ title, data }) {
  const tot = data.reduce((a, d) => a + d.v, 0); let o = 25
  return <div className="card"><div className="font-semibold mb-3">{title}</div><div className="flex items-center gap-5">
    <svg viewBox="0 0 36 36" className="w-32 h-32"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="#eee" strokeWidth="6" />
      {tot > 0 && data.map((d, i) => { const p = d.v / tot * 100, el = <circle key={d.l} cx="18" cy="18" r="15.9155" fill="none" stroke={PC[i % 5]} strokeWidth="6" strokeDasharray={`${p} ${100 - p}`} strokeDashoffset={o} />; o -= p; return el })}</svg>
    <ul className="text-sm space-y-1">{data.map((d, i) => <li key={d.l}><span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: PC[i % 5] }} />{d.l}: <b>{d.v}</b></li>)}</ul></div></div>
}
export const RC = { Passed: 'n', Contacted: 'a', Quoted: 'a', Won: 'g', Lost: 'r' }
export function PageHead({ eyebrow, title, sub, action }) { return <div className="module-head"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{sub}</p></div>{action}</div> }
