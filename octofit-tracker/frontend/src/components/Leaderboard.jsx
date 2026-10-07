import { useEffect, useState } from 'react'
import { API_BASE_URL, normalizeCollection } from '../api.js'
import CollectionTable from './CollectionTable.jsx'

function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadLeaderboard() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leaderboard/`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Unable to load leaderboard (${response.status}).`)
        setEntries(normalizeCollection(await response.json()))
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadLeaderboard()
    return () => controller.abort()
  }, [])

  const columns = [
    { label: 'Athlete', value: (row) => row.user?.displayName ?? row.user?.username ?? row.user },
    { label: 'Team', value: (row) => row.team?.name ?? row.team },
    { label: 'Period', value: (row) => row.period },
    { label: 'Points', value: (row) => row.points },
  ]

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Celebrate the effort</p>
        <h1>Leaderboard</h1>
        <p className="page-description">See how members and teams are progressing.</p>
      </div>
      <CollectionTable columns={columns} error={error} loading={loading} rows={entries} />
    </section>
  )
}

export default Leaderboard
