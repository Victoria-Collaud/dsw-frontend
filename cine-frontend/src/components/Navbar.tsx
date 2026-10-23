import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [mostrarInfo, setMostrarInfo] = useState(false); // Estado para el modal de info

  // Leemos el usuario del localStorage
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  
  const [menuAbierto, setMenuAbierto] = useState(false);

  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
    window.location.reload();
  }

  function handleBuscar(e: FormEvent) {
    e.preventDefault();
    if (busqueda.trim()) {
      // Redirigimos a /peliculas y le pasamos el texto por el state
      navigate('/peliculas', { state: { busquedaInicial: busqueda.trim() } });
      setBusqueda('');
    }
  }

  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#9b59b6', color: 'white', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Lado Izquierdo: Logo e Inicio */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
            🎬 Cine
          </Link>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Inicio</Link>
          
          {/* Botón de Info */}
          <button 
            onClick={() => setMostrarInfo(true)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
          >
            ℹ️ Info
          </button>
        </div>

{usuario?.rol === 'ADMIN' && (
  <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>
    Admin
  </Link>
)}

{/* Centro: Barra de Búsqueda y Mini Filtro Integrado */}
<form onSubmit={handleBuscar} style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '450px', margin: '0 20px', backgroundColor: 'white', borderRadius: '20px', padding: '2px 4px' }}>
  
  {/* Selector de Género Disimulado */}
  <select 
    style={{ 
      padding: '6px 8px', 
      borderRadius: '16px 0 0 16px', 
      border: 'none', 
      outline: 'none', 
      backgroundColor: 'transparent',
      color: '#666',
      cursor: 'pointer',
      fontSize: '0.8rem',
      maxWidth: '120px'
    }}
  >
    <option value="">Género</option>
    <option value="accion">Acción</option>
    <option value="comedia">Comedia</option>
    <option value="terror">Terror</option>
    <option value="drama">Drama</option>
  </select>

  {/* Input de Búsqueda */}
  <input 
    type="text" 
    placeholder="Buscar película..." 
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    style={{ width: '100%', padding: '6px 10px', border: 'none', outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent', color: '#333' }}
  />

  {/* Botón Lupa */}
  <button 
    type="submit" 
    style={{ 
      padding: '6px 12px', 
      backgroundColor: '#7a4691', 
      color: 'white', 
      border: 'none', 
      borderRadius: '16px', 
      cursor: 'pointer',
      fontSize: '0.9rem'
    }}
  >
    🔍
  </button>
</form>

    {/* Lado Derecho: Usuario / Login */}
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {usuario ? (
        <>
          {/* Botón interactivo del perfil */}
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              color: 'white', 
              border: '1px solid rgba(255, 255, 255, 0.3)', 
              padding: '6px 12px', 
              borderRadius: '20px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem'
            }}
          >
            <span>👤</span>
            <span>{ (usuario.EmailUsuario ? usuario.EmailUsuario.split('@')[0] : 'Usuario')}</span>
            <span style={{ fontSize: '0.7rem' }}>▼</span>
          </button>

          {/* Menú desplegable con información extra */}
          {menuAbierto && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              backgroundColor: 'white',
              color: '#333',
              boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              padding: '12px',
              minWidth: '200px',
              zIndex: 100,
              textAlign: 'left'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                Sesión iniciada como:<br/>
                <strong style={{ color: '#000' }}>{usuario.EmailUsuario}</strong>
              </p>
              
              <div style={{ padding: '6px 0', fontSize: '0.9rem', cursor: 'pointer', color: '#333' }}>
                🎟️ Mis Compras
              </div>
              
              <div style={{ padding: '6px 0', fontSize: '0.9rem', cursor: 'pointer', color: '#333' }}>
                ⚙️ Configuración
              </div>

              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #eee' }} />
              
              <button 
                onClick={() => { setMenuAbierto(false); cerrarSesion(); }} 
                style={{ 
                  width: '100%', 
                  background: '#ffe6e6', 
                  color: '#d9534f', 
                  border: 'none', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </>
      ) : (
        <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          Iniciar Sesión
        </Link>
      )}
    </div>
  

      </nav>

{/* Modal de Información */}
{mostrarInfo && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  }}>
    <div style={{ 
      backgroundColor: '#ffffff', 
      padding: '30px', 
      borderRadius: '10px', 
      maxWidth: '400px', 
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
    }}>
      
      {/* ACÁ FORZAMOS EL COLOR OSCURO AL TÍTULO */}
      <h2 style={{ marginTop: 0, color: '#333333' }}>🍿 Sobre Nosotros</h2>
      
      {/* Y TAMBIÉN A LOS PÁRRAFOS */}
      <p style={{ color: '#333333' }}>Somos tu cine favorito. Disfrutá de la mejor cartelera, las mejores salas y la mejor atención.</p>
      <p style={{ color: '#333333' }}>📍 Dirección: Calle Falsa 123</p>
      <p style={{ color: '#333333' }}>📞 Teléfono: 555-1234</p>
      
      <button 
        onClick={() => setMostrarInfo(false)}
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Cerrar
      </button>
    </div>
  </div>
      )}
    </>
  );
}