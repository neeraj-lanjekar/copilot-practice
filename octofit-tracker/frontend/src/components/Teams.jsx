import { useEffect, useState } from 'react'
import { API_BASE_URL, normalizeCollection } from '../api.js'
import CollectionTable from './CollectionTable.jsx'

function Teams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadTeams() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/teams/`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Unable to load teams (${response.status}).`)
        setTeams(normalizeCollection(await response.json()))
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadTeams()
    return () => controller.abort()
  }, [])

  const columns = [
    { label: 'Team', value: (row) => row.name },
    { label: 'Description', value: (row) => row.description },
    {
      label: 'Members',
      value: (row) => Array.isArray(row.members)
        ? row.members.map((member) => member.displayName ?? member.username ?? member).join(', ')
        : '—',
    },
  ]

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Stronger together</p>
        <h1>Teams</h1>
        <p className="page-description">Find the community teams moving toward their goals.</p>
      </div>
      <CollectionTable columns={columns} error={error} loading={loading} rows={teams} />
    </section>
  )
}

export default Teams
