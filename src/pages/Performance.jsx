import { useDB, me, scope, goalOf, won, fm } from '../store'
import { PageHead, Tiles, Table, Pill } from '../ui'

const pct = (w, g) => g ? w / g * 100 : 0
const PP = ({ v }) => <div className="ach"><div className="ach-bar"><i className={v >= 75 ? 'g' : v > 0 ? 'a' : ''} style={{ width: `${Math.min(100, v)}%` }} /></div><Pill c={v >= 75 ? 'g' : v > 0 ? 'a' : 'n'}>{v.toFixed(1)}%</Pill></div>

export default function Performance() {
  const db = useDB(), u = me(), people = scope(u)
  const rows = people.map(x => ({
    x, turn: x.turn || 0, goal: goalOf(x), bni: x.bni, w: won(x.id),
    o: db.ones.filter(a => a.f === x.id).length, rp: db.refs.filter(r => r.f === x.id).length, rr: db.refs.filter(r => r.to === x.id).length,
    jc: db.acts.filter(a => a.t === 'Joint call' && a.f === x.id).length, pd: db.acts.filter(a => a.t === 'Power Date' && a.f === x.id).length,
  }))
  const T = k => rows.reduce((a, r) => a + r[k], 0)
  return <>
    <PageHead eyebrow="PERFORMANCE DASHBOARD" title="Performance" sub="October 2026 – March 2027 · bi-weekly meetings · Power Team goal = 67% of BNI goal." />
    <Tiles items={[['Total BNI goal', fm(T('bni'))], ['Power Team goal (67%)', fm(T('goal'))], ['Business won', fm(T('w'))], ['Achievement', `${pct(T('w'), T('goal')).toFixed(1)}%`], ['1-to-1s logged', T('o')], ['Referrals passed', T('rp')], ['Referrals received', T('rr')], ['Joint calls', T('jc')]]} />
    <div className="mt-4"><Table head={['Member', 'Category', 'Turnover goal', 'Power Team goal', 'Business won', 'Goal achievement', '1-to-1s', 'Referrals passed', 'Referrals received', 'Joint calls', 'Power Dates']} rows={[...rows.map(r => <tr key={r.x.id}>
      <td className="td font-semibold">{r.x.name}</td><td className="td">{r.x.cat}</td><td className="td">{fm(r.turn)}</td><td className="td">{fm(r.goal)}</td><td className="td">{fm(r.w)}</td><td className="td"><PP v={pct(r.w, r.goal)} /></td>
      <td className="td">{r.o}</td><td className="td">{r.rp}</td><td className="td">{r.rr}</td><td className="td">{r.jc}</td><td className="td">{r.pd}</td></tr>),
    rows.length > 0 && <tr key="t" className="bg-gray-50 font-bold"><td className="td">TEAM TOTAL</td><td className="td"></td><td className="td">{fm(T('turn'))}</td><td className="td">{fm(T('goal'))}</td><td className="td">{fm(T('w'))}</td><td className="td"><PP v={pct(T('w'), T('goal'))} /></td><td className="td">{T('o')}</td><td className="td">{T('rp')}</td><td className="td">{T('rr')}</td><td className="td">{T('jc')}</td><td className="td">{T('pd')}</td></tr>]} /></div>
    <p className="text-xs text-gray-500 mt-3">Business won counts thank-you notes converted to business. Referrals received counts every referral recorded to the member.</p>
  </>
}
