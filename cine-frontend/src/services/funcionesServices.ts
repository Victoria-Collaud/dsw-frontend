import { fetchApi } from '../utils/fetchApi';
import type { Pelicula } from './peliculaServices';
import type { Sala } from './salaServices';

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface Funcion {
  
  IdFuncion?: number;
  Idioma: string;
  Fecha: string;
  Horario: string;
  pelicula: Pelicula;
  sala: Sala;
  CapacidadDisponible?: number; 
}

export interface CrearFuncionDTO {
  Idioma: string;
  Fecha: string;
  Horario: string;
  pelicula: Pelicula;
  sala: Sala;
}

// Único método de lectura: funciones de una película específica
export async function getFuncionesDePelicula(idPelicula: number): Promise<Funcion[]> {
  const res = await fetchApi(`${API_URL}/funciones/peliculas/${idPelicula}`, {
    headers: getHeaders()
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('Error al obtener funciones');
   const json = await res.json();
  return json.data || json; 
}

export async function createFuncion(funcion: Funcion): Promise<Funcion> {
  const body = {
    Idioma: funcion.Idioma,
    Fecha: new Date(`${funcion.Fecha}T00:00:00`).toISOString(),
    Horario: funcion.Horario,
    IdPelicula: funcion.pelicula.IdPelicula,
    NumSala: funcion.sala.NumSala
  };
  const res = await fetchApi(`${API_URL}/funciones`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.mensaje || 'Error al crear función');
  }
  return await res.json();
}

export async function deleteFuncion(id: number): Promise<void> {
  const res = await fetchApi(`${API_URL}/funciones/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar función');
}

export async function updateFuncion(id: number, funcion: CrearFuncionDTO): Promise<Funcion> {
  // Formateamos la fecha para que el backend la entienda
  const body = {
    ...funcion,
    Fecha: new Date(`${funcion.Fecha}T00:00:00`).toISOString()
  };
  const res = await fetchApi(`${API_URL}/funciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err: unknown = await res.json().catch(() => ({}));
    // Verificamos si el error tiene la propiedad 'mensaje'
    const mensaje = (err && typeof err === 'object' && 'mensaje' in err) 
      ? String((err as { mensaje: string }).mensaje) 
      : 'Error al actualizar función';
    throw new Error(mensaje);
  }
  return await res.json();
}

export async function getFuncionPorId(id: number): Promise<Funcion> {
  const res = await fetchApi(`${API_URL}/funciones/${id}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener la función');
  const json = await res.json();
  return json.data || json;
}