import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      gap: '20px',
      padding: '1rem 2rem',
      backgroundColor: '#9e568c',
      color: 'white',
      alignItems: 'center'
    }}>
      <h2 style={{ margin: 0, marginRight: 'auto' }}>🎬 CineApp</h2>
      <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Inicio</Link>
      <Link to="/peliculas" style={{ color: 'white', textDecoration: 'none' }}>Peliculas</Link>
      <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>
    </nav>
  )
}