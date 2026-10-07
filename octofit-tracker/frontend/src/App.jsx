import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Activities from './components/Activities.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Teams from './components/Teams.jsx'
import Users from './components/Users.jsx'
import Workouts from './components/Workouts.jsx'
import logo from '../../../docs/octofitapp-small.png'
import './App.css'

const navigation = [
  { label: 'Activities', path: '/activities' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Teams', path: '/teams' },
  { label: 'Users', path: '/users' },
  { label: 'Workouts', path: '/workouts' },
]

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="brand" to="/activities" aria-label="OctoFit Tracker home">
          <img src={logo} alt="" className="brand-logo" />
          <span>OctoFit Tracker</span>
        </Link>
        <nav className="nav nav-pills" aria-label="Main navigation">
          {navigation.map(({ label, path }) => (
            <Link className="nav-link" key={path} to={path}>
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="container-fluid app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/activities" replace />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/users" element={<Users />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="*" element={<Navigate to="/activities" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">Build healthy habits, one activity at a time.</footer>
    </div>
  )
}

export default App
