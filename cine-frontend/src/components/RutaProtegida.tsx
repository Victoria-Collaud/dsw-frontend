import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { obtenerUsuarioDesdeToken } from '../utils/auth.ts';

interface RutaProtegidaProps {
  rolRequerido?: string; 
}

export default function RutaProtegida({ rolRequerido }: RutaProtegidaProps) {
  // Buscamos el token y obtenemos el usuario en el localStorage
  const token = localStorage.getItem('token');
  const usuario = obtenerUsuarioDesdeToken();
  const location = useLocation();
  // Si no hay token o usuario, lo mandamos al login
  if (!token || !usuario) {
  // Le pasamos la ruta a la que intentaba ir
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Si no es admin lo mandamos al inicio
  if (rolRequerido && usuario.rol !== rolRequerido) {
    return <Navigate to="/" replace />; // O a una página de "No autorizado"
  }
  // Si pasa todo, mostramos el componente hijo
  return <Outlet />;
}