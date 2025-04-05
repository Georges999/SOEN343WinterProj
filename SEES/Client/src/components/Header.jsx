import { Link } from 'react-router-dom';

function Header({ user, setUser }) {
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">SEES</Link>
      </div>
      
      <nav className="nav">
        {/* Only show Home link when user is NOT logged in */}
        {!user && <Link to="/">Home</Link>}
        
        {!user ? (
          // Links for guests
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : user.role === 'admin' ? (
          // Links for admin users
          <>
            <Link to="/admin/dashboard">Admin Dashboard</Link>
            <Link to="/create-event">Create Event</Link>
            <button onClick={handleLogout}>Logout</button>
            <span className="user-greeting">Hello, {user.name}</span>
          </>
        ) : user.role === 'promoter' ? (
          // Links for promoter users
          <>
            <Link to="/promoter/dashboard">Promoter Dashboard</Link>
            <button onClick={handleLogout}>Logout</button>
            <span className="user-greeting">Hello, {user.name}</span>
          </>
        ) : (
          // Links for regular client users
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/opportunity-hub">Opportunity Hub</Link>
            <button onClick={handleLogout}>Logout</button>
            <span className="user-greeting">Hello, {user.name}</span>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;