import { useState } from 'react'
import { useDB, U, fm, dv } from '../store'
import { PageHead, Table, Tiles } from '../ui'

export default function TopClients() {
  const db = useDB(), [query, setQuery] = useState('')
  const groups = new Map()
  db.notes.filter(note => note.st === 2).forEach((note, index) => {
    const name = (note.det || '').trim()
    const key = name ? name.toLowerCase() : `not-recorded-${note.d}-${note.g}-${note.to}-${index}`
    const client = groups.get(key) || {
      key,
      name: name || 'Client name not provided',
      value: 0,
      records: 0,
      latest: note.d,
      members: new Set(),
    }
    client.value += +note.v || 0
    client.records += 1
    if (dv(note.d) > dv(client.latest)) client.latest = note.d
    client.members.add(U(note.to)?.name || 'Unknown member')
    groups.set(key, client)
  })
  const clients = [...groups.values()].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
  const total = clients.reduce((sum, client) => sum + client.value, 0)
  const filtered = clients.filter(client => `${client.name} ${[...client.members].join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()))

  return <>
    <PageHead eyebrow="BUSINESS INSIGHTS" title="Top Clients"
      sub="Rank confirmed business records by client details and value. This page is available only to the Super Admin." />
    <Tiles items={[['Clients / records', clients.length], ['Confirmed business', fm(total)], ['Search results', filtered.length]]} />
    <div className="card filter-row mt-4">
      <input className="inp" type="search" placeholder="Search client companies as you type..." value={query} onChange={event => setQuery(event.target.value)} />
      <span className="filter-count">{filtered.length} results</span>
    </div>
    <Table head={['Rank', 'Client / business details', 'Business value', 'Records', 'Latest business', 'Member']}
      rows={filtered.map((client, index) => <tr key={client.key}>
        <td className="td">{index + 1}</td><td className="td font-semibold !whitespace-normal min-w-[220px]">{client.name}</td>
        <td className="td">{fm(client.value)}</td><td className="td">{client.records}</td><td className="td">{client.latest}</td>
        <td className="td !whitespace-normal">{[...client.members].join(', ')}</td>
      </tr>)} />
  </>
}
