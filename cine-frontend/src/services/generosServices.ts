import { fetchApi } from '../utils/fetchApi';

const API_URL = `${import.meta.env.VITE_API_URL}`


// Interfaz adaptada a la entidad MikroORM de Generos
export interface Genero {
    CodGenero?: number
    NombreGenero: string
}

// Obtener todos los géneros
export async function getGeneros(): Promise<Genero[]> {
  const res = await fetchApi(`${API_URL}/generos`, {
  })
  if (!res.ok) throw new Error('Error al obtener géneros')
  const json = await res.json()
  return json.data || json
}

// Crear un nuevo género
export async function createGenero(genero: Genero): Promise<Genero> {
  const res = await fetchApi(`${API_URL}/generos`, {
    method: 'POST',
    body: JSON.stringify(genero)
  })
  if (!res.ok) throw new Error('Error al crear género')
  return await res.json()
}

// Eliminar un género por ID
export async function deleteGenero(id: number): Promise<void> {
  const res = await fetchApi(`${API_URL}/generos/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Error al eliminar género')
}

export async function updateGenero(id: number, genero: Genero): Promise<Genero> {
  const res = await fetchApi(`${API_URL}/generos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(genero)
  })
  if (!res.ok) throw new Error('Error al actualizar género')
  return await res.json()
}