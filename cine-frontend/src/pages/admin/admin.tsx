import { NavLink, Outlet } from 'react-router-dom';
import './Admin.css';


export default function Admin() {
  return (

    <div className="admin-container">
      
      {/* Título del Panel */}
      <div className="admin-header">
        <h1 className="admin-title">
          Panel de Administración
        </h1>
        <p className="admin-subtitle">
          Gestión de salas, películas, funciones, géneros y compras del sistema.
        </p>
      </div>

      {/* Menú de pestañas */}
      <nav className="admin-nav">

        <NavLink 
          to="/admin/salas" 
          className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}
        >
          Salas
        </NavLink>

        <NavLink 
          to="/admin/peliculas"
          className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}
        >
          Películas
        </NavLink>

        <NavLink 
          to="/admin/funciones"
          className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}
        >
          Funciones
        </NavLink>

        <NavLink 
          to="/admin/generos"
          className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}
        >
          Generos
        </NavLink>

        <NavLink 
          to="/admin/compras"
          className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}
        >
          Compras
        </NavLink>
        
      </nav>
      
      <Outlet />
    </div>
  )
};

