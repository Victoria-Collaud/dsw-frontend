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

// Interfaz adaptada a la entidad MikroORM de Pelicula
export interface Pelicula {
  IdPelicula?: number
  TituloPelicula: string
  Sinopsis: string
  Duracion: number
  Clasificacion: string
  genero: number | { CodGenero: number } // Permite enviar el ID del género
  Cartelera: string
  Trailer: string
}

// Obtener todas las películas
export async function getPeliculas(): Promise<Pelicula[]> {
  const res = await fetch(`${API_URL}/peliculas`, {
    headers: getHeaders()
  })
  if (!res.ok) throw new Error('Error al obtener películas')
  const json = await res.json()
  return json.data || json
}

// Crear una nueva película
export async function createPelicula(pelicula: Pelicula): Promise<Pelicula> {
  const res = await fetch(`${API_URL}/peliculas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(pelicula)
  })
  if (!res.ok) throw new Error('Error al crear película')
  return await res.json()
}

// Eliminar una película por ID
export async function deletePelicula(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/peliculas/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  if (!res.ok) throw new Error('Error al eliminar película')
}

