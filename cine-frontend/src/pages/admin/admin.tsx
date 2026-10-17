/* export default function PanelAdmin() {
  return <h1>Página de Admin</h1>
}
  import { Link } from 'react-router-dom'

export default function Admin() {
*/

// src/pages/admin/AdminLayout.tsx
import { NavLink, Outlet } from 'react-router-dom';

export default function Admin() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>⚙️ Panel de Administración</h1>

      {/* Menú de pestañas */}
      <nav style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #ccc', marginBottom: '30px', paddingBottom: '10px' }}>
        <NavLink 
          to="/admin/salas" 
          style={({ isActive }) => ({
            padding: '8px 16px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#333',
            backgroundColor: isActive ? '#9b59b6' : 'transparent',
            borderRadius: '4px',
            fontWeight: 'bold'
          })}
        >
          Salas
        </NavLink>
        <NavLink 
          to="/admin/peliculas"
          style={({ isActive }) => ({
            padding: '8px 16px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#333',
            backgroundColor: isActive ? '#9b59b6' : 'transparent',
            borderRadius: '4px',
            fontWeight: 'bold'
          })}
        >
          Películas
        </NavLink>
        <NavLink 
          to="/admin/funciones"
          style={({ isActive }) => ({
            padding: '8px 16px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#333',
            backgroundColor: isActive ? '#9b59b6' : 'transparent',
            borderRadius: '4px',
            fontWeight: 'bold'
          })}
        >
          Funciones
        </NavLink>
        <NavLink 
          to="/admin/generos"
          style={({ isActive }) => ({
            padding: '8px 16px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#333',
            backgroundColor: isActive ? '#9b59b6' : 'transparent',
            borderRadius: '4px',
            fontWeight: 'bold'
          })}
        >
          Generos
        </NavLink>
        <NavLink 
          to="/admin/compras"
          style={({ isActive }) => ({
            padding: '8px 16px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#333',
            backgroundColor: isActive ? '#9b59b6' : 'transparent',
            borderRadius: '4px',
            fontWeight: 'bold'
          })}
        >
          Compras
        </NavLink>
      </nav>

      {/* Acá se renderiza la sub-página (AdminSalas, AdminPeliculas, etc.) */}
      <Outlet />
    </div>
  );
}


