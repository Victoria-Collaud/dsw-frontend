import Swal from 'sweetalert2';

export async function fetchApi(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  // Armamos las cabeceras con el token (si existe)
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });

  // 1. Si el token venció o no es válido (401)
  if (response.status === 401) {
    if (!url.includes('/login')) {
      // Limpiamos la sesión solo si es 401 real
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      if (!Swal.isVisible()) {
        Swal.fire({
          title: 'Sesión expirada',
          text: 'La sesión ha expirado. Por favor, volvé a iniciar sesión.',
          icon: 'warning',
          confirmButtonColor: '#e50914',
          background: '#141414',
          color: '#fff',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(() => {
          window.location.href = '/login';
        });
      }

      throw new Error('Sesión expirada');
    }
  }

  // 2. Si el usuario está autenticado pero no tiene permisos de administrador (403)
  if (response.status === 403) {
    if (!Swal.isVisible()) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No tenés los permisos necesarios para realizar esta acción.',
        icon: 'error',
        confirmButtonColor: '#e50914',
        background: '#141414',
        color: '#fff'
      });
    }

    throw new Error('Acceso prohibido');
  }

  return response;
}