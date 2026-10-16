const API_URL = `${import.meta.env.VITE_API_URL}`

const getHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.warn('No hay token en el localStorage. El usuario no está logueado.')
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

// Interfaz adaptada a la entidad MikroORM de Generos
export interface Genero {
    CodGenero?: number
    NombreGenero: string
}

// Obtener todos los géneros
export async function getGeneros(): Promise<Genero[]> {
  const res = await fetch(`${API_URL}/generos`, {
    headers: getHeaders()
  })
  if (!res.ok) throw new Error('Error al obtener géneros')
  const json = await res.json()
  return json.data || json
}

// Crear un nuevo género
export async function createGenero(genero: Genero): Promise<Genero> {
  const res = await fetch(`${API_URL}/generos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(genero)
  })
  if (!res.ok) throw new Error('Error al crear género')
  return await res.json()
}

// Eliminar un género por ID
export async function deleteGenero(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/generos/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  if (!res.ok) throw new Error('Error al eliminar género')
}