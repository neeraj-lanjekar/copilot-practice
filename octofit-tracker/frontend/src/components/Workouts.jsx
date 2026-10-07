import { useEffect, useState } from 'react'
import { API_BASE_URL, normalizeCollection } from '../api.js'
import CollectionTable from './CollectionTable.jsx'

function Workouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadWorkouts() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/workouts/`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Unable to load workouts (${response.status}).`)
        setWorkouts(normalizeCollection(await response.json()))
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadWorkouts()
    return () => controller.abort()
  }, [])

  const columns = [
    { label: 'Workout', value: (row) => row.title },
    { label: 'Category', value: (row) => row.category },
    { label: 'Duration', value: (row) => `${row.durationMinutes} min` },
    { label: 'Difficulty', value: (row) => row.difficulty },
    { label: 'Details', value: (row) => row.description },
  ]

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Find your next challenge</p>
        <h1>Workouts</h1>
        <p className="page-description">Workout ideas for every level and training style.</p>
      </div>
      <CollectionTable columns={columns} error={error} loading={loading} rows={workouts} />
    </section>
  )
}

export default Workouts
