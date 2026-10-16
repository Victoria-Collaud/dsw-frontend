import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { getallSala, createSala, deleteSala} from '../../services/salaServices'
import type { Sala } from '../../services/salaServices'

export default function AdminSalas() {
  // Estados para manejar la lista de salas
  const [salas, setSalas] = useState<Sala[]>([])
  
  // Estados para los campos del formulario
  const [NumSala, setNumSala] = useState<number | ''>('')
  const [capacidad, setCapacidad] = useState<number | ''>('')
  const [TipoPantalla, setTipoPantalla] = useState<string>('')
  const [TipoAsientos, setTipoAsientos] = useState<string>('')
  const [precioSala, setPrecioSala] = useState<number | ''>('')

  // Estado para capturar errores de conexión o validación
  const [error, setError] = useState('')

  // Cargar las salas al montar el componente
  useEffect(() => {
    cargarSalas()
  }, [])

  // Función para obtener las salas desde el backend
  async function cargarSalas() {
    setError('')
    try {
      const data = await getallSala()
      setSalas(data)
    }catch (error) {
      console.log('Error al buscar las salas', error)
      setError('No se pudieron obtener las salas del servidor.')
    }
  }

  // Manejador del formulario para crear una sala
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!NumSala || !capacidad || !precioSala) {
      setError('Por favor completá todos los campos.')
      return
    }

    try {
      await createSala({
          NumSala: Number(NumSala),
          Capacidad: Number(capacidad),
          TipoPantalla: TipoPantalla,
          TipoAsientos: TipoAsientos,
          PrecioSala: Number(precioSala)
      })

      // Limpiar el formulario y recargar la lista
      setNumSala('')
      setCapacidad('')
      setPrecioSala('')
      setTipoPantalla('')
      setTipoAsientos('')
      setError('')
      cargarSalas()
    } catch (error) {
        console.log('Error al crear la sala', error)
      setError('No se pudo crear la sala.')
    }
  }

  // Manejador para eliminar una sala 
  async function handleDelete(NumSala: number) {
    if (!NumSala) return
    try {
      await deleteSala(NumSala)
      cargarSalas()
    } catch (error) {
      console.log('Error al borrar la sala', error)
      setError('No se pudo eliminar la sala.')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>⚙️ Administración - Salas</h1>

      {error && (
        <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>
          {error}
        </p>
      )}

      {/* Formulario de Alta de Sala */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <h3>Agregar Nueva Sala</h3>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Numero de sala:</label>
          <input
            type="number"
            placeholder="Ej: 1"
            value={NumSala}
            onChange={(e) => setNumSala(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Capacidad:</label>
          <input
            type="number"
            placeholder="Ej: 120"
            value={capacidad}
            onChange={(e) => setCapacidad(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Tipo de Pantalla:</label>
          <input
            type="string"
            placeholder="Ej: IMAX"
            value={ TipoPantalla}
            onChange={(e) => setTipoPantalla (e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
          <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Tipo de Asiento:</label>
          <input
            type="string"
            placeholder="Ej: Reclinable"
            value={ TipoAsientos}
            onChange={(e) => setTipoAsientos (e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Precio de las entradas de la sala ($):</label>
          <input
            type="number"
            placeholder="Ej: 4500"
            value={precioSala}
            onChange={(e) => setPrecioSala(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          Crear Sala
        </button>
      </form>

      {/* Listado de Salas */}
      <h3>Salas Creadas</h3>
      {salas.length === 0 ? (
        <p>No hay salas registradas aún.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {salas.map((sala) => (
            <li
              key={sala.NumSala}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #ccc'
              }}
            >
              <div>
                <strong>#{sala.NumSala} </strong>
                <br />
                <small>Capacidad: {sala.Capacidad} | Tipo de Pantalla: {sala.TipoPantalla} | Tipo de Asiento: {sala.TipoAsientos} | Precio: ${sala.PrecioSala}</small>
              </div>

              <button
                onClick={() => handleDelete(sala.NumSala)}
                style={{ color: 'pink', padding: '5px 10px', cursor: 'pointer' }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}