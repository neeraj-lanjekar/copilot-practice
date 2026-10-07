import { useEffect, useState } from 'react'
import { API_BASE_URL, normalizeCollection } from '../api.js'
import CollectionTable from './CollectionTable.jsx'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Unable to load users (${response.status}).`)
        setUsers(normalizeCollection(await response.json()))
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadUsers()
    return () => controller.abort()
  }, [])

  const columns = [
    { label: 'Name', value: (row) => row.displayName ?? row.username },
    { label: 'Username', value: (row) => row.username },
    { label: 'Email', value: (row) => row.email },
  ]

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Meet the community</p>
        <h1>Users</h1>
        <p className="page-description">OctoFit members and their profiles.</p>
      </div>
      <CollectionTable columns={columns} error={error} loading={loading} rows={users} />
    </section>
  )
}

export default Users
