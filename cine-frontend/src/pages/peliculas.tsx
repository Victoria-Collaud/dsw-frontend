import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; 
import { getPeliculasActivas, buscarPeliculaPorTitulo } from '../services/peliculaServices';
import type { Pelicula } from '../services/peliculaServices';
import { getGeneros } from '../services/generosServices';

import Loader from '../components/Loader';
import { getFuncionesDePelicula, type Funcion } from '../services/funcionesServices.ts';
import '../pages/Peliculas.css';

// Función auxiliar para filtrar por género (Manejando si es objeto o número) 
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

  // Géneros con useQuery
  const { data: generos = [] } = useQuery({
    queryKey: ['generos'],
    queryFn: getGeneros,
    staleTime: 1000 * 60 * 15,
  });

  //Películas según búsqueda y filtro de género
  const {
    data: peliculas = [],
    isLoading: cargandoPeliculas,
    isError: errorPeliculas,
  } = useQuery({
    queryKey: ['peliculas', 'cartelera', { busqueda: textoDebounced.trim(), genero: filtroGenero }],
    queryFn: async () => {
      const termino = textoDebounced.trim();

      if (termino !== '' && filtroGenero !== '') {
        const data = await buscarPeliculaPorTitulo(termino);
        return data
          .filter((p) => coincideGenero(p, filtroGenero))
          .filter((p) => p.Activa !== false);
      }

      if (termino !== '') {
        const data = await buscarPeliculaPorTitulo(termino);
        return data.filter((p) => p.Activa !== false);
      }

      if (filtroGenero !== '') {
        const todas = await getPeliculasActivas();
        return todas.filter((p) => coincideGenero(p, filtroGenero));
      }

      return getPeliculasActivas();
    },
  });

  //  Funciones futuras y con capacidad para las películas obtenidas
  const idsPeliculas = peliculas
    .map((p) => p.IdPelicula)
    .filter((id): id is number => id !== undefined);

  const {
    data: funcionesPorPelicula = {},
    isLoading: cargandoFunciones,
  } = useQuery({
    queryKey: ['funciones', 'peliculas', idsPeliculas],
    enabled: idsPeliculas.length > 0,
    queryFn: async () => {
      const ahora = new Date();
      const resultados = await Promise.all(
        peliculas.map(async (peli) => {
          if (peli.IdPelicula === undefined) {
            return { id: undefined, funcs: [] as Funcion[] };
          }
          try {
            const funcs = await getFuncionesDePelicula(peli.IdPelicula);
            const funcionesValidas = funcs.filter((func) => {
              const fechaHora = new Date(`${func.Fecha.split('T')[0]}T${func.Horario}`);
              const esFutura = fechaHora > ahora;
              const tieneCapacidad = (func.CapacidadDisponible ?? 0) > 0;
              return esFutura && tieneCapacidad;
            });
            return { id: peli.IdPelicula, funcs: funcionesValidas };
          } catch {
            return { id: peli.IdPelicula, funcs: [] as Funcion[] };
          }
        })
      );

      const dict: Record<number, Funcion[]> = {};
      resultados.forEach((r) => {
        if (r.id !== undefined) {
          dict[r.id] = r.funcs;
        }
      });
      return dict;
    },
  });

  const obtenerNombreGenero = (genero: Pelicula['genero']) => {
    if (typeof genero === 'object' && genero !== null) {
      return genero.NombreGenero || 'Género desconocido';
    }
    const gen = generos.find((g) => g.CodGenero === genero);
    if (!gen) return 'Género desconocido';
    return gen.NombreGenero;
  };

  // Filtramos para mostrar (asegura respuesta instantánea al cambiar el select de género)
  const peliculasMostradas = useMemo(() => {
    if (filtroGenero === '') return peliculas;
    return peliculas.filter((peli) => coincideGenero(peli, filtroGenero));
  }, [peliculas, filtroGenero]);

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