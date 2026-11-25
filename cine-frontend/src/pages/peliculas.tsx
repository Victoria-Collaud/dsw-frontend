import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePeliculas } from '../hooks/usePeliculas';
import type { Pelicula } from '../services/peliculaServices';
import { useGeneros } from '../hooks/useGeneros';
import { useFuncionesDisponiblesPorPeliculas } from '../hooks/useFunciones';
import Loader from '../components/Loader';
import '../pages/Peliculas.css';

// Función auxiliar para filtrar por género (Maneja si es objeto o número) 
const coincideGenero = (peli: Pelicula, filtro: string) => {
  if (typeof peli.genero === 'object' && peli.genero !== null) {
    return String((peli.genero as { CodGenero: number }).CodGenero) === filtro;
  }
  return String(peli.genero) === filtro;
};

export default function Peliculas() {
  
  const location = useLocation();

  const busquedaInicial = location.state?.busquedaInicial || '';
  const generoInicial = String(location.state?.generoInicial || '');

  const [textoBusqueda, setTextoBusqueda] = useState(() => busquedaInicial);
  const [filtroGenero, setFiltroGenero] = useState(() => generoInicial);
  const [textoDebounced, setTextoDebounced] = useState(() => busquedaInicial); 

  // actualizar el término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setTextoDebounced(textoBusqueda);
    }, textoBusqueda ? 400 : 0);

    return () => clearTimeout(timer);
  }, [textoBusqueda]);

  const { data: generos = [] } = useGeneros();

  const {
    data: peliculas = [],
    isLoading: cargandoPeliculas,
    isError: errorPeliculas,
  } = usePeliculas(textoDebounced);

  const peliculasMostradas = useMemo(
    () => peliculas
      .filter((peli) => peli.Activa !== false)
      .filter((peli) => filtroGenero === '' || coincideGenero(peli, filtroGenero)),
    [peliculas, filtroGenero]
  );

  // Funciones futuras y con capacidad para las películas obtenidas
  const idsPeliculas = peliculasMostradas
    .map((p) => p.IdPelicula)
    .filter((id): id is number => id !== undefined);

  const {
    data: funcionesPorPelicula = {},
    isLoading: cargandoFunciones,
  } = useFuncionesDisponiblesPorPeliculas(idsPeliculas);

  const obtenerNombreGenero = (genero: Pelicula['genero']) => {
    if (typeof genero === 'object' && genero !== null) {
      return genero.NombreGenero || 'Género desconocido';
    }
    const gen = generos.find((g) => g.CodGenero === genero);
    if (!gen) return 'Género desconocido';
    return gen.NombreGenero;
  };
  

  const cargando = cargandoPeliculas || (idsPeliculas.length > 0 && cargandoFunciones); 

  return (
    <div className="peliculas-container">

      <div className="peliculas-header">
        <h1 className="peliculas-titulo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clapperboard preview-icon"><path d="m12.296 3.464 3.02 3.956"/><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m6.18 5.276 3.1 3.899"/></svg> Cartelera
        </h1>
        <p className="peliculas-subtitulo">
          Explorá todas las películas disponibles y encontrá tu próxima función.
        </p>
      </div>

      {errorPeliculas && <p className="peliculas-error">Error al cargar datos.</p>} 

      {/* Controles de búsqueda y filtro */}
      <div className="peliculas-filtros">
        <input
          type="text"
          placeholder="Escribí el título de la película..."
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)} 
          className="peliculas-input-busqueda"
        />

        <select
          value={filtroGenero}
          onChange={(e) => setFiltroGenero(e.target.value)}
          className="peliculas-select-genero"
        >
          <option value="">Todos los géneros</option>
          {generos.map((g) => (
            <option key={g.CodGenero} value={g.CodGenero}>{g.NombreGenero}</option>
          ))}
        </select>
      </div>

      {cargando ? (
        <Loader mensaje="Cargando cartelera..." />
      ) : peliculasMostradas.length === 0 ? (
        <div className="peliculas-vacio">
          <p className="peliculas-vacio-texto">No se encontraron películas con esos filtros.</p>
        </div>
      ) : (
        <div className="peliculas-grid">
          {peliculasMostradas.map((peli) => {
            const tieneFunciones =
              peli.IdPelicula !== undefined &&
              Boolean(funcionesPorPelicula[peli.IdPelicula]?.length); 
            return (
              <Link key={peli.IdPelicula} to={`/pelicula/${peli.IdPelicula}`} className="peliculas-card-link">
                <div className={`peliculas-card ${!tieneFunciones ? 'sin-funciones' : ''}`}>
                  <div className="peliculas-card-poster-wrapper">
                    {peli.Cartelera ? (
                      <img src={peli.Cartelera} alt={peli.TituloPelicula} loading="lazy" className="peliculas-card-poster" />
                    ) : (
                      <div className="peliculas-card-sin-imagen">Sin imagen</div>
                    )}
                  </div>
                  
                  <div className="peliculas-card-body">
                    <h3 className="peliculas-card-titulo">{peli.TituloPelicula}</h3>
                    <p className="peliculas-card-meta">
                      {obtenerNombreGenero(peli.genero)} | {peli.Clasificacion || peli.Clasificacion}
                    </p>
                    
                    <div className="peliculas-card-footer">
                      {!tieneFunciones && (
                        <div className="peliculas-card-aviso-funciones">
                          SIN FUNCIONES DISPONIBLES
                        </div>
                      )}

                      <div className={`peliculas-card-btn ${!tieneFunciones ? 'deshabilitado' : ''}`}>
                        Ver Detalle
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}