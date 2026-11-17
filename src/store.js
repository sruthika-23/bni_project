// Mock data layer. Replace each exported function with a call to the Node.js + MySQL REST API.
import { useEffect, useState } from 'react'
import { seedExtras } from './seed'
const KEY = 'bni-hub-v2'
export const TEAMS = ['Industrial Procurement','Real Estate & Construction','Healthcare & Wellness','Finance & Insurance','Food & Hospitality','Education & Training','Technology & IT','Manufacturing & Engineering','Retail & Consumer','Marketing & Media','Legal & Professional','Logistics & Transport']
export const SRC = ['Visitor visit','Meeting','Joint call','1-to-1','Direct referral']
export const STG = ['Thanked','Value confirmed','Converted to business']
export const RS = ['Passed','Contacted','Quoted','Won','Lost']
const P = [['Sivaganesh Dorairaj','Groceries',2e7,2e8],['Santhosh Ravichandran','Robotics Development',1e6,4.5e6],['Abhay Bhansali','Test & Measuring Instruments',1e6,1.2e7],['Shivshankar','Cable & Wires',1e7,7e7],['Krishna Kumar','CCTV Surveillance',5e6,1e7],['Ramya Murugan','HR Recruitment',5e6,1e7],['Hamza','Hand & Power Tools',6e6,6e7],['Sampath Kumar','Courier Services',2.5e6,7.5e6],['Sakthivel','App Development',1.5e6,5.5e6]]
function mk() {
  const users = [{ id: 1, name: 'Chapter President', email: 'admin@bni.demo', pw: 'demo123', role: 'sa', team: null, cat: 'Chapter leadership', bni: 0, turn: 0 }]
  P.forEach((p, i) => users.push({ id: i + 2, name: p[0], email: i === 0 ? 'head@bni.demo' : p[0] === 'Sakthivel' ? 'member@bni.demo' : p[0].split(' ')[0].toLowerCase() + '@bni.demo', pw: 'demo123', role: i === 0 ? 'th' : 'mb', team: 1, cat: p[1], bni: p[2], turn: p[3] }))
  const id = n => users.find(u => u.name.startsWith(n)).id, d = '28-Oct-2026'
  const refs = [['Sampath','Santhosh','Risha Industries'],['Sampath','Santhosh','SPIC'],['Sampath','Ramya','Saint Gobain'],['Krishna','Sivaganesh','Daimler India'],['Krishna','Shivshankar','Haritha Solutions'],['Krishna','Shivshankar','Pradeep wire contractor'],['Krishna','Shivshankar','Anandkumar contractor'],['Ramya','Krishna','Anvith Industries'],['Sivaganesh','Santhosh','Violin Tech']].map(a => ({ f: id(a[0]), to: id(a[1]), co: a[2], st: 'Passed', d }))
  const refs14 = [['Shivshankar','Krishna'],['Shivshankar','Abhay'],['Sivaganesh','Abhay'],['Sivaganesh','Krishna']].map(a => ({ f: id(a[0]), to: id(a[1]), co: '', st: 'Passed', d: '14-Nov-2026' }))
  refs.push(...refs14)
  const ones = [['Abhay','Sakthivel'],['Abhay','Sampath'],['Sampath','Abhay'],['Sampath','Krishna'],['Sampath','Sakthivel'],['Sakthivel','Sivaganesh'],['Sakthivel','Abhay'],['Sakthivel','Sampath'],['Sakthivel','Krishna'],['Sakthivel','Ramya'],['Krishna','Sakthivel'],['Ramya','Sakthivel'],['Sivaganesh','Sakthivel']].map(a => ({ f: id(a[0]), to: id(a[1]), d }))
  ones.push({ f: id('Sakthivel'), to: id('Krishna'), d: '14-Nov-2026' }, { f: id('Krishna'), to: id('Sakthivel'), d: '14-Nov-2026' })
  const notes = [
    { d, g: id('Krishna'), to: id('Shiv'), src: 'Direct referral', det: 'TN Edible Oil, repeat business', v: 116796, st: 2 },
    { d: '14-Nov-2026', g: id('Abhay'), to: id('Shiv'), src: 'Direct referral', det: '', v: 57855, st: 2 },
    { d: '14-Nov-2026', g: id('Santhosh'), to: id('Shiv'), src: 'Direct referral', det: '', v: 97350, st: 2 },
    { d: '14-Nov-2026', g: id('Shiv'), to: id('Abhay'), src: 'Direct referral', det: '', v: 575, st: 2 },
    { d: '14-Nov-2026', g: id('Sivaganesh'), to: id('Krishna'), src: 'Direct referral', det: '', v: 3000, st: 2 }]
  const mt = (d, s) => ({ d, s: Object.fromEntries([...s].map((c, i) => [i + 2, c])) })

  // --- NEW: Default slogans mapping ---
  const defaultSlogans = {
    1: "Building value through trusted supply chains.",
    2: "Creating places where communities thrive.",
    3: "Connecting care with healthier lives.",
    4: "Turning trusted advice into lasting prosperity.",
    5: "Bringing people together through great experiences.",
    6: "Inspiring growth through knowledge and learning.",
    7: "Making tomorrow work better with technology.",
    8: "Engineering ideas into lasting impact.",
    9: "Connecting brands with everyday consumers.",
    10: "Amplifying your message to the right audience.",
    11: "Protecting what matters most to your business.",
    12: "Moving your business forward, on time."
  };

  // --- UPDATED return statement to include default teamDetails ---
  return { 
    users, 
    refs, 
    ones, 
    notes, 
    meets: [mt('14-Oct-2026', 'PPPAPAAPP'), mt('28-Oct-2026', 'PAPAPPAPP'), mt('14-Nov-2026', 'PAPPPAAAP')], 
    teamSchedules: {}, 
    fridayEntries: [], 
    teamDetails: Object.fromEntries(TEAMS.map((name, i) => [i + 1, { name, logo: '', quote: defaultSlogans[i + 1] }])),
    ...seedExtras(id) 
  }
}
let db; try { db = JSON.parse(localStorage.getItem(KEY)) } catch {}
const base = mk(); db = db || base
for (const k of ['opps', 'connects', 'moms', 'acts']) if (!db[k]) db[k] = base[k]
if (!db.teamSchedules) db.teamSchedules = {}
if (!Array.isArray(db.fridayEntries)) db.fridayEntries = []
db.teamDetails = db.teamDetails || {}
const customTeamIds = Object.keys(db.teamDetails).map(Number).filter(id => Number.isInteger(id) && id > 0)
while (TEAMS.length < Math.max(12, ...customTeamIds)) {
  const id = TEAMS.length + 1
  TEAMS.push(db.teamDetails[id] && db.teamDetails[id].name || `Power Team ${id}`)
}
customTeamIds.forEach(id => {
  if (db.teamDetails[id] && db.teamDetails[id].name) TEAMS[id - 1] = db.teamDetails[id].name
})
db.users.forEach(u => { if (u.turn == null) u.turn = (base.users.find(b => b.id === u.id && b.name === u.name) || {}).turn || 0 })
let uid = Number(sessionStorage.getItem('bni-uid')) || null
const subs = new Set(), ping = () => subs.forEach(f => f())
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch {} ping() }
export const useDB = () => { const [, t] = useState(0); useEffect(() => { const f = () => t(x => x + 1); subs.add(f); return () => subs.delete(f) }, []); return db }
export const resetDemo = () => { db = mk(); save() }
export const me = () => db.users.find(u => u.id === uid)
export const U = id => db.users.find(u => u.id == id)
export const goalOf = u => u.bni * 0.67
export const won = id => db.notes.filter(n => n.st === 2 && n.g == id).reduce((a, n) => a + n.v, 0)
export const rv = id => db.notes.filter(n => n.st === 2 && n.to == id).reduce((a, n) => a + n.v, 0)
export const att = id => { const m = db.meets.filter(x => id in x.s); return m.length ? m.filter(x => x.s[id] === 'P').length / m.length * 100 : null }
export const teamUsers = t => db.users.filter(u => u.team == t)
export const headOf = t => db.users.find(u => u.role === 'th' && u.team == t)
export const teamDetails = id => db.teamDetails[id] || { name: TEAMS[id - 1] || '', logo: '', quote: '' }
export function addTeamDetails(form) {
  const by = me()
  const name = form.name.trim(), quote = form.quote.trim()
  if (!by || by.role !== 'sa') return 'Only a Super Admin can add a power team.'
  if (!name || !quote) return 'Enter a team name and slogan.'
  if (TEAMS.some(team => team.toLowerCase() === name.toLowerCase())) return 'That team name already exists.'
  const id = TEAMS.length + 1
  db.teamDetails[id] = { name, logo: form.logo.trim(), quote }
  TEAMS.push(name)
  save()
  return ''
}
export const pc = (w, g) => (g ? w / g * 100 : 0)
export const canRef = r => { const b = me(); return b.role === 'sa' || r.to == b.id || (b.role === 'th' && U(r.f).team == b.team) }
const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
export function login(e, p) { const u = db.users.find(x => x.email === e.trim().toLowerCase() && x.pw === p); if (!u) return false; uid = u.id; sessionStorage.setItem('bni-uid', u.id); ping(); return true }
export function logout() { uid = null; sessionStorage.removeItem('bni-uid'); ping() }
// Super Admin registers Power Team Coordinators; Coordinators register Members.
export function register(f) {
  const by = me(), e = f.email.trim().toLowerCase()
  if (!f.name.trim() || !e.includes('@') || f.pw.length < 6) return 'Enter a name, a valid email and a password of 6+ characters.'
  if (db.users.some(u => u.email === e)) return 'That email is already registered.'
  let role, team
  if (by.role === 'sa') { role = 'th'; team = +f.team; if (!team || headOf(team)) return 'Choose a power team that has no coordinator yet.' }
  else if (by.role === 'th') { role = 'mb'; team = by.team }
  else return 'Only a Super Admin or Power Team Coordinator can register people.'
  db.users.push({ id: Math.max(...db.users.map(u => u.id)) + 1, name: f.name.trim(), email: e, pw: f.pw, role, team, cat: f.cat.trim() || 'Not set', bni: 0, turn: 0 })
  save(); return ''
}
export function setGoal(id, v) { const u = U(id), b = me(); if (b.role === 'sa' || (b.role === 'th' && u.team == b.team)) { u.bni = +v || 0; save() } }
export const addRef = r => { db.refs.push({ st: 'Passed', d: today(), ...r }); save() }
export const setRef = (r, st) => { r.st = st; save() }
export const addOne = (f, to, d) => { db.ones.push({ f, to, d: d || today() }); save() }
export const addNote = n => { db.notes.unshift({ ...n, d: today(), st: 0 }); save() }
export function advance(n) { if (n.st === 0 && !n.v) return 'Add a value first: notes without a value can’t be confirmed.'; n.st++; save(); return '' }

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const fmtD = iso => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}-${MONTHS[+m - 1]}-${y}` }
export const toIso = s => { if (!s) return ''; const [d, m, y] = s.split('-'), i = MONTHS.indexOf(m); return i < 0 ? '' : `${y}-${String(i + 1).padStart(2, '0')}-${d.padStart(2, '0')}` }
export const isoToday = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}` }
export const dv = s => { const [d, m, y] = (s || '').split('-'); return new Date(+y, MONTHS.indexOf(m), +d).getTime() || 0 }
export const fridayWeek = (date = new Date()) => {
  const friday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = friday.getDay()
  friday.setDate(friday.getDate() + (day === 6 ? -1 : day === 0 ? -2 : 5 - day))
  return `${friday.getFullYear()}-${String(friday.getMonth() + 1).padStart(2, '0')}-${String(friday.getDate()).padStart(2, '0')}`
}
export const scope = u => u.role === 'sa' ? db.users.filter(x => x.role !== 'sa') : teamUsers(u.team)
export const canManage = (u, x) => !!x && (u.role === 'sa' || (u.role === 'th' && x.team === u.team))
export const setTurn = (id, v) => { const u = U(id), b = me(); if (canManage(b, u)) { u.turn = +v || 0; save() } }
const nid = list => Math.max(0, ...list.map(x => x.id)) + 1
export function addOpp(o) {
  db.opps.push({ id: nid(db.opps), ...o })
  String(o.ask || '').split(';').map(s => s.trim()).filter(Boolean).forEach(t => {
    if (!db.connects.some(c => c.d === o.d && c.f === o.m && c.t.toLowerCase() === t.toLowerCase()))
      db.connects.push({ id: nid(db.connects), d: o.d, f: o.m, t, cp: '', ask: '', ow: o.ow || null, st: 'Requested', intro: '', won: 0 })
  })
  save()
}
export const delOpp = o => { db.opps = db.opps.filter(x => x !== o); save() }
export function addConnect(c) {
  const by = me(), member = U(c.f)
  if (!by || !member) return 'Choose a valid requesting member.'
  if (by.role === 'mb' && member.id !== by.id) return 'Members can add specific connects only for themselves.'
  if (by.role === 'th' && member.team !== by.team) return 'Choose a member from your Power Team.'
  db.connects.push({ id: nid(db.connects), st: 'Requested', intro: '', won: 0, ow: null, cp: '', ask: '', ...c })
  save()
  return ''
}
export const updConnect = (c, patch) => { Object.assign(c, patch); save() }
export function addMeeting(d, s) { const m = db.meets.find(x => x.d === d); if (m) m.s = { ...m.s, ...s }; else db.meets.push({ d, s }); db.meets.sort((a, b) => dv(a.d) - dv(b.d)); save() }
export const addAct = a => { db.acts.push({ id: nid(db.acts), ...a }); save() }
export const addMom = m => { db.moms.push(m); db.moms.sort((a, b) => a.no - b.no); save() }
export const updMom = (no, m) => { const i = db.moms.findIndex(x => x.no === no); if (i >= 0) db.moms[i] = m; db.moms.sort((a, b) => a.no - b.no); save() }
export const teamSchedule = team => db.teamSchedules[team] || null
export function saveTeamSchedule(team, schedule) {
  const by = me()
  if (!by || !(by.role === 'sa' || (by.role === 'th' && by.team === +team))) return 'Only the Super Admin or that Power Team’s Coordinator can schedule its meeting.'
  if (!TEAMS[+team - 1]) return 'Choose a valid Power Team.'
  if (!schedule.d || !schedule.t || !schedule.venue.trim()) return 'Enter the meeting date, time and venue.'
  db.teamSchedules[team] = { d: schedule.d, t: schedule.t, venue: schedule.venue.trim(), by: by.id }
  save()
  return ''
}
export function saveBusinessNetworkEntry({ give, ask }) {
  const by = me()
  if (!by || by.role === 'sa') return 'Sign in as a Power Team member or Coordinator to submit a Business Network entry.'
  if (!give.trim() || !ask.trim()) return 'Enter both your Specific Give and Specific Ask.'
  const week = fridayWeek()
  const existing = db.fridayEntries.find(entry => entry.member === by.id && entry.week === week)
  if (existing) Object.assign(existing, { give: give.trim(), ask: ask.trim() })
  else db.fridayEntries.push({ id: nid(db.fridayEntries), sno: nid(db.fridayEntries), week, member: by.id, give: give.trim(), ask: ask.trim() })
  save()
  return ''
}
// Members see the same pages as their Team Head Coordinator (own team only) but read-only,
// except Referrals and Joint Calls where they can add their own records.
export const teamStats = t => {
  const us = teamUsers(t), ids = us.map(x => x.id)
  return {
    members: us.length,
    refs: db.refs.filter(r => ids.includes(r.f)).length,
    joint: db.acts.filter(a => a.t === 'Joint call' && ids.includes(a.f)).length,
    ones: db.ones.filter(o => ids.includes(o.f)).length,
    business: us.reduce((a, x) => a + won(x.id), 0),
    goal: us.reduce((a, x) => a + goalOf(x), 0),
    att: us.length ? us.reduce((a, x) => a + (att(x.id) || 0), 0) / us.length : 0,
  }
}
export const fm = v => v >= 1e7 ? `₹${(v / 1e7).toFixed(2)} Cr` : v >= 1e5 ? `₹${(v / 1e5).toFixed(2)} L` : `₹${Math.round(v).toLocaleString('en-IN')}`