import { useState, useEffect } from 'react'
import Icon from './icons'
export { fm } from './store'

export const Pill = ({ c = 'n', children }) => <span className={`pill pill-${c}`}>{children}</span>

// --- UPDATED: Tile Component (Safe fallback, full width utilization) ---
export const Tile = ({ label, value, icon }) => (
  <div className="card tile" style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', padding: '20px' }}>
    <div className="tile-icon" style={{ background: '#fff1f3', color: 'var(--bni-red)', width: '48px', height: '48px', borderRadius: '12px', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid #fbd0d6' }}>
      {/* Fallback to 'dashboard' icon if the passed icon doesn't exist in your library */}
      <Icon name={icon || 'dashboard'} size={22} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div className="tile-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div className="tile-value">{value}</div>
    </div>
  </div>
)

// --- UPDATED: Tiles Component (Fills the whole width using 4 columns) ---
export const Tiles = ({ items }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full">
    {items.map(([l, v, icon]) => <Tile key={l} label={l} value={v} icon={icon} />)}
  </div>
)

// --- Pagination Component ---
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null

  const from = (currentPage - 1) * itemsPerPage + 1
  const to = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing <b>{from}</b> to <b>{to}</b> of <b>{totalItems}</b> entries
      </span>
      <div className="pagination-controls">
        <button type="button" className="page-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
          <Icon name="chevron-left" size={16} />
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
          if (totalPages > 7 && page !== 1 && page !== totalPages && (page < currentPage - 1 || page > currentPage + 1)) {
            if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="page-dots">...</span>
            return null
          }
          return (
            <button key={page} type="button" className={`page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => onPageChange(page)}>
              {page}
            </button>
          )
        })}

        <button type="button" className="page-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  )
}

// --- Table Component with built-in pagination ---
export const Table = ({ head, rows, itemsPerPage = 10 }) => {
  const [page, setPage] = useState(1)
  
  // Reset to page 1 whenever the rows data changes (e.g. user types in a search bar)
  useEffect(() => { setPage(1) }, [rows.length])

  const totalItems = rows.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="card !p-0 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr>{head.map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>
            {currentRows.length ? currentRows : (
              <tr>
                <td className="td empty-cell" colSpan={head.length}>
                  <div className="empty-block"><span className="empty-ico"><Icon name="inbox" size={26} /></span><b>Nothing here yet</b><span>Records you add or that match your filters will appear here.</span></div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* If you have more than 'itemsPerPage' rows, pagination will show automatically */}
      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
        totalItems={totalItems} 
        itemsPerPage={itemsPerPage} 
      />
    </div>
  )
}

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

export function PageHead({ eyebrow, title, action }) { 
  return <div className="module-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
    </div>
    {action}
  </div> 
}