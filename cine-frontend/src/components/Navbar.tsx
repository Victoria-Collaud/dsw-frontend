import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getGeneros } from '../services/generosServices';
import type { Genero } from '../services/generosServices';


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [busqueda, setBusqueda] = useState('');
  const [mostrarInfo, setMostrarInfo] = useState(false); // Estado para info

  // Leemos el usuario del localStorage
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [generos, setGeneros] = useState<Genero[]>([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState('');

  const rutasSinBuscador = ['/peliculas', '/login', '/miscompras', '/admin', '/compra', '/admin/funciones', '/admin/peliculas', '/admin/salas', '/admin/compras', 'admin/generos'];
  const ocultarBuscador = rutasSinBuscador.includes(location.pathname);


  useEffect(() => {
    getGeneros()
      .then(setGeneros)
      .catch((err) => console.error('Error al cargar géneros', err));
  }, []);

 
 
 
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
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 40px', 
        backgroundColor: '#0b0c10', 
        borderBottom: '1px solid #222',
        color: 'white', 
        flexWrap: 'wrap', 
        gap: '30px',
        fontFamily: 'system-ui, sans-serif',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        
        
{/* Lado Izquierdo: Logo, Inicio, Más Info y Admin */}
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#e50914', textDecoration: 'none', fontWeight: '900', fontSize: '1.6rem', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img 
              src="/logo.png" 
              alt="Logo New Cine" 
              style={{ 
                height: '60px', 
                width: 'auto', 
                marginTop: '-4px' 
              }} 
            />
            <span style={{ lineHeight: '1' }}>Cine</span>
          </Link>
          
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#e50914'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
          >
            Inicio
          </Link>
          
          <button 
            onClick={() => setMostrarInfo(true)}
            style={{background: 'transparent', 
              border: 'none', 
              outline: 'none',
              boxShadow: 'none', 
              textShadow: 'none',
              color: '#fff', 
              cursor: 'pointer', 
              fontSize: '0.95rem', 
              fontWeight: '600', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              fontFamily: 'inherit', 
              transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#e50914'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
          >
            Más info
          </button>

          {usuario?.rol === 'ADMIN' && (
            <Link to="/admin" style={{ color: '#e50914', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-user-cog preview-icon"><path d="M10 15H6a4 4 0 0 0-4 4v2"/><path d="m14.305 16.53.923-.382"/><path d="m15.228 13.852-.923-.383"/><path d="m16.852 12.228-.383-.923"/><path d="m16.852 17.772-.383.924"/><path d="m19.148 12.228.383-.923"/><path d="m19.53 18.696-.382-.924"/><path d="m20.772 13.852.924-.383"/><path d="m20.772 16.148.924.383"/><circle cx="18" cy="15" r="3"/><circle cx="9" cy="7" r="4"/></svg> Admin
            </Link>
          )}
        </div>
{/* CENTRO: BARRA DE BÚSQUEDA CONDICIONAL */}
       
        {!ocultarBuscador && (
          <form 
            onSubmit={handleBuscar} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              flex: 1, 
              maxWidth: '450px', 
              backgroundColor: '#141414', 
              border: '1px solid #333',
              borderRadius: '4px', 
              padding: '4px 8px' 
            }}
          >
            <select
              value={generoSeleccionado}
              onChange={(e) => setGeneroSeleccionado(e.target.value)}
              style={{
                padding: '10px 30px',
                borderRadius: '2px',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '0.85rem',
                minWidth: '200px', // 
                borderRight: '1px solid #333'
              }}
            >
              <option value="" style={{ backgroundColor: '#141414', color: '#fff' }}>Todos los géneros</option>
              {generos.map((genero) => (
                <option key={genero.CodGenero} value={genero.CodGenero} style={{ backgroundColor: '#141414', color: '#fff' }}>
                  {genero.NombreGenero}
                </option>
              ))}
            </select>

            <input 
              type="text" 
              placeholder="Buscar película..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: '100%', padding: '6px 12px', border: 'none', outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent', color: '#fff' }}
            />

            <button 
              type="submit" 
              style={{ 
                padding: '6px 12px', 
                backgroundColor: 'transparent', 
                color: '#aaa',                 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        )}
        
{/* Lado Derecho: Usuario / Login */}
       
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {usuario ? (
            <>
              <button 
                onClick={() => setMenuAbierto(!menuAbierto)} 
                style={{ 
                  background: '#141414', 
                  color: 'white', 
                  border: '1px solid #333', 
                  padding: '8px 14px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-user-round preview-icon"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg></span>
                <span>{ (usuario.EmailUsuario ? usuario.EmailUsuario.split('@')[0] : 'Usuario')}</span>
                <span style={{ fontSize: '0.7rem', color: '#888' }}>▼</span>
              </button>

              {menuAbierto && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '125%',
                  backgroundColor: '#141414',
                  border: '1px solid #333',
                  color: '#fff',
                  boxShadow: '0px 8px 24px rgba(0,0,0,0.5)',
                  borderRadius: '4px',
                  padding: '14px',
                  minWidth: '220px',
                  zIndex: 100,
                  textAlign: 'left'
                }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#888', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
                    Sesión iniciada como:<br/>
                    <strong style={{ color: '#fff' }}>{usuario.EmailUsuario}</strong>
                  </p>
                  
                  <div onClick={() => { setMenuAbierto(false); navigate('/miscompras'); }}
                  style={{ padding: '8px 0', fontSize: '0.9rem', cursor: 'pointer', color: '#ccc', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#e50914'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ccc'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-ticket preview-icon"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg> Mis Compras
                  </div>
                  
                  <div style={{ padding: '8px 0', fontSize: '0.9rem', cursor: 'pointer', color: '#ccc', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#e50914'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ccc'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-settings preview-icon"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg> Configuración
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

{/* Información */}
     
      {mostrarInfo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }}>
          <div style={{ 
            backgroundColor: '#141414', 
            border: '1px solid #333',
            padding: '35px', 
            borderRadius: '4px', 
            maxWidth: '420px', 
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            fontFamily: 'system-ui, sans-serif'
          }}>
            
            <h2 style={{ marginTop: 0, color: '#fff', fontSize: '1.3rem', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '2px solid #e50914', paddingBottom: '10px', display: 'inline-block' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-popcorn preview-icon"><path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4"/><path d="M10 22 9 8"/><path d="m14 22 1-14"/><path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z"/></svg> Sobre Nosotros
            </h2>
            
            <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6', marginTop: '15px' }}>
              Somos Newcine. Disfrutá de la mejor cartelera, las mejores salas y la mejor atención en alta definición.
            </p>
            <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '10px 0' }}>📍 Dirección: Boulevard Oroño 1234, Rosario</p>
            <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '0 0 25px 0' }}>📞 Teléfono: 0800-555-CINE</p>
            
            <button 
              onClick={() => setMostrarInfo(false)}
              style={{ 
                width: '100%',
                padding: '12px', 
                backgroundColor: '#e50914', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}