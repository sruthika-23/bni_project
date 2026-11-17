import { useMemo, useState } from 'react'
import Icon from '../icons'
import {
  useDB,
  me,
  scope,
  goalOf,
  fm,
  setGoal,
  setTurn,
  canManage,
} from '../store'

const GoalCard = ({ title, value, icon, detail }) => (
  <article className="goal-kpi">
    <span className="goal-kpi-icon"><Icon name={icon} size={20} /></span>
    <div className="goal-kpi-copy">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  </article>
)

const Edit = ({ value, readOnly, onSave }) => readOnly ? (
  <span className="goal-readonly">{fm(value || 0)}</span>
) : (
  <input
    key={value}
    className="inp goal-edit"
    type="number"
    min="0"
    step="any"
    defaultValue={value || 0}
    aria-label="Edit goal amount"
    onBlur={event => {
      const next = Number(event.target.value)
      if (event.target.value !== '' && Number.isFinite(next) && next >= 0 && next !== Number(value || 0)) onSave(next)
    }}
    onKeyDown={event => {
      if (event.key === 'Enter') event.currentTarget.blur()
      if (event.key === 'Escape') {
        event.currentTarget.value = String(value || 0)
        event.currentTarget.blur()
      }
    }}
  />
)

const Avatar = ({ name }) => (
  <span className="goal-avatar" aria-hidden="true">{(name || '?').charAt(0).toUpperCase()}</span>
)

export function GoalsContent() {
  const db = useDB(), u = me(), people = scope(u)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const sum = field => people.reduce((total, person) => total + (Number(field(person)) || 0), 0)
  const totalTurn = sum(person => person.turn)
  const totalBni = sum(person => person.bni)
  const totalPower = sum(goalOf)
  const categories = ['All', ...new Set(people.map(person => person.cat).filter(Boolean))]

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = people.filter(person => {
      const matchesSearch = `${person.name || ''} ${person.cat || ''}`.toLowerCase().includes(query)
      return matchesSearch && (category === 'All' || person.cat === category)
    })
    return result.sort((a, b) => {
      if (sortBy === 'turn') return (Number(b.turn) || 0) - (Number(a.turn) || 0)
      if (sortBy === 'bni') return (Number(b.bni) || 0) - (Number(a.bni) || 0)
      return (a.name || '').localeCompare(b.name || '')
    })
  }, [people, search, category, sortBy])

  return <div className="goals-content">
    <div className="goals-summary">
      <GoalCard title="6-Month Turnover Goal" value={fm(totalTurn)} icon="trend" detail="Team turnover target" />
      <GoalCard title="BNI Business Goal" value={fm(totalBni)} icon="rupee" detail="Member business targets" />
      <GoalCard title="Power Team Goal" value={fm(totalPower)} icon="target" detail="67% of BNI goals" />
      <GoalCard title="Total Members" value={people.length} icon="users" detail="Members in this team" />
    </div>

    <section className="card goal-period">
      <span className="goal-period-icon"><Icon name="calcheck" size={20} /></span>
      <div>
        <b>Target period: 1 Oct 2026 – 31 Mar 2027</b>
        <p>Power Team goal is 67% of each member's BNI business goal.</p>
      </div>
      {u.role !== 'mb' && <span className="goal-edit-hint">Edit goals in the table</span>}
    </section>

    <section className="card goal-table-card">
      <div className="goal-table-head">
        <div>
          <h2>Member Goal Overview</h2>
          <span>{filteredPeople.length} of {people.length} members</span>
        </div>
        <div className="goal-filters">
          <input
            type="search"
            className="inp"
            placeholder="Search members..."
            aria-label="Search member goals"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
          <select className="inp" aria-label="Filter by category" value={category} onChange={event => setCategory(event.target.value)}>
            {categories.map(value => <option key={value} value={value}>{value === 'All' ? 'All Categories' : value}</option>)}
          </select>
          <select className="inp" aria-label="Sort member goals" value={sortBy} onChange={event => setSortBy(event.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="turn">Highest Turnover</option>
            <option value="bni">Highest BNI Goal</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="goal-table">
          <thead><tr>
            <th className="th">Member</th>
            <th className="th">Category</th>
            <th className="th">6-Month Turnover Goal</th>
            <th className="th">BNI Business Goal</th>
            <th className="th">Power Team Goal</th>
            <th className="th">Allocation</th>
          </tr></thead>
          <tbody>
            {filteredPeople.map(person => {
              const readOnly = !canManage(u, person)
              const bni = Number(person.bni) || 0
              const power = Number(goalOf(person)) || 0
              const allocation = bni > 0 ? Math.min(100, power / bni * 100) : 0
              return <tr key={person.id}>
                <td className="td"><span className="goal-member"><Avatar name={person.name} /><b>{person.name}</b></span></td>
                <td className="td">{person.cat || '—'}</td>
                <td className="td"><Edit value={person.turn} readOnly={readOnly} onSave={value => setTurn(person.id, value)} /></td>
                <td className="td"><Edit value={person.bni} readOnly={readOnly} onSave={value => setGoal(person.id, value)} /></td>
                <td className="td"><span className="goal-readonly">{fm(power)}</span></td>
                <td className="td"><span className="goal-allocation"><i><b style={{ width: `${allocation}%` }} /></i>{Math.round(allocation)}%</span></td>
              </tr>
            })}
            {filteredPeople.length > 0 && <tr className="goal-total-row">
              <td className="td">TOTAL TEAM GOAL</td>
              <td className="td">{filteredPeople.length} Members</td>
              <td className="td">{fm(filteredPeople.reduce((total, person) => total + (Number(person.turn) || 0), 0))}</td>
              <td className="td">{fm(filteredPeople.reduce((total, person) => total + (Number(person.bni) || 0), 0))}</td>
              <td className="td">{fm(filteredPeople.reduce((total, person) => total + (Number(goalOf(person)) || 0), 0))}</td>
              <td className="td">67%</td>
            </tr>}
            {!filteredPeople.length && <tr><td className="td goal-empty" colSpan="6">
              <Icon name="search" size={22} />
              <b>No members found</b>
              <span>Try changing your search or category filter.</span>
              <button type="button" className="btn-s" onClick={() => { setSearch(''); setCategory('All') }}>Clear filters</button>
            </td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </div>
}
