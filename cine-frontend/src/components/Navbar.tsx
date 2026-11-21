import { useState, type FormEvent } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; 
import { getGeneros } from '../services/generosServices';
import { obtenerUsuarioDesdeToken } from '../utils/auth.ts';
import '../components/Navbar.css';


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [busqueda, setBusqueda] = useState('');
  const [mostrarInfo, setMostrarInfo] = useState(false); 

  // Leemos el usuario con el token
  const usuario = obtenerUsuarioDesdeToken();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [generoSeleccionado, setGeneroSeleccionado] = useState(''); 

  const rutasSinBuscador = [
    '/peliculas',
    '/login',
    '/miscompras',
    '/admin',
    '/compra',
    '/admin/funciones',
    '/admin/peliculas',
    '/admin/salas',
    '/admin/compras',
    '/admin/generos', 
  ];
  const ocultarBuscador = rutasSinBuscador.includes(location.pathname);

  //  Géneros cacheados con TanStack Query 
  const { data: generos = [] } = useQuery({
    queryKey: ['generos'],
    queryFn: getGeneros,
    staleTime: 1000 * 60 * 15,
  });

  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
    window.location.reload();
  }

  function handleBuscar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busqueda.trim() || generoSeleccionado) {
      navigate('/peliculas', {
        state: {
          busquedaInicial: busqueda.trim(),
          generoInicial: generoSeleccionado,
        },
      });
    }
  }

  return (
    <>
      <nav className="navbar-container">

        {/* Lado Izquierdo: Logo, Inicio, Más Info y Admin */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img
              src="/logo.png"
              alt="Logo New Cine"
              className="navbar-logo-img"
            />
            <span className="navbar-logo-text">Cine</span>
          </Link>

          <Link to="/" className="navbar-link">
            Inicio
          </Link>

          <button
            onClick={() => setMostrarInfo(true)}
            className="navbar-btn-info"
          >
            Más info
          </button>

          {usuario?.rol === 'ADMIN' && (
            <Link to="/admin" className="navbar-link-admin">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-cog preview-icon"><path d="M10 15H6a4 4 0 0 0-4 4v2"/><path d="m14.305 16.53.923-.382"/><path d="m15.228 13.852-.923-.383"/><path d="m16.852 12.228-.383-.923"/><path d="m16.852 17.772-.383.924"/><path d="m19.148 12.228.383-.923"/><path d="m19.53 18.696-.382-.924"/><path d="m20.772 13.852.924-.383"/><path d="m20.772 16.148.924.383"/><circle cx="18" cy="15" r="3"/><circle cx="9" cy="7" r="4"/></svg> Admin
            </Link>
          )}
        </div>

        {/* CENTRO: BARRA DE BÚSQUEDA CONDICIONAL */}
        {!ocultarBuscador && (
          <form onSubmit={handleBuscar} className="navbar-form">
            <select
              value={generoSeleccionado}
              onChange={(e) => setGeneroSeleccionado(e.target.value)}
              className="navbar-select-genero"
            >
              <option value="" className="navbar-select-option">Todos los géneros</option>
              {generos.map((genero) => (
                <option key={genero.CodGenero} value={genero.CodGenero} className="navbar-select-option">
                  {genero.NombreGenero}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Buscar película..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="navbar-input-busqueda"
            />

            <button type="submit" className="navbar-btn-buscar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        )}

        {/* Lado Derecho: Usuario / Login */}
        <div className="navbar-user-section">
          {usuario ? (
            <>
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="navbar-user-btn"
              >
                <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round preview-icon"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg></span>
                <span>{(usuario.email ? usuario.email.split('@')[0] : 'Usuario')}</span>
                <span style={{ fontSize: '0.7rem', color: '#888' }}>▼</span>
              </button>

              {menuAbierto && (
                <div className="navbar-user-dropdown">
                  <p className="navbar-dropdown-header">
                    Sesión iniciada como:<br/>
                    <strong className="navbar-dropdown-strong">{usuario.email}</strong>
                  </p>

                  <div onClick={() => { setMenuAbierto(false); navigate('/miscompras'); }} className="navbar-dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ticket preview-icon"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg> Mis Compras
                  </div>

                  <div className="navbar-dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings preview-icon"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg> Configuración
                  </div>

                  <hr className="navbar-dropdown-divider" />

                  <button
                    onClick={() => { setMenuAbierto(false); cerrarSesion(); }}
                    className="navbar-btn-logout"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="navbar-login-link">
              Iniciar Sesión
            </Link>
          )}
        </div>

      </nav>

      {/* Botón de "Más info" */}
      {mostrarInfo && (
        <div className="navbar-modal-overlay">
          <div className="navbar-modal-content">

            <h2 className="navbar-modal-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-popcorn preview-icon"><path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4"/><path d="M10 22 9 8"/><path d="m14 22 1-14"/><path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z"/></svg> Sobre Nosotros
            </h2>

            <p className="navbar-modal-text">
              Somos Newcine. Disfrutá de la mejor cartelera, las mejores salas y la mejor atención en alta definición.
            </p>
            <p className="navbar-modal-detail">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-check-inside preview-icon"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><path d="m9 10 2 2 4-4"/></svg> Dirección: Boulevard Oroño 1234, Rosario
            </p>
            <p className="navbar-modal-detail-phone">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone preview-icon"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg> Teléfono: 0800-555-CINE
            </p>

            <button
              onClick={() => setMostrarInfo(false)}
              className="navbar-modal-btn-cerrar"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}