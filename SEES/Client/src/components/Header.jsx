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
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/create-event">Create Event</Link>
            <button onClick={handleLogout}>Logout</button>
            <span className="user-greeting">Hello, {user.name}</span>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;