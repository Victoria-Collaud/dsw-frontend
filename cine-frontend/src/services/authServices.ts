import { fetchApi } from '../utils/fetchApi';

const API_URL = import.meta.env.VITE_API_URL;

export interface LoginCredentials {
  email: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    idUsuario: number;
    email: string;
    rol: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetchApi(`${API_URL}/usuarios/login`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Credenciales inválidas');
  }

  return response.json();
};