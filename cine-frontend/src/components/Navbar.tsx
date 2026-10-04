/* import { Link } from 'react-router-dom'

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
} */

  // src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  // Leemos el usuario del localStorage
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
    // Recargamos para que el navbar se actualice
    window.location.reload();
  }

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#9b59b6', color: 'white' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          🎬 CineApp
        </Link>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Inicio</Link>
        <Link to="/peliculas" style={{ color: 'white', textDecoration: 'none' }}>Peliculas</Link>
        <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>
      </div>

      <div>
        {usuario ? (
          <>
            <span style={{ marginRight: '15px' }}>👤 {usuario.email}</span>
            <button onClick={cerrarSesion} style={{ cursor: 'pointer', padding: '5px 10px' }}>
              Cerrar Sesión
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
}