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
import Payment from './pages/Payment';
import AdminPanel from './pages/AdminPanel';
import PromoterPanel from './pages/PromoterPanel';
import AdminAnalytics from './pages/AdminAnalytics'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import EditEvent from "./components/EditEvent";
import PaymentPage from './pages/PaymentPage.jsx';
import PromotionOptions from './pages/PromotionOptions';
import QAChatbot from './components/QAChatbot';
import OpportunityHub from './pages/OpportunityHub';

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
  <Route 
    path="/payment/:eventId" 
    element={
      <ProtectedRoute 
        element={<Payment user={user} />} 
        user={user} 
      />
    } 
  />
   <Route 
    path="/admin/dashboard" 
    element={
      <ProtectedRoute 
        element={<AdminPanel user={user} />} 
        user={user} 
        requiredRole="admin" 
      />
    } 
  />
   <Route 
    path="/promoter/dashboard" 
    element={
      <ProtectedRoute 
        element={<PromoterPanel user={user} />} 
        user={user} 
        requiredRole="promoter" 
      />
    } 
  />
  <Route 
  path="/edit-event/:id" 
  element={
    <ProtectedRoute 
      element={<EditEvent user={user} />} 
      user={user} 
      requiredRole="admin" 
    />
  } 
/>
<Route 
  path="/payment/:type/:id" 
  element={
    <ProtectedRoute 
      element={<PaymentPage user={user} />} 
      user={user} 
    />
  } 
/>
<Route 
  path="/promotion-options/:id" 
  element={
    <ProtectedRoute 
      element={<PromotionOptions user={user} />} 
      user={user} 
    />
  } 
/>
<Route 
  path="/admin/analytics" 
  element={
    <ProtectedRoute 
      element={<AdminAnalytics user={user} />} 
      user={user} 
      requiredRole="admin" 
    />
  } 
/>
<Route 
  path="/opportunity-hub" 
  element={
    <ProtectedRoute 
      element={<OpportunityHub user={user} />} 
      user={user} 
    />
  } 
/>
          </Routes>
        </main>
        <Footer />
          {location.pathname !== '/payment' && <QAChatbot />}
      </div>
    </Router>
  )
}

export default App
