import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface RutaProtegidaProps {
  rolRequerido?: string; 
}

export default function RutaProtegida({ rolRequerido }: RutaProtegidaProps) {
  // Buscamos el token, el usuario en el localStorage y obtenemos su ruta
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const location = useLocation();
  // Si no hay token o usuario, lo mandamos al login
  if (!token || !usuario) {
    // Le pasamos la ruta a la que intentaba ir
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  //  Si no es admin lo mandamos al inicio
  if (rolRequerido && usuario.rol !== rolRequerido) {
    return <Navigate to="/" replace />; // O a una página de "No autorizado"
  }
  // Si pasa todo, mostramos el componente hijo
  return <Outlet />;
}