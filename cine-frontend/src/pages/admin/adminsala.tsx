import { useState, useEffect } from 'react'
//import type { FormEvent } from 'react'
import { getallSala, createSala, deleteSala, updateSala} from '../../services/salaServices'
import type { Sala } from '../../services/salaServices'
import Loader from '../../components/Loader'
import './AdminSala.css'
import { useAlerta } from '../../hooks/useAlerta'
import { useForm } from 'react-hook-form'

interface SalaFormData {
  NumSala: number;
  Capacidad: number;
  TipoPantalla: string;
  TipoAsientos: string;
  PrecioSala: number;
}

export default function AdminSalas() {
  // Estados para manejar la lista de salas
  const [salas, setSalas] = useState<Sala[]>([])
  // Estados para los campos del formulario
  //const [NumSala, setNumSala] = useState<number | ''>('')
  //const [capacidad, setCapacidad] = useState<number | ''>('')
  //const [TipoPantalla, setTipoPantalla] = useState<string>('')
  //const [TipoAsientos, setTipoAsientos] = useState<string>('')
  //const [precioSala, setPrecioSala] = useState<number | ''>('')
  //const [error, setError] = useState('')
  const [salaEditando, setSalaEditando] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true);
  const { alertaConfirmacion, alertaExito, alertaError, alertaAdvertencia } = useAlerta();


  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue,
  } = useForm<SalaFormData>({
    defaultValues: {
      NumSala: 0,
      Capacidad: 0,
      TipoPantalla: '',
      TipoAsientos: '',
      PrecioSala: 0
    }
  });

  useEffect(() => {
    cargarSalas()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Función para obtener las salas desde el backend
  async function cargarSalas() {
    
    setCargando(true);
    try {
      const data = await getallSala()
      setSalas(data)
    }catch (error) {
      console.log('Error al buscar las salas', error)
      alertaError('Error de conexión', 'No se pudieron obtener las salas. Por favor, intentá nuevamente.');
    } finally {
      setCargando(false); 
  } }

 //  LIMPIAR EL FORMULARIO con reset
  function limpiarFormulario() {
    reset();
    setSalaEditando(null);
  }

  // CARGAR LOS DATOS DE UNA SALA EN EL FORMULARIO
  function handleEditar(sala: Sala) {
    setValue('NumSala', sala.NumSala);
    setValue('Capacidad', sala.Capacidad);
    setValue('TipoPantalla', sala.TipoPantalla);
    setValue('TipoAsientos', sala.TipoAsientos);
    setValue('PrecioSala', sala.PrecioSala);
    setSalaEditando(sala.NumSala);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

   const onSubmit = async (data: SalaFormData) => {
    // Validación de sala duplicada (solo si no estamos editando)
    if (salaEditando === null) {
      const salaExistente = salas.some(s => s.NumSala === Number(data.NumSala))
      if (salaExistente) {
        alertaAdvertencia('Sala duplicada', `Ya existe una sala registrada con el número #${data.NumSala}. Por favor elegí otro número.`);
        return;
      }
    }
    try {
      const salaData = {
        NumSala: Number(data.NumSala),
        Capacidad: Number(data.Capacidad),
        TipoPantalla: data.TipoPantalla,
        TipoAsientos: data.TipoAsientos,
        PrecioSala: Number(data.PrecioSala)
      }
      if (salaEditando) {
        await updateSala(salaEditando, salaData)
        alertaExito('¡Actualizada!', 'La sala fue actualizada correctamente.');
      } else {
        await createSala(salaData)
        alertaExito('¡Creada!', 'La sala fue creada correctamente.');
      }
      limpiarFormulario()
      cargarSalas()
    } catch (error) {
      console.log('Error al guardar la sala', error)
      const mensajeError = error instanceof Error ? error.message : 'Error al guardar la sala.';
      alertaError('Error', mensajeError);
    }
  }

async function handleDelete(NumSala: number) {
    if (!NumSala) return;
    const confirmado = await alertaConfirmacion(
      '¿Estás seguro?',
      `¿Seguro que querés eliminar la Sala #${NumSala}?`,
      'Sí, eliminar'
    );
    if (!confirmado) return;
    try {
      await deleteSala(NumSala);
      alertaExito('¡Eliminada!', 'La sala ha sido eliminada correctamente.');
      cargarSalas();
    } catch (error) {
      console.error('Error al borrar la sala', error);
      const mensajeError = error instanceof Error ? error.message : 'No se pudo eliminar la sala.';
      alertaError('No se puede eliminar', mensajeError);
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

{/* Formulario de Alta/Edición de Sala */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#141414', border: '1px solid #222', padding: '25px', borderRadius: '4px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {salaEditando ? ` Editar Sala #${salaEditando}` : ' Agregar Nueva Sala'}
        </h3>
        
        <div className="admin-salas-field">
          <label className="admin-salas-label">Número de sala:</label>
          <input
            type="number"
            placeholder="Ej: 1"
            {...register('NumSala', { required: true, valueAsNumber: true })}
            disabled={salaEditando !== null} 
            className="admin-salas-input"
          />
        </div>

        <div className="admin-salas-field">
          <label className="admin-salas-label">Capacidad:</label>
          <select
            {...register('Capacidad', { required: true, valueAsNumber: true })}
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
           {...register('TipoPantalla', { required: true })}
            className="admin-salas-input"
          />
        </div>

        <div className="admin-salas-field">
          <label className="admin-salas-label">Tipo de Asiento:</label>
          <input
            type="text"
            placeholder="Ej: Reclinable"
            {...register('TipoAsientos', { required: true })}
            className="admin-salas-input"
          />
        </div>

        <div className="admin-salas-field">
          <label className="admin-salas-label">Precio de las entradas de la sala ($):</label>
          <input
            type="number"
            placeholder="Ej: 4500"
            {...register('PrecioSala', { required: true, valueAsNumber: true })}
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