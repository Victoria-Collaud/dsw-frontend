import { useEffect, useState, type FormEvent } from 'react'
import { getGeneros, createGenero, updateGenero, deleteGenero } from '../../services/generosServices'
import { type Genero } from '../../services/generosServices'
import Loader from '../../components/Loader';
import './AdminGenero.css'
import { useAlerta } from '../../hooks/useAlerta';

export default function AdminGeneros() {
  const [generos, setGeneros] = useState<Genero[]>([])
  const [nombreGenero, setNombreGenero] = useState('')
  const [generoEditando, setGeneroEditando] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true);
  const { alertaConfirmacion, alertaExito, alertaError, alertaAdvertencia } = useAlerta();

  useEffect(() => {
    cargarGeneros()
  }, )

  async function cargarGeneros() {
    setCargando(true);
    try {
      const data = await getGeneros()
      setGeneros(data)
    } catch {
      alertaError('Error de conexión', 'No se pudieron obtener los géneros. Por favor, intentá nuevamente.');
    } finally {
      setCargando(false); 
    }
  }

  function limpiarFormulario() {
    setNombreGenero('')
    setGeneroEditando(null)
  }

  function handleEditar(genero: Genero) {
    setNombreGenero(genero.NombreGenero)
    setGeneroEditando(genero.CodGenero!)
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nombreGenero.trim()) {
      alertaAdvertencia('Campos incompletos', 'El nombre del género es obligatorio.'); 
      return
    }
    try {
      if (generoEditando) {
        await updateGenero(generoEditando, { NombreGenero: nombreGenero })
        alertaExito('¡Actualizado!', 'El género fue actualizado correctamente.'); 
      } else {
        await createGenero({ NombreGenero: nombreGenero })
        alertaExito('¡Creado!', 'El género fue creado correctamente.');
      }
      limpiarFormulario()
      cargarGeneros()
    } catch (err) {
      console.error(err)
      const mensajeError = err instanceof Error ? err.message : 'Error al guardar el género.';
      alertaError('Error', mensajeError);
    }
  }

    async function handleDelete(CodGenero?: number) {
    if (!CodGenero) return;
    const confirmado = await alertaConfirmacion(
      '¿Estás seguro?', 
      '¿Seguro que querés eliminar este género?',
      'Si, elmininar'
    );
    if (!confirmado) return;
    try {
      await deleteGenero(CodGenero);
      alertaExito('¡Eliminado!', 'El género ha sido eliminado correctamente.');
      cargarGeneros();
      if (generoEditando === CodGenero) limpiarFormulario();
    } catch (err) {
      console.error('Error al eliminar el género', err);
      const mensajeError = err instanceof Error ? err.message : 'No se pudo eliminar el género.';
      alertaError('No se puede eliminar', mensajeError);
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