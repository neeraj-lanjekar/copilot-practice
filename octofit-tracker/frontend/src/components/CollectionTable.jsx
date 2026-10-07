function CollectionTable({ columns, error, loading, rows }) {
  if (loading) {
    return (
      <div className="alert alert-info" role="status">
        Loading data…
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  if (rows.length === 0) {
    return <div className="empty-state">No records found yet.</div>
  }

  return (
    <div className="table-responsive data-table-wrap">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            {columns.map(({ label }) => <th key={label} scope="col">{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id ?? row.id ?? index}>
              {columns.map(({ label, value }) => (
                <td key={label}>{value(row) ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CollectionTable
