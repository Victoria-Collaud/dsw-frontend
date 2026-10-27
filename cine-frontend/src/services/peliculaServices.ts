import { fetchApi } from '../utils/fetchApi';

const API_URL = `${import.meta.env.VITE_API_URL}`

// Interfaz para leer
export interface Pelicula {
  IdPelicula?: number
  TituloPelicula: string
  Sinopsis: string
  Duracion: number
  Clasificacion: string
  genero: number 
  Cartelera: string
  Trailer: string
}

// Interfaz para CREAR (lo que envías al backend)
export interface CreargroPelicula {
  TituloPelicula: string;
  Sinopsis: string;
  Duracion: number;
  Clasificacion: string;
  CodGenero: number;
  Cartelera: string;
  Trailer: string;
}

// Obtener todas las películas
export async function getPeliculas(): Promise<Pelicula[]> {
  const res = await fetchApi(`${API_URL}/peliculas`, {
  })
  if (!res.ok) throw new Error('Error al obtener películas')
  const json = await res.json()
  return json.data || json
}

// Crear una nueva película
export async function createPelicula(pelicula: CreargroPelicula): Promise<Pelicula> {
  const res = await fetchApi(`${API_URL}/peliculas`, {
    method: 'POST',
    body: JSON.stringify(pelicula)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al crear película');
  }
  return await res.json();
}

// Eliminar una película por ID
export async function deletePelicula(id: number): Promise<void> {
  const res = await fetchApi(`${API_URL}/peliculas/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al eliminar película');
  }
}

export async function updatePelicula(id: number, pelicula: CreargroPelicula): Promise<Pelicula> {
  const res = await fetchApi(`${API_URL}/peliculas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pelicula)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al actualizar película');
  }
  return await res.json();
}

export async function buscarPeliculaPorTitulo(titulo: string): Promise<Pelicula[]> {
  const res = await fetchApi(`${API_URL}/peliculas/buscar?titulo=${encodeURIComponent(titulo)}`, {
  });
  // Si el backend devuelve 404 porque no encontró nada, devolvemos array vacío
  if (res.status === 404) return [];
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al buscar película');
  }
  const json = await res.json();
  return json.data || json;
}

export async function getPeliculaPorId(id: number): Promise<Pelicula> {
  const res = await fetchApi(`${API_URL}/peliculas/${id}`, {
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al obtener película');
  }
  return await res.json();
}