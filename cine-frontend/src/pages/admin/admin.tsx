import { NavLink, Outlet } from 'react-router-dom';

export default function Admin() {
  return (
    <div style={{ padding: '40px 20px', width: '100%', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box', backgroundColor: '#0b0c10', color: '#fff', minHeight: '100vh' }}>
      
{/* Título del Panel */}
      <div style={{ textAlign: 'left', margin: '10px 0 30px 0', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', letterSpacing: '2px', margin: '0 0 8px 0', color: '#ffffff', textTransform: 'uppercase', fontWeight: '700', fontFamily: 'system-ui, sans-serif' }}>
          ⚙️ Panel de Administración
        </h1>
        <p style={{ fontSize: '1rem', color: '#888', margin: 0 }}>
          Gestión de salas, películas, funciones, géneros y compras del sistema.
        </p>
      </div>

{/* Menú de pestañas */}
      <nav style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #222', marginBottom: '30px', paddingBottom: '15px', flexWrap: 'wrap' }}>
        <NavLink 
          to="/admin/salas" 
          style={({ isActive }) => ({
            padding: '8px 16px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#aaa',
            backgroundColor: isActive ? '#e50914' : '#141414',
            border: '1px solid',
            borderColor: isActive ? '#e50914' : '#222',
            borderRadius: '2px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          })}
        >
          Salas
        </NavLink>
        <NavLink 
          to="/admin/peliculas"
          style={({ isActive }) => ({
            padding: '8px 16px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#aaa',
            backgroundColor: isActive ? '#e50914' : '#141414',
            border: '1px solid',
            borderColor: isActive ? '#e50914' : '#222',
            borderRadius: '2px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          })}
        >
          Películas
        </NavLink>
        <NavLink 
          to="/admin/funciones"
          style={({ isActive }) => ({
            padding: '8px 16px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#aaa',
            backgroundColor: isActive ? '#e50914' : '#141414',
            border: '1px solid',
            borderColor: isActive ? '#e50914' : '#222',
            borderRadius: '2px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          })}
        >
          Funciones
        </NavLink>
        <NavLink 
          to="/admin/generos"
          style={({ isActive }) => ({
            padding: '8px 16px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#aaa',
            backgroundColor: isActive ? '#e50914' : '#141414',
            border: '1px solid',
            borderColor: isActive ? '#e50914' : '#222',
            borderRadius: '2px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          })}
        >
          Generos
        </NavLink>
        <NavLink 
          to="/admin/compras"
          style={({ isActive }) => ({
            padding: '8px 16px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#aaa',
            backgroundColor: isActive ? '#e50914' : '#141414',
            border: '1px solid',
            borderColor: isActive ? '#e50914' : '#222',
            borderRadius: '2px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          })}
        >
          Compras
        </NavLink>
      </nav>
      
      <Outlet />
    </div>
  );
}


