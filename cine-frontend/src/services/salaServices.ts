// Define la URL base llamando a la variable de entorno de Vite (.env) y le agrega la ruta '/salas'
const API_URL = `${import.meta.env.VITE_API_URL}/salas`

// Define la estructura de datos (tipo) que debe tener un objeto Sala en TypeScript
export interface Sala {
  NumSala?: number // El ID es opcional (?) porque al crear una sala todavía no existe en la BD
  TipoPantalla: string
  TipoAsiento: string   
  Capacidad: number    // Cantidad total de asientos
  PrecioSala: number   // Precio base de la entrada para esa sala
}

// Función asíncrona para obtener todas las salas guardadas en la base de datos
export async function getallSala(): Promise<Sala[]> {
  // Hace una petición GET a http://localhost:3001/api/salas
  const res = await fetch(API_URL)
  
  // Si la respuesta del backend no es OK (código 200), lanza un error
  if (!res.ok) throw new Error('Error al obtener salas')
  
  // Convierte la respuesta recibida a formato JSON
  const json = await res.json()
  
  // Devuelve el arreglo de salas (json.data si el backend responde con un envoltorio, o json directamente)
  return json.data || json
}

// Función para enviar una nueva sala al servidor. 'Omit<Sala, 'CodSala'>' indica que mandamos todo excepto el ID
export async function createSala(sala: Sala): Promise<Sala> {
  // Hace una petición POST enviando los datos de la nueva sala
  const res = await fetch(API_URL, {
    method: 'POST', // Método HTTP para creación
    headers: { 'Content-Type': 'application/json' }, // Avisa al backend que los datos van en formato JSON
    body: JSON.stringify(sala) // Transforma el objeto JavaScript a un string JSON para enviarlo por la red
  })
  
  // Si el backend no pudo crear la sala, lanza una excepción
  if (!res.ok) throw new Error('Error al crear sala')
  
  // Devuelve el objeto de la sala recién creada que retorna el backend (ya con su CodSala asignado)
  return await res.json()
}

// Función para eliminar una sala específica mediante su ID
export async function deleteSala(id: number): Promise<void> {
  // Hace una petición DELETE adjuntando el ID a la URL (ej: http://localhost:3001/api/salas/5)
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
  
  // Si ocurrió un problema al eliminar, lanza un error
  if (!res.ok) throw new Error('Error al eliminar sala')
}