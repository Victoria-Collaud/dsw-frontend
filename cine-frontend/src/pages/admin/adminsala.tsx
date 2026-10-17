import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { getallSala, createSala, deleteSala, updateSala} from '../../services/salaServices'
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
// NUEVO ESTADO POR UPDATE: Guarda el ID de la sala si estamos editando, o null si estamos creando
  const [salaEditando, setSalaEditando] = useState<number | null>(null)


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

 // 👇 FUNCIÓN PARA LIMPIAR EL FORMULARIO
  function limpiarFormulario() {
    setNumSala('')
    setCapacidad('')
    setPrecioSala('')
    setTipoPantalla('')
    setTipoAsientos('')
    setSalaEditando(null) // Reseteamos el modo edición
    setError('')
  }

  // 👇 FUNCIÓN PARA CARGAR LOS DATOS DE UNA SALA EN EL FORMULARIO
  function handleEditar(sala: Sala) {
    setNumSala(sala.NumSala)
    setCapacidad(sala.Capacidad)
    setPrecioSala(sala.PrecioSala)
    setTipoPantalla(sala.TipoPantalla)
    setTipoAsientos(sala.TipoAsientos)
    setSalaEditando(sala.NumSala) // Guardamos el ID para saber que estamos editando
    setError('')
  }

  // Manejador del formulario (sirve para crear y editar)
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!NumSala || !capacidad || !precioSala) {
      setError('Por favor completá todos los campos.')
      return
    }

    try {
      const salaData = {
        NumSala: Number(NumSala),
        Capacidad: Number(capacidad),
        TipoPantalla: TipoPantalla,
        TipoAsientos: TipoAsientos,
        PrecioSala: Number(precioSala)
      }

      if (salaEditando) {
        // MODO EDICIÓN
        await updateSala(salaEditando, salaData)
      } else {
        // MODO CREACIÓN
        await createSala(salaData)
      }

      limpiarFormulario()
      cargarSalas()
    } catch (error) {
      console.log('Error al guardar la sala', error)
      setError(salaEditando ? 'No se pudo actualizar la sala.' : 'No se pudo crear la sala.')
    }
  }

async function handleDelete(NumSala: number) {
    if (!NumSala) return
    // Confirmación antes de borrar
    if (!window.confirm(`¿Seguro que querés eliminar la Sala #${NumSala}?`)) return

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
{/* Formulario de Alta/Edición de Sala */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        {/* 👇 Título dinámico según el modo */}
        <h3>{salaEditando ? `Editar Sala #${salaEditando}` : 'Agregar Nueva Sala'}</h3>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Numero de sala:</label>
          <input
            type="number"
            placeholder="Ej: 1"
            value={NumSala}
            onChange={(e) => setNumSala(Number(e.target.value))}
            // 👇 Deshabilitamos el ID si estamos editando (no se debe cambiar la PK)
            disabled={salaEditando !== null} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box'}}
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
            value={TipoPantalla}
            onChange={(e) => setTipoPantalla(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
          <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Tipo de Asiento:</label>
          <input
            type="string"
            placeholder="Ej: Reclinable"
            value={TipoAsientos}
            onChange={(e) => setTipoAsientos(e.target.value)}
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
        

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
            {salaEditando ? 'Guardar Cambios' : 'Crear Sala'}
          </button>
          
          {/* 👇 Botón de Cancelar (solo aparece en modo edición) */}
          {salaEditando && (
            <button 
              type="button" 
              onClick={limpiarFormulario}
              style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#d995cd', border: 'none', borderRadius: '4px' }}
            >
              Cancelar
            </button>
          )}
        </div>
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

              <div style={{ display: 'flex', gap: '5px' }}>
                {/* 👇 Botón de Editar */}
                <button
                  onClick={() => handleEditar(sala)}
                  style={{ color: '#3498db', padding: '5px 10px', cursor: 'pointer' }}
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(sala.NumSala)}
                  style={{ color: 'red', padding: '5px 10px', cursor: 'pointer' }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}