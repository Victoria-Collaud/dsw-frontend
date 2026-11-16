import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { getallSala, createSala, deleteSala, updateSala} from '../../services/salaServices'
import type { Sala } from '../../services/salaServices'
import Loader from '../../components/Loader'
import Swal from 'sweetalert2'
import './AdminSalas.css'

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
  if (!NumSala) return;

 
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Seguro que querés eliminar la Sala #${NumSala}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e50914', 
    cancelButtonColor: '#222',     
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#141414',         
    color: '#fff'                 
  });

  // Si el usuario cancela, no hacemos nada
  if (!result.isConfirmed) return;

  try {
    await deleteSala(NumSala);
    
    Swal.fire({
      title: '¡Eliminado!',
      text: 'La sala ha sido eliminada correctamente.',
      icon: 'success',
      confirmButtonColor: '#e50914',
      background: '#141414',
      color: '#fff',
      timer: 1500,
      showConfirmButton: false
    });

    cargarSalas();
  } catch (error) {
    console.error('Error al borrar la sala', error);
    // ALERTA DE ERROR ESPECÍFICA
    const mensajeError = error instanceof Error 
      ? error.message 
      : 'No se pudo eliminar la sala.';

    Swal.fire({
      title: 'No se puede eliminar',
      text: mensajeError, // muestra el mensaje de error real
      icon: 'error',
      confirmButtonColor: '#e50914',
      background: '#141414',
      color: '#fff'
    });
  }
}

if (cargando) {
      return <Loader mensaje="Cargando funciones..." />;
    }
    
 return (
   <div className="admin-salas-container">
      
      <div className="admin-salas-header">
        <h2 className="admin-salas-title">
          Administración - Salas
        </h2>
      </div>

      {error && (
        <p className="admin-salas-error">
          {error}
        </p>
      )}
{/* Formulario de Alta/Edición de Sala */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#141414', border: '1px solid #222', padding: '25px', borderRadius: '4px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {salaEditando ? ` Editar Sala #${salaEditando}` : '➕ Agregar Nueva Sala'}
        </h3>
        
        <div className="admin-salas-field">
          <label className="admin-salas-label">Número de sala:</label>
          <input
            type="number"
            placeholder="Ej: 1"
            value={NumSala}
            onChange={(e) => setNumSala(Number(e.target.value))}
            disabled={salaEditando !== null} 
            className="admin-salas-input"
          />
        </div>

        <div className="admin-salas-field">
          <label className="admin-salas-label">Capacidad:</label>
          <select
            value={capacidad}
            onChange={(e) => setCapacidad(Number(e.target.value))}
            className="admin-salas-select"
          >
            <option value="">-- Seleccioná la capacidad --</option>
            <option value="24">VIP (24 asientos - 4x6)</option>
            <option value="40">Chica (40 asientos - 5x8)</option>
            <option value="64">Mediana (64 asientos - 8x8)</option>
            <option value="100">Grande (100 asientos - 10x10)</option>
            <option value="150">Plus (150 asientos - 10x15)</option>
          </select>
        </div>
        
        <div className="admin-salas-field">
          <label className="admin-salas-label">Tipo de Pantalla:</label>
          <input
            type="text"
            placeholder="Ej: IMAX"
            value={TipoPantalla}
            onChange={(e) => setTipoPantalla(e.target.value)}
            className="admin-salas-input"
          />
        </div>

        <div className="admin-salas-field">
          <label className="admin-salas-label">Tipo de Asiento:</label>
          <input
            type="text"
            placeholder="Ej: Reclinable"
            value={TipoAsientos}
            onChange={(e) => setTipoAsientos(e.target.value)}
            className="admin-salas-input"
          />
        </div>

        <div className="admin-salas-field">
          <label className="admin-salas-label">Precio de las entradas de la sala ($):</label>
          <input
            type="number"
            placeholder="Ej: 4500"
            value={precioSala}
            onChange={(e) => setPrecioSala(Number(e.target.value))}
            className="admin-salas-input"
          />
        </div>
        
        <div className="admin-salas-actions">
          <button 
            type="submit" 
            className="admin-salas-btn-submit"
          >
            {salaEditando ? 'Guardar Cambios' : 'Crear Sala'}
          </button>
          
          {salaEditando && (
            <button 
              type="button" 
              onClick={limpiarFormulario}
              className="admin-salas-btn-cancel"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Listado de Salas */}
      <h3 className="admin-salas-list-title">
        Salas Creadas
      </h3>

      {salas.length === 0 ? (
        <p className="admin-salas-empty">No hay salas registradas aún.</p>
      ) : (
        <ul className="admin-salas-list">
          {salas.map((sala) => (
            <li
              key={sala.NumSala}
              className="admin-salas-item"
            >
              <div className="admin-salas-item-info">
                <strong>#{sala.NumSala}</strong>
                <br />
                <small>
                  Capacidad: {sala.Capacidad} | Pantalla: {sala.TipoPantalla} | Asientos: {sala.TipoAsientos} | Precio: ${sala.PrecioSala}
                </small>
              </div>

              <div className="admin-salas-item-actions">
                <button
                  onClick={() => handleEditar(sala)}
                  className="admin-salas-btn-edit"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(sala.NumSala)}
                  className="admin-salas-btn-delete"
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