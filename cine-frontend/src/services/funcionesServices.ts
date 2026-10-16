// src/services/funcionesServices.ts
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
}

// Único método de lectura: funciones de una película específica
export async function getFuncionesDePelicula(idPelicula: number): Promise<Funcion[]> {
  const res = await fetch(`${API_URL}/funciones/peliculas/${idPelicula}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener funciones');
   const json = await res.json();
  return json.data || json; 
}

export async function createFuncion(funcion: Funcion): Promise<Funcion> {
  const body = {
    ...funcion,
    Fecha: new Date(`${funcion.Fecha}T00:00:00`).toISOString()
  };
  const res = await fetch(`${API_URL}/funciones`, {
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
  const res = await fetch(`${API_URL}/funciones/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar función');
}

// Obtener una película por ID creo que va aca?
export async function getPeliculaPorId(id: number): Promise<Pelicula> {
  const res = await fetch(`${API_URL}/peliculas/${id}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener película');
  return await res.json();
}