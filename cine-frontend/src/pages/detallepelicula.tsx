import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPeliculaPorId } from '../services/peliculaServices';
import { getGeneros } from '../services/generosServices';
import { getFuncionesDePelicula } from '../services/funcionesServices';
import '../pages/DetallePelicula.css';

export default function DetallePelicula() {
  const { id } = useParams<{ id: string }>();
  const idPelicula = Number(id);
  const idValido = Number.isFinite(idPelicula) && idPelicula > 0;

  const {
    data: pelicula,
    isLoading: cargandoPelicula,
    isError: errorPelicula,
  } = useQuery({
    queryKey: ['peliculas', 'detalle', idPelicula],
    queryFn: () => getPeliculaPorId(idPelicula),
    enabled: idValido,
  });

  const {
    data: funciones = [],
    isLoading: cargandoFunciones,
  } = useQuery({
    queryKey: ['funciones', 'pelicula', idPelicula],
    queryFn: () => getFuncionesDePelicula(idPelicula),
    enabled: idValido,
  });

  const { data: generos = [] } = useQuery({
    queryKey: ['generos'],
    queryFn: getGeneros,
    staleTime: 1000 * 60 * 15,
  });

  const generoNombre = useMemo(() => {
    if (!pelicula) return 'Desconocido';
    if (typeof pelicula.genero === 'object' && pelicula.genero !== null) {
      return pelicula.genero.NombreGenero || 'Desconocido';
    }
    const gen = generos.find((g) => Number(g.CodGenero) === Number(pelicula.genero));
    return gen ? gen.NombreGenero : 'Desconocido';
  }, [pelicula, generos]);

    // FUNCIÓN PARA TRANSFORMAR LA URL DE YOUTUBE A EMBED
  const obtenerUrlEmbed = (url: string) => {
    if (!url) return null;

    // Si ya es una URL de embed, la devolvemos tal cual
    if (url.includes('/embed/')) return url;

    // Extraemos el ID del video de las URLs típicas de YouTube
    let videoId = '';
    if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (!idValido) {
    return (
      <div className="detalle-error-container">
        <p className="detalle-error-texto">ID de película inválido.</p>
        <Link to="/" className="detalle-error-link">Volver al inicio</Link>
      </div>
    );
  }

  if (cargandoPelicula || cargandoFunciones) {
    return <p className="detalle-cargando">Cargando detalle...</p>;
  }

  if (errorPelicula || !pelicula) {
    return (
      <div className="detalle-error-container">
        <p className="detalle-error-texto">No se pudo cargar la información de la película.</p>
        <Link to="/" className="detalle-error-link">Volver al inicio</Link>
      </div>
    );
  }

  const trailerEmbedUrl = obtenerUrlEmbed(pelicula.Trailer);
  const hoyStr = new Date().toISOString().split('T')[0];

  const funcionesVigentes = funciones.filter((func) => {
    const fechaFuncStr = new Date(func.Fecha).toISOString().split('T')[0];
    return fechaFuncStr >= hoyStr;
  });

  return (
    <div className="detalle-container">

      <Link to="/" className="detalle-volver-link">
        ← Volver a la cartelera
      </Link>

      <div className="detalle-hero">
        {pelicula.Cartelera ? (
          <img
            src={pelicula.Cartelera}
            alt={`Póster de ${pelicula.TituloPelicula}`}
            loading="lazy"
            className="detalle-poster"
          />
        ) : (
          <div className="detalle-sin-imagen">
            Sin imagen
          </div>
        )}

        <div className="detalle-info">
          <h1 className="detalle-titulo">{pelicula.TituloPelicula}</h1>

          <div className="detalle-meta">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-film preview-icon"><rect width="14" height="14" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>{' '}
              {generoNombre}
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock preview-icon"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>{' '}
              {pelicula.Duracion} min
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-exclamation-point preview-icon"><path d="M15 15H9a4 4 0 00-4 4v2"/><path d="M18.988 13v4"/><path d="M18.988 21h.01"/><circle cx="12" cy="7" r="4"/></svg>{' '}
              {pelicula.Clasificacion}
            </span>
          </div>

          <h3 className="detalle-sinopsis-titulo">Sinopsis</h3>
          <p className="detalle-sinopsis-texto">{pelicula.Sinopsis}</p>
        </div>
      </div>

      {/* SECCIÓN DEL TRAILER */}
      {trailerEmbedUrl && (
        <div className="detalle-trailer-section">
          <h3 className="detalle-seccion-titulo">Trailer</h3>
          <div className="detalle-trailer-wrapper">
            <iframe
              src={trailerEmbedUrl}
              title={`Trailer de ${pelicula.TituloPelicula}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="detalle-trailer-iframe"
            />
          </div>
        </div>
      )}

      <div className="detalle-funciones-header">
        <h3 className="detalle-funciones-titulo">
          Funciones Disponibles
        </h3>
      </div>

      {funcionesVigentes.length === 0 ? (
        <p className="detalle-sin-funciones">
          No hay funciones programadas para esta película por el momento.
        </p>
      ) : (
        <div className="detalle-funciones-lista">
          {funcionesVigentes.map((func) => {
            const fechaStr = new Date(func.Fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' });

            return (
              <div key={func.IdFuncion} className="detalle-funcion-card">
                <div>
                  <strong className="detalle-funcion-fecha">
                    {fechaStr} &nbsp;|&nbsp; {func.Horario}
                  </strong>
                  <small className="detalle-funcion-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-2 preview-icon"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>{' '}
                    {func.Idioma} &nbsp;|&nbsp;
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-monitor preview-icon"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>{' '}
                    {func.sala.TipoPantalla} &nbsp;|&nbsp;
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-armchair preview-icon"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>{' '}
                    {func.sala.TipoAsientos} &nbsp;|&nbsp;
                    <span className="detalle-funcion-disponibles"> {func.CapacidadDisponible} disponibles</span>
                  </small>
                </div>

                <Link
                  to={`/comprar/${func.IdFuncion}`}
                  className="detalle-comprar-btn"
                >
                  Comprar Entrada
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}