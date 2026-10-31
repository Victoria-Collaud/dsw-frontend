import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { getallSala, createSala, deleteSala, updateSala} from '../../services/salaServices'
import type { Sala } from '../../services/salaServices'
import Loader from '../../components/Loader';

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
  
  const [cargando, setCargando] = useState(true);

  // Cargar las salas al montar el componente
  useEffect(() => {
    cargarSalas()
  }, [])

  // Función para obtener las salas desde el backend
  async function cargarSalas() {
    setError('')
    setCargando(true);
    try {
      const data = await getallSala()
      setSalas(data)
    }catch (error) {
      console.log('Error al buscar las salas', error)
      setError('No se pudieron obtener las salas del servidor.')
    } finally {
      setCargando(false); 
  } }

 //  LIMPIAR EL FORMULARIO
  function limpiarFormulario() {
    setNumSala('')
    setCapacidad('')
    setPrecioSala('')
    setTipoPantalla('')
    setTipoAsientos('')
    setSalaEditando(null) // Reseteamos el modo edición
    setError('')
  }

  // CARGAR LOS DATOS DE UNA SALA EN EL FORMULARIO
  function handleEditar(sala: Sala) {
    setNumSala(sala.NumSala)
    setCapacidad(sala.Capacidad)
    setPrecioSala(sala.PrecioSala)
    setTipoPantalla(sala.TipoPantalla)
    setTipoAsientos(sala.TipoAsientos)
    setSalaEditando(sala.NumSala) // Guardamos el ID para saber que estamos editando
    setError('')
  }

  // Manejador del formulario 
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!NumSala || !capacidad || !precioSala) {
      setError('Por favor completá todos los campos.')
      return
    }
    if (salaEditando === null) {
      const salaExistente = salas.some(s => s.NumSala === Number(NumSala))
      if (salaExistente) {
        setError(`Ya existe una sala registrada con el número #${NumSala}. Por favor elegí otro número.`)
        return
      }
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
        
        await updateSala(salaEditando, salaData)
      } else {
       
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

if (cargando) {
      return <Loader mensaje="Cargando funciones..." />;
    }
    
 return (
   <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      
      <div style={{ margin: '20px 0 30px 0' }}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          ⚙️ Administración - Salas
        </h2>
      </div>

      {error && (
        <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </p>
      )}
{/* Formulario de Alta/Edición de Sala */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#141414', border: '1px solid #222', padding: '25px', borderRadius: '4px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {salaEditando ? `✏️ Editar Sala #${salaEditando}` : '➕ Agregar Nueva Sala'}
        </h3>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Número de sala:</label>
          <input
            type="number"
            placeholder="Ej: 1"
            value={NumSala}
            onChange={(e) => setNumSala(Number(e.target.value))}
            disabled={salaEditando !== null} 
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Capacidad:</label>
          <input
            type="number"
            placeholder="Ej: 120"
            value={capacidad}
            onChange={(e) => setCapacidad(Number(e.target.value))}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Tipo de Pantalla:</label>
          <input
            type="text"
            placeholder="Ej: IMAX"
            value={TipoPantalla}
            onChange={(e) => setTipoPantalla(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Tipo de Asiento:</label>
          <input
            type="text"
            placeholder="Ej: Reclinable"
            value={TipoAsientos}
            onChange={(e) => setTipoAsientos(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Precio de las entradas de la sala ($):</label>
          <input
            type="number"
            placeholder="Ej: 4500"
            value={precioSala}
            onChange={(e) => setPrecioSala(Number(e.target.value))}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            type="submit" 
            style={{ flex: 1, padding: '12px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {salaEditando ? 'Guardar Cambios' : 'Crear Sala'}
          </button>
          
          {salaEditando && (
            <button 
              type="button" 
              onClick={limpiarFormulario}
              style={{ padding: '12px 20px', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

{/* Listado de Salas */}
      <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Salas Creadas
      </h3>

      {salas.length === 0 ? (
        <p style={{ color: '#888' }}>No hay salas registradas aún.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {salas.map((sala) => (
            <li
              key={sala.NumSala}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#141414',
                border: '1px solid #222',
                borderRadius: '4px'
              }}
            >
              <div>
                <strong style={{ color: '#fff', fontSize: '1rem' }}>#{sala.NumSala}</strong>
                <br />
                <small style={{ color: '#888', fontSize: '0.85rem' }}>
                  Capacidad: {sala.Capacidad} | Pantalla: {sala.TipoPantalla} | Asientos: {sala.TipoAsientos} | Precio: ${sala.PrecioSala}
                </small>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEditar(sala)}
                  style={{ color: '#fff', padding: '6px 12px', cursor: 'pointer', border: '1px solid #333', borderRadius: '4px', backgroundColor: '#222', fontWeight: 'bold', fontSize: '0.85rem' }}
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(sala.NumSala)}
                  style={{ color: '#ff4d4d', padding: '6px 12px', cursor: 'pointer', border: '1px solid #552222', borderRadius: '4px', backgroundColor: '#2a1212', fontWeight: 'bold', fontSize: '0.85rem' }}
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