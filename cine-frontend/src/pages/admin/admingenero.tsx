import { useEffect, useState, type FormEvent } from 'react'
import { getGeneros, createGenero, updateGenero, deleteGenero } from '../../services/generosServices'
import { type Genero } from '../../services/generosServices'
import Loader from '../../components/Loader';
import Swal from 'sweetalert2'
import './AdminGenero.css'

export default function AdminGeneros() {
  const [generos, setGeneros] = useState<Genero[]>([])
  const [nombreGenero, setNombreGenero] = useState('')
  const [generoEditando, setGeneroEditando] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarGeneros()
  }, [])

  async function cargarGeneros() {
    setError('')
    setCargando(true);
    try {
      const data = await getGeneros()
      setGeneros(data)
    } catch {
      setError('No se pudieron obtener los géneros.')
    } finally {
      setCargando(false); 
    }
  }

  function limpiarFormulario() {
    setNombreGenero('')
    setGeneroEditando(null)
    setError('')
  }

  function handleEditar(genero: Genero) {
    setNombreGenero(genero.NombreGenero)
    setGeneroEditando(genero.CodGenero!)
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nombreGenero.trim()) {
      setError('El nombre del género es obligatorio.')
      return
    }

    try {
      if (generoEditando) {
        await updateGenero(generoEditando, { NombreGenero: nombreGenero })
      } else {
        await createGenero({ NombreGenero: nombreGenero })
      }
      
      limpiarFormulario()
      cargarGeneros()
    } catch {
      setError(generoEditando ? 'Error al actualizar el género.' : 'Error al crear el género.')
    }
  }

  async function handleDelete(CodGenero?: number) {
    if (!CodGenero) return
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Seguro que querés eliminar este género?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e50914', 
    cancelButtonColor: '#222',     
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#141414',         
    color: '#fff'                 
  });

  if (!result.isConfirmed) return;

  try {
    await deleteGenero(CodGenero);
    
    // Alerta de éxito
    Swal.fire({
      title: '¡Eliminado!',
      text: 'El género ha sido eliminado correctamente.',
      icon: 'success',
      confirmButtonColor: '#e50914',
      background: '#141414',
      color: '#fff',
      timer: 1500,
      showConfirmButton: false
    });

    cargarGeneros();
    if (generoEditando === CodGenero) limpiarFormulario();
  } catch (err) {
    console.error('Error al eliminar el género', err);
     const mensajeError = err instanceof Error 
      ? err.message 
      : 'No se pudo eliminar el género.';

    Swal.fire({
      title: 'No se puede eliminar',
      text: mensajeError, // Muestra el mensaje de error real
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
   <div className="admin-generos-container">
      
      <div className="admin-generos-header">
        <h2 className="admin-generos-title">
          Gestión de Géneros
        </h2>
      </div>

      {error && (
        <p className="admin-generos-error">
          {error}
        </p>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="admin-generos-form">
        <h3 className="admin-generos-form-title">
          {generoEditando ? ' Editar Género' : 'Agregar Nuevo Género'}
        </h3>
        
        <div>
          <label className="admin-generos-label">Nombre del Género:</label>
          <input
            type="text"
            placeholder="Ej: Acción, Comedia, Terror..."
            value={nombreGenero}
            onChange={(e) => setNombreGenero(e.target.value)}
            className="admin-generos-input"
          />
        </div>
        
        <div className="admin-generos-actions">
          <button 
            type="submit" 
            className="admin-generos-btn-submit"
          >
            {generoEditando ? 'Guardar Cambios' : 'Crear Género'}
          </button>
          
          {generoEditando && (
            <button 
              type="button" 
              onClick={limpiarFormulario}
              className="admin-generos-btn-cancel"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h3 className="admin-generos-list-title">
        Listado de Géneros
      </h3>

      {generos.length === 0 ? (
        <p className="admin-generos-empty">No hay géneros cargados.</p>
      ) : (
        <ul className="admin-generos-list">
          {generos.map((g) => (
            <li key={g.CodGenero} className="admin-generos-item">
              <span className="admin-generos-item-text">
                <strong className="admin-generos-item-id">#{g.CodGenero}</strong>
                {g.NombreGenero}
              </span>
              
              <div className="admin-generos-item-actions">
                <button 
                  onClick={() => handleEditar(g)}
                  className="admin-generos-btn-edit"
                >
                  Editar
                </button>

                <button 
                  onClick={() => handleDelete(g.CodGenero)}
                  className="admin-generos-btn-delete"
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