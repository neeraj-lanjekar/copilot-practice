import { useEffect, useState } from 'react'
import { API_BASE_URL, normalizeCollection } from '../api.js'
import CollectionTable from './CollectionTable.jsx'

function Activities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadActivities() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/activities/`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Unable to load activities (${response.status}).`)
        setActivities(normalizeCollection(await response.json()))
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadActivities()
    return () => controller.abort()
  }, [])

  const columns = [
    { label: 'Activity', value: (row) => row.type },
    { label: 'User', value: (row) => row.user?.displayName ?? row.user?.username ?? row.user },
    { label: 'Duration', value: (row) => `${row.durationMinutes} min` },
    { label: 'Calories', value: (row) => row.caloriesBurned },
    {
      label: 'Logged',
      value: (row) => row.loggedAt ? new Date(row.loggedAt).toLocaleDateString() : '—',
    },
  ]

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Move every day</p>
        <h1>Activities</h1>
        <p className="page-description">Recent activity logged by the OctoFit community.</p>
      </div>
      <CollectionTable columns={columns} error={error} loading={loading} rows={activities} />
    </section>
  )
}

export default Activities
