import { fetchApi } from '../utils/fetchApi';

const API_URL = `${import.meta.env.VITE_API_URL}`

// Interfaz para leer
export interface Pelicula {
  IdPelicula?: number
  TituloPelicula: string
  Sinopsis: string
  Duracion: number
  Clasificacion: string
  genero: number | { CodGenero: number; NombreGenero?: string }; 
  Cartelera: string
  Trailer: string
  Activa?: boolean
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

// Obtener peliculas activas para la cartelera pública
export async function getPeliculasActivas(): Promise<Pelicula[]> {
  const res = await fetchApi(`${API_URL}/peliculas/activas`); 
  if (!res.ok) throw new Error('Error al obtener películas activas');
  const json = await res.json();
  return json.data || json;
}

// archivar/desarchivar
export async function cambiarEstadoPelicula(IdPelicula: number): Promise<Pelicula> {
  const res = await fetchApi(`${API_URL}/peliculas/${IdPelicula}/estado`, {
    method: 'PATCH'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al cambiar el estado');
  }
  return await res.json();
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

// Actualizar una película existente
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

// Obtener todas las películas activas para la cartelera pública
export async function buscarPeliculaPorTitulo(titulo: string): Promise<Pelicula[]> {
  const res = await fetchApi(`${API_URL}/peliculas/buscar?titulo=${encodeURIComponent(titulo)}`, {
  });

  if (res.status === 404) return [];
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al buscar película');
  }
  const json = await res.json();
  return json.data || json;
}

// Obtener una película por su ID
export async function getPeliculaPorId(id: number): Promise<Pelicula> {
  const res = await fetchApi(`${API_URL}/peliculas/${id}`, {
  });
  if (res.status === 404) {
    const peliculas = await getPeliculas();
    const pelicula = peliculas.find((item) => item.IdPelicula === id);
    if (pelicula) return pelicula;
    throw new Error('Película no encontrada');
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al obtener película');
  }
  const json = await res.json();
  return json.data || json;
}