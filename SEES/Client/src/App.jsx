import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EventDetails from './pages/EventDetails.jsx'
import CreateEvent from './pages/CreateEvent'

// Components
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)

  return (
    <Router>
      <div className="app-container">
        <Header user={user} setUser={setUser} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/events/:id" element={<EventDetails user={user} />} />
            <Route path="/create-event" element={<CreateEvent user={user} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
