import { useState, useEffect } from 'react'
import { getPeliculas, createPelicula, deletePelicula, updatePelicula, cambiarEstadoPelicula } from '../../services/peliculaServices.ts'
import type { Pelicula } from '../../services/peliculaServices.ts'
import type { FormEvent } from 'react'
import Loader from '../../components/Loader';
import Swal from 'sweetalert2'
import './AdminPelicula.css'

export default function AdminPeliculas() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([])
  const [tituloPelicula, setTituloPelicula] = useState('')
  const [sinopsis, setSinopsis] = useState('')
  const [duracion, setDuracion] = useState<string>('')
  const [clasificacion, setClasificacion] = useState('')
  const [codGenero, setCodGenero] = useState<string>('')
  const [cartelera, setCartelera] = useState('')
  const [trailer, setTrailer] = useState('')
  const [peliculaEditando, setPeliculaEditando] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPeliculas()
  }, [])

  async function cargarPeliculas() {
    setError('')
    setCargando(true);
    try {
      const data = await getPeliculas()
      setPeliculas(data)
    } catch  {
      setError('No se pudieron obtener las películas.')
    } finally {
      setCargando(false); 
  } }

  function limpiarFormulario() {
    setTituloPelicula('')
    setSinopsis('')
    setDuracion('')
    setClasificacion('')
    setCodGenero('')
    setCartelera('')
    setTrailer('')
    setPeliculaEditando(null)
    setError('')
  }

  function handleEditar(pelicula: Pelicula) {
    const idGenero = typeof pelicula.genero === 'object' 
    ? (pelicula.genero as { CodGenero: number }).CodGenero 
    : pelicula.genero;

    setTituloPelicula(pelicula.TituloPelicula)
    setSinopsis(pelicula.Sinopsis)
    setDuracion(String(pelicula.Duracion))
    setClasificacion(pelicula.Clasificacion)
    setCodGenero(String(idGenero))
    setCartelera(pelicula.Cartelera)
    setTrailer(pelicula.Trailer)
    setPeliculaEditando(pelicula.IdPelicula!)
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!tituloPelicula.trim() || !duracion || !codGenero) {
      setError('Por favor completá los campos obligatorios (Título, Duración y Género).')
      return
    }
    try {
      const peliculaData = {
        TituloPelicula: tituloPelicula,
        Sinopsis: sinopsis,
        Duracion: Number(duracion),
        Clasificacion: clasificacion,
        CodGenero: Number(codGenero),
        Cartelera: cartelera,
        Trailer: trailer
      }
      if (peliculaEditando) {
        await updatePelicula(peliculaEditando, peliculaData)
      } else {
        await createPelicula(peliculaData)
      }
      limpiarFormulario()
      cargarPeliculas()
    } catch (err) {
       if (err instanceof Error) {
        setError(err.message); 
      } else {
        setError('Error al crear la película.');
      }
    }
  }

 async function handleDelete(id?: number, tituloPelicula?: string) {
  if (!id) return;

  
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Seguro que querés eliminar la película "${tituloPelicula || 'seleccionada'}"?`,
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
    await deletePelicula(id);
    
    // Alerta de éxito 
    Swal.fire({
      title: '¡Eliminado!',
      text: 'La película ha sido eliminada correctamente.',
      icon: 'success',
      confirmButtonColor: '#e50914',
      background: '#141414',
      color: '#fff',
      timer: 1500,
      showConfirmButton: false
    });
  
    cargarPeliculas();
  } catch (error) {
    console.error('Error al borrar la película', error);

    // ALERTA DE ERROR ESPECÍFICA
    const mensajeError = error instanceof Error 
      ? error.message 
      : 'No se pudo eliminar la película.';

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

async function handleArchivar(pelicula: Pelicula) {
  const accion = pelicula.Activa ? 'archivar' : 'desarchivar';
  
  const result = await Swal.fire({
    title: `¿${pelicula.Activa ? 'Archivar' : 'Desarchivar'} película?`,
    text: pelicula.Activa 
      ? `"${pelicula.TituloPelicula}" dejará de aparecer en la cartelera.`
      : `"${pelicula.TituloPelicula}" volverá a aparecer en la cartelera.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#e50914',
    cancelButtonColor: '#222',
    confirmButtonText: `Sí, ${accion}`,
    cancelButtonText: 'Cancelar',
    background: '#141414',
    color: '#fff'
  });

  if (!result.isConfirmed) return;

  try {
    await cambiarEstadoPelicula(pelicula.IdPelicula!);
    Swal.fire({
      title: '¡Listo!',
      text: `La película fue ${pelicula.Activa ? 'archivada' : 'desarchivada'}.`,
      icon: 'success',
      confirmButtonColor: '#e50914',
      background: '#141414',
      color: '#fff',
      timer: 1500,
      showConfirmButton: false
    });
    cargarPeliculas();
  } catch (error) {
    const mensajeError = error instanceof Error ? error.message : 'No se pudo cambiar el estado.';
    Swal.fire({
      title: 'Error',
      text: mensajeError,
      icon: 'error',
      confirmButtonColor: '#e50914',
      background: '#141414',
      color: '#fff'
    });
  }
}

  const peliculasFiltradas = peliculas.filter((p) =>
    p.TituloPelicula?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (cargando) {
      return <Loader mensaje="Cargando funciones..." />;
    }

  return (
   <div className="admin-pelicula-container">
      
      <div className="admin-pelicula-header">
        <h2 className="admin-pelicula-title">
          Administración de Películas
        </h2>
      </div>

      {error && (
        <p className="admin-peliculas-error">
          {error}
        </p>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="admin-pelicula-form">
        <h3 className="admin-pelicula-form-title">
          {peliculaEditando ? ' Editar Película' : ' Agregar Nueva Película'}
        </h3>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">Título:</label>
          <input 
            type="text" 
            placeholder="Ej: El Padrino, Matrix, Titanic..."
            value={tituloPelicula} 
            onChange={(e) => setTituloPelicula(e.target.value)}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">Duración (minutos):</label>
          <input 
            type="number" 
            placeholder="Ej: 120"
            value={duracion} 
            onChange={(e) => setDuracion(e.target.value)}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">ID del Género:</label>
          <input 
            type="number" 
            placeholder="Ej: 1"
            value={codGenero} 
            onChange={(e) => setCodGenero(e.target.value)}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">Clasificación:</label>
          <input 
            type="text" 
            placeholder="Ej: ATP, +13, +18"
            value={clasificacion} 
            onChange={(e) => setClasificacion(e.target.value)}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">URL Cartelera (Imagen):</label>
          <input 
            type="text" 
            placeholder="Ej: https://example.com/cartelera.jpg"
            value={cartelera} 
            onChange={(e) => setCartelera(e.target.value)}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">URL Trailer:</label>
          <input 
            type="text" 
            placeholder="Ej: https://example.com/trailer.mp4"
            value={trailer} 
            onChange={(e) => setTrailer(e.target.value)}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">Sinopsis:</label>
          <textarea 
            placeholder="Ej: Shrek es un ogro verde y solitario..."
            value={sinopsis} 
            onChange={(e) => setSinopsis(e.target.value)}
            className="admin-pelicula-textarea" 
          />
        </div>

        <div className="admin-pelicula-actions">
          <button 
            type="submit" 
            className="admin-pelicula-btn-submit"
          >
            {peliculaEditando ? 'Guardar Cambios' : 'Crear Película'}
          </button>
          
          {peliculaEditando && (
            <button 
              type="button" 
              onClick={limpiarFormulario}
              className="admin-pelicula-btn-cancel"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Búsqueda */}
      <div className="admin-pelicula-search-section">
        <h3 className="admin-pelicula-search-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg> Buscar Película
        </h3>
        <input
          type="text"
          placeholder="Escribí el título para filtrar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="admin-pelicula-search-input"
        />
      </div>

      {/* Lista de Películas */}
      <h3 className="admin-pelicula-list-title">
        Listado de Películas
      </h3>

      {peliculasFiltradas.length === 0 ? (
        <p className="admin-pelicula-empty">No se encontraron películas.</p>
      ) : (
        <ul className="admin-pelicula-list">
          {peliculasFiltradas.map((p) => (
            <li 
              key={p.IdPelicula} 
              className="admin-pelicula-item"
              style={{ opacity: p.Activa === false ? 0.6 : 1 }}
            >
              <div className="admin-pelicula-item-info">
                <strong>
                  <span className="admin-pelicula-item-id">#{p.IdPelicula}</span>
                  {p.TituloPelicula}
                </strong> 
                <span className="admin-pelicula-item-duracion">
                  ({p.Duracion} min)
                </span>
                
                {/* BADGE DE ARCHIVADA */}
                {p.Activa === false && (
                  <span className="admin-pelicula-badge-archivada">
                    ARCHIVADA
                  </span>
                )}
                    
                <br />
                <small className="admin-pelicula-item-clasificacion">
                  Clasificación: {p.Clasificacion || 'N/A'}
                </small>
              </div>

              <div className="admin-pelicula-item-actions">
                {/* BOTÓN ARCHIVAR/DESARCHIVAR */}
                <button 
                  onClick={() => handleArchivar(p)}
                  className={`admin-pelicula-btn-archivar ${p.Activa ? 'activa' : 'inactiva'}`}
                >
                  {p.Activa ? 'Archivar' : 'Desarchivar'}
                </button>

                <button 
                  onClick={() => handleEditar(p)}
                  className="admin-pelicula-btn-edit"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(p.IdPelicula, p.TituloPelicula)}
                  className="admin-pelicula-btn-delete"
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