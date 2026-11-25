import { useState } from 'react'
import type { Pelicula } from '../../services/peliculaServices.ts'
import Loader from '../../components/Loader';
import './AdminPelicula.css'
import { useAlerta } from '../../hooks/useAlerta';
import { useForm } from 'react-hook-form';
import {
  useActualizarPelicula,
  useCambiarEstadoPelicula,
  useCrearPelicula,
  useEliminarPelicula,
  useTodasLasPeliculas,
} from '../../hooks/usePeliculas';

interface PeliculaFormData {
  TituloPelicula: string;
  Duracion: number;
  CodGenero: number;
  Clasificacion: string;
  Cartelera: string;
  Trailer: string;
  Sinopsis: string;
}

export default function AdminPeliculas() {

  const [peliculaEditando, setPeliculaEditando] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const { alertaConfirmacion, alertaExito, alertaError } = useAlerta();
  const {
    data: peliculas = [],
    isLoading: cargando,
    isError: errorCarga,
  } = useTodasLasPeliculas();
  const crearPeliculaMutation = useCrearPelicula();
  const actualizarPeliculaMutation = useActualizarPelicula();
  const eliminarPeliculaMutation = useEliminarPelicula();
  const cambiarEstadoPeliculaMutation = useCambiarEstadoPelicula();

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue 
  } = useForm<PeliculaFormData>({

   });

function limpiarFormulario() {
    reset(); 
    setPeliculaEditando(null)
  }

  function handleEditar(pelicula: Pelicula) {
    const idGenero = typeof pelicula.genero === 'object' 
    ? (pelicula.genero as { CodGenero: number }).CodGenero 
    : pelicula.genero;

    setValue('TituloPelicula', pelicula.TituloPelicula);
    setValue('Duracion', pelicula.Duracion);
    setValue('CodGenero', Number(idGenero));
    setValue('Clasificacion', pelicula.Clasificacion);
    setValue('Cartelera', pelicula.Cartelera);
    setValue('Trailer', pelicula.Trailer);
    setValue('Sinopsis', pelicula.Sinopsis);
    
    setPeliculaEditando(pelicula.IdPelicula!)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


    const onSubmit = async (data: PeliculaFormData) => {
    try {
      const peliculaData = { 
        TituloPelicula: data.TituloPelicula,
        Sinopsis: data.Sinopsis,
        Duracion: Number(data.Duracion),
        Clasificacion: data.Clasificacion,
        CodGenero: Number(data.CodGenero),
        Cartelera: data.Cartelera,
        Trailer: data.Trailer
      }
      if (peliculaEditando !== null) {
        await actualizarPeliculaMutation.mutateAsync({
          id: peliculaEditando,
          pelicula: peliculaData,
        });
        alertaExito('¡Actualizada!', 'La película fue actualizada correctamente.'); 
      } else {
        await crearPeliculaMutation.mutateAsync(peliculaData);
        alertaExito('¡Creada!', 'La película fue creada correctamente.'); 
      }
      limpiarFormulario()

    } catch (err) {
      console.error(err)
      const mensajeError = err instanceof Error ? err.message : 'Error al guardar la película.';
      alertaError('Error', mensajeError); 
    }
  }

   async function handleDelete(id?: number, tituloPelicula?: string) {
    if (id === undefined) return;
    const confirmado = await alertaConfirmacion(
      '¿Estás seguro?', 
      `¿Seguro que querés eliminar la película "${tituloPelicula || 'seleccionada'}"?`,
      'Si, eliminar'
    );
    if (!confirmado) return;
    try {
      await eliminarPeliculaMutation.mutateAsync(id);
      alertaExito('¡Eliminado!', 'La película ha sido eliminada correctamente.');

    } catch (error) {
      console.error('Error al borrar la película', error);
      const mensajeError = error instanceof Error ? error.message : 'No se pudo eliminar la película.';
      alertaError('No se puede eliminar', mensajeError);
    }
  }

  async function handleArchivar(pelicula: Pelicula) {
    const confirmado = await alertaConfirmacion(
      `¿${pelicula.Activa ? 'Archivar' : 'Desarchivar'} película?`,
      pelicula.Activa 
        ? `"${pelicula.TituloPelicula}" dejará de aparecer en la cartelera.`
        : `"${pelicula.TituloPelicula}" volverá a aparecer en la cartelera.`,
        'Confirmar'
    );
    if (!confirmado) return;
    try {
      await cambiarEstadoPeliculaMutation.mutateAsync(pelicula.IdPelicula!);
      alertaExito(
        '¡Listo!', 
        `La película fue ${pelicula.Activa ? 'archivada' : 'desarchivada'}.`
      );

    } catch (error) {
      console.error('Error al cambiar el estado de la película', error);
      const mensajeError = error instanceof Error ? error.message : 'No se pudo cambiar el estado.';
      alertaError('Error', mensajeError);
    }
  }

  const peliculasFiltradas = peliculas.filter((p) =>
    p.TituloPelicula?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (cargando) {
      return <Loader mensaje="Cargando películas..." />;
    }

  return (
   <div className="admin-pelicula-container">
      
      <div className="admin-pelicula-header">
        <h2 className="admin-pelicula-title">
          Administración de Películas
        </h2>
      </div>

      {errorCarga && (
        <p className="admin-pelicula-empty">
          No se pudieron obtener las películas. Por favor, intentá nuevamente.
        </p>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="admin-pelicula-form">
        <h3 className="admin-pelicula-form-title">
          {peliculaEditando !== null ? ' Editar Película' : ' Agregar Nueva Película'}
        </h3>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">Título:</label>
          <input 
            type="text" 
            placeholder="Ej: El Padrino, Matrix, Titanic..."
             {...register('TituloPelicula', { required: true })}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">Duración (minutos):</label>
          <input 
            type="number" 
            placeholder="Ej: 120"
            {...register('Duracion', { required: true, valueAsNumber: true })}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">ID del Género:</label>
          <input 
            type="number" 
            placeholder="Ej: 1"
             {...register('CodGenero', { required: true, valueAsNumber: true })}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">Clasificación:</label>
          <input 
            type="text" 
            placeholder="Ej: ATP, +13, +18"
            {...register('Clasificacion')}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">URL Cartelera (Imagen):</label>
          <input 
            type="text" 
            placeholder="Ej: https://example.com/cartelera.jpg"
            {...register('Cartelera')}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">URL Trailer:</label>
          <input 
            type="text" 
            placeholder="Ej: https://example.com/trailer.mp4"
            {...register('Trailer')}
            className="admin-pelicula-input" 
          />
        </div>

        <div className="admin-pelicula-field">
          <label className="admin-pelicula-label">Sinopsis:</label>
          <textarea 
            placeholder="Ej: Shrek es un ogro verde y solitario..."
            {...register('Sinopsis')}
            className="admin-pelicula-textarea" 
          />
        </div>

        <div className="admin-pelicula-actions">
          <button 
            type="submit" 
            disabled={crearPeliculaMutation.isPending || actualizarPeliculaMutation.isPending}
            className="admin-pelicula-btn-submit"
          >
            {crearPeliculaMutation.isPending || actualizarPeliculaMutation.isPending
              ? 'Guardando...'
              : peliculaEditando !== null
              ? 'Guardar Cambios'
              : 'Crear Película'}
          </button>
          
          {peliculaEditando !== null && (
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
                  disabled={cambiarEstadoPeliculaMutation.isPending}
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
                  disabled={eliminarPeliculaMutation.isPending}
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