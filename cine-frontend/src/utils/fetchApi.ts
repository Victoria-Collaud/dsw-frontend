import Swal from 'sweetalert2';

export function cerrarSesionPorExpiracion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');

  if (window.location.pathname === '/login') return;
  if (Swal.isVisible()) return; // 👈 Evita que se muestren dos Swal al mismo tiempo

  Swal.fire({
    title: 'Sesión expirada',
    text: 'La sesión ha expirado. Redirigiendo al login...',
    icon: 'warning',
    confirmButtonColor: '#e50914',
    background: '#141414',
    color: '#fff',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: true, // 👈 Le damos un botón para que el usuario decida
    confirmButtonText: 'Ir al Login'
  }).then(() => {
    window.location.href = '/login'; // Redirección forzada al login
  });
}

export async function fetchApi(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });

  // Si hay un error de autenticación o permisos
  if (response.status === 401 || response.status === 403) {
    if (!url.includes('/login')) {
      
      //  CORTAMOS LA EJECUCIÓN DE INMEDIATO
      // Si ya hay un Swal en pantalla, no hacemos nada más para no pisarlo
      if (Swal.isVisible()) {
        throw new Error('Error de autenticación múltiple');
      }

      if (response.status === 401) {
        // TOKEN VENCIDO -> AL LOGIN
        cerrarSesionPorExpiracion();
        throw new Error('Sesión expirada');
      }
      
      if (response.status === 403) {
        // PERMISO DENEGADO -> AL INICIO
        Swal.fire({
          title: 'Acceso Denegado',
          text: 'No tenés permisos para ver esta sección. Redirigiendo al inicio...',
          icon: 'error',
          confirmButtonColor: '#e50914',
          background: '#141414',
          color: '#fff',
          showConfirmButton: true,
          confirmButtonText: 'Volver al Inicio'
        }).then(() => {
          window.location.href = '/'; // Lo echamos al inicio
        });
        throw new Error('Acceso prohibido');
      }
    }
  }

  return response;
}