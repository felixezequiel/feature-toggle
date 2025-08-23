import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'
import { FeatureFlag } from './featureFlag'

const Navbar = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🚀 Feature Flag POC
        </Link>

        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>

          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>

          <Link
            to="/feature-flags"
            className={`nav-link ${isActive('/feature-flags') ? 'active' : ''}`}
          >
            Feature Flags
          </Link>
        </div>

        {/* Feature flag para mostrar/ocultar elementos da navbar */}
        <FeatureFlag
          featureName='advanced-navbar'
          variant='advanced'
          fallback={
            <div className="navbar-advanced">
              <span className="advanced-badge">✨ Advanced Disabled</span>
            </div>
          }
        >
          <div className="navbar-advanced">
            <span className="advanced-badge">✨ Advanced Enabled</span>
          </div>
        </FeatureFlag>
      </div>
    </nav>
  )
}

export default Navbar
