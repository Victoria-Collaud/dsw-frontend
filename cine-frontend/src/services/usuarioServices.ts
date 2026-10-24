import { fetchApi } from '../utils/fetchApi';

const API_URL = `${import.meta.env.VITE_API_URL}`

export interface Usuario {
  IdUsuario?: number
  FechaNacimiento: string | Date
  EmailUsuario: string
 
}

export interface RegistroUsuarioDTO {
  EmailUsuario: string;
  Contrasena: string;
  FechaNacimiento: string;
  rol: string;
}

// Función para iniciar sesión
export async function login(EmailUsuario: string, ContrasenaHash: string): Promise<{ token: string; usuario: Usuario }> {
  const res = await fetchApi(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ EmailUsuario, ContrasenaHash })
  })
  
  if (!res.ok) throw new Error('Error al iniciar sesión. Verificá tus credenciales.')
  
  const data = await res.json()
  
  if (data.token) {
    localStorage.setItem('token', data.token)
  }
  if (data.usuario) {
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
  }
  
  return data
}

// Obtener el usuario actual guardado en el navegador

export async function getMiPerfil(IdUsuario: number): Promise<Usuario> {
  const token = localStorage.getItem('token')
  
  const res = await fetch(`${API_URL}/auth/perfil/${IdUsuario}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!res.ok) throw new Error('Error al obtener el perfil del usuario.')
  
  return await res.json()
}

// Cerrar sesión
export function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  window.location.href = '/login'
}

export async function registrarUsuario(usuario: RegistroUsuarioDTO) {
  const res = await fetchApi(`${API_URL}/usuarios/registro`, {
    method: 'POST',
    body: JSON.stringify(usuario)
  });
  
  if (!res.ok) {
    const err: unknown = await res.json().catch(() => ({}));
    const mensaje = (err && typeof err === 'object' && 'mensaje' in err) 
      ? String((err as { mensaje: string }).mensaje) 
      : 'Error al registrar usuario';
    throw new Error(mensaje);
  }
  
  return await res.json();
}