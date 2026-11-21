import { fetchApi } from '../utils/fetchApi';

const API_URL = `${import.meta.env.VITE_API_URL}`

const getHeaders = () => {

  const token = localStorage.getItem('token'); 
  
  if (!token) {
    console.warn('No hay token en el localStorage. El usuario no está logueado.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};


export interface Sala {
  NumSala: number 
  Capacidad: number    // Cantidad total de asientos
  TipoPantalla: string
  TipoAsientos: string  
  PrecioSala: number   // Precio base de la entrada para esa sala
}

// obtener todas las salas guardadas en la base de datos
export async function getallSala(): Promise<Sala[]> {

  const res = await fetchApi(`${API_URL}/salas`, {
    method: 'GET'
  });
  

  if (!res.ok) throw new Error('Error al obtener salas')
  
  // Convierte la respuesta recibida a formato JSON
  const json = await res.json()
  
  // Devuelve el arreglo de salas (json.data si el backend responde con un envoltorio, o json directamente)
  return json.data || json
}

// enviar una nueva sala al servidor. 'Omit<Sala, 'CodSala'>' indica que mandamos todo excepto el ID
export async function createSala(sala: Sala): Promise<Sala> {
  // Hace una petición POST enviando los datos de la nueva sala
  const res = await fetchApi(`${API_URL}/salas`, {
    method: 'POST',
    headers: getHeaders(), // acá enviamos el token
    body: JSON.stringify(sala) // Transforma el objeto JavaScript a un string JSON para enviarlo por la red
  })
  

  if (!res.ok) throw new Error('Error al crear sala')
  
  // Devuelve el objeto de la sala recién creada que retorna el backend (ya con su CodSala asignado)
  return await res.json()
}

// Eliminar una sala mediante su ID
export async function deleteSala(NumSala: number): Promise<void> {
  // Hace una petición DELETE adjuntando el ID a la URL 
  const res = await fetchApi(`${API_URL}/salas/${NumSala}`, {
    method: 'DELETE',
    headers: getHeaders() // acá enviamos el token
  })
  
   if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al eliminar sala');
  }
}
  
export async function updateSala(NumSala: number, sala: Sala): Promise<Sala> {
    const res = await fetchApi(`${API_URL}/salas/${NumSala}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(sala)
    });
    if (!res.ok) throw new Error('Error al actualizar sala');
    return await res.json();
  }

export async function getAsientosDeSala(NumSala: number): Promise<string[]> {
  const res = await fetchApi(`${API_URL}/salas/${NumSala}/asientos`);
  if (!res.ok) throw new Error('Error al obtener asientos');
  const json = await res.json();
  return json.data || json;
}