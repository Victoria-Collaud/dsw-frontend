export async function fetchApi(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  // Armamos las cabeceras con el token (si existe)
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });

  //Si el token venció o no es válido (401) o no tiene permisos (403)
  if (response.status === 401 || response.status === 403) {
    
    //si el error viene del propio login, no redirigimos
    if (!url.includes('/login')) {
      // 1. Limpiamos la sesión
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      // 2. Avisamos al usuario
      alert(' La sesión ha expirado por inactividad. Por favor, volvé a iniciar sesión.');
      // 3. Redirigimos al login forzando la recarga
      window.location.href = '/login';
      // 4. Cortamos la ejecución
      throw new Error('Sesión expirada');
    }
  }

  return response;
}