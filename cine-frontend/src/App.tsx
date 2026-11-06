import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida';
import Inicio from './pages/inicio'
import DetallePelicula from './pages/detallepelicula'
import Peliculas from './pages/peliculas'
import Compra from './pages/compra'
import Login from './pages/login'
import Admin from './pages/admin/admin';
import AdminSalas from './pages/admin/adminsala';
import AdminPeliculas from './pages/admin/adminpelicula';
import AdminFunciones from './pages/admin/adminfunciones.tsx'
import AdminCompras from './pages/admin/admincompra.tsx'
import AdminGeneros from './pages/admin/admingenero.tsx'
import Registro from './pages/registro.tsx';
import MisCompras from './pages/miscompras.tsx';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ padding: '20px' }}>
        {/* 🛡️ El ErrorBoundary envuelve a todo el sistema de rutas de una sola vez */}
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/pelicula/:id" element={<DetallePelicula />} />
            <Route path="/login" element={<Login />} />
            <Route path="/peliculas" element={<Peliculas />} />
            <Route path="/registro" element={<Registro />} />
            
            {/* Rutas protegidas de usuarios */}
            <Route element={<RutaProtegida />}>
              <Route path="/comprar/:funcionId" element={<Compra />} />
              <Route path="/miscompras" element={<MisCompras />} />
            </Route>
            
            {/* Rutas protegidas de administrador */}
            <Route element={<RutaProtegida rolRequerido="ADMIN" />}>
              <Route path="/admin" element={<Admin />}>
                <Route index element={<Navigate to="/admin/salas" replace />} />
                <Route path="salas" element={<AdminSalas />} />
                <Route path="peliculas" element={<AdminPeliculas />} />
                <Route path="funciones" element={<AdminFunciones />} />
                <Route path="generos" element={<AdminGeneros />} />
                <Route path="compras" element={<AdminCompras />} />
              </Route>
            </Route>
          
            {/* Ruta 404 */}
            <Route path="*" element={<p style={{ textAlign: 'center', marginTop: '20px' }}>404 - Página no encontrada</p>} />
          </Routes>
        </ErrorBoundary>
      </main>
    </BrowserRouter>
  )
}