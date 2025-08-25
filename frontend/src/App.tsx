import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import FeatureFlagEvents from './pages/FeatureFlagEvents'

import './App.css'
import { FlagProvider } from '@unleash/proxy-client-react'

function App() {
  return (
    <FlagProvider
      config={{
        url: import.meta.env.VITE_UNLEASH_URL,
        appName: import.meta.env.VITE_UNLEASH_APP_NAME,
        environment: import.meta.env.VITE_UNLEASH_ENVIRONMENT,
        clientKey: import.meta.env.VITE_UNLEASH_CLIENT_KEY,
        refreshInterval: 15,
        metricsInterval: 30,
        context: {
          userId: '987',
        }
      }}
    >
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<FeatureFlagEvents />} />
          </Routes>
        </main>
      </div>
    </FlagProvider>
  )
}

export default App
