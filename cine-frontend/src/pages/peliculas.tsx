import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPeliculasActivas, buscarPeliculaPorTitulo } from '../services/peliculaServices';
import type { Pelicula } from '../services/peliculaServices';
import { getGeneros } from '../services/generosServices';
import type { Genero } from '../services/generosServices';
import Loader from '../components/Loader';
import { getFuncionesDePelicula, type Funcion } from '../services/funcionesServices.ts';
export default function Peliculas() {
  const location = useLocation();

  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [cargando, setCargando] = useState(true); 
  const [error, setError] = useState('');

  const [funcionesPorPelicula, setFuncionesPorPelicula] = useState<Record<number, Funcion[]>>({});
  
  const busquedaInicial = location.state?.busquedaInicial || '';
  const generoInicial = String(location.state?.generoInicial || '');

  const [textoBusqueda, setTextoBusqueda] = useState(() => busquedaInicial);
  const [filtroGenero, setFiltroGenero] = useState(() => generoInicial);

  // Cargamos los géneros una sola vez
  useEffect(() => {
    getGeneros().then(setGeneros).catch(console.error);
  }, []);

  // Función auxiliar para filtrar por género (Manejando si es objeto o número)
  const coincideGenero = (peli: Pelicula, filtro: string) => {
    if (typeof peli.genero === 'object' && peli.genero !== null) {
      return String((peli.genero as { CodGenero: number }).CodGenero) === filtro;
    }
    return String(peli.genero) === filtro;
  };

  // Efecto unificado para la búsqueda
  useEffect(() => {
    let activo = true;

    async function cargarTodo() {
      setCargando(true);
      setError('');
      try {
        let pelisData: Pelicula[] = [];
        // Caso A: Hay texto y género
        if (textoBusqueda.trim() !== '' && filtroGenero !== '') {
          const data = await buscarPeliculaPorTitulo(textoBusqueda);
          pelisData = data //doble filtro
          .filter(p => coincideGenero(p, filtroGenero)) 
          .filter(p => p.Activa !== false);              
        } 
        // Caso B: Solo hay texto
        else if (textoBusqueda.trim() !== '') {
          pelisData = await buscarPeliculaPorTitulo(textoBusqueda);
          pelisData = pelisData.filter(p => p.Activa !== false);
        } 
        // Caso C: Solo hay género
        else if (filtroGenero !== '') {
          const todas = await getPeliculasActivas();
          pelisData = todas.filter(p => coincideGenero(p, filtroGenero));
        } 
        // Caso D: No hay filtros
        else {
          pelisData = await getPeliculasActivas();
        }
        if (activo) {
          setPeliculas(pelisData);
          const funcionesPromesas = pelisData.map(async (peli) => {
  try {
    const funcs = await getFuncionesDePelicula(peli.IdPelicula!);
    const ahora = new Date();
    const funcionesValidas = funcs.filter(func => {
      const fechaHora = new Date(`${func.Fecha.split('T')[0]}T${func.Horario}`);
      const esFutura = fechaHora > ahora;
      const tieneCapacidad = (func.CapacidadDisponible ?? 0) > 0;
      return esFutura && tieneCapacidad;
    });
    return { id: peli.IdPelicula!, funcs: funcionesValidas };
  } catch {
    return { id: peli.IdPelicula!, funcs: [] as Funcion[] };
  }
});
const resultados = await Promise.all(funcionesPromesas);
const dict: Record<number, Funcion[]> = {}; 
resultados.forEach(r => {
  if (r.id !== undefined) { dict[r.id] = r.funcs; }
});
setFuncionesPorPelicula(dict);
        }
      } catch (err) {
        console.error(err);
        if (activo) setError('Error al cargar datos.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    const timer = setTimeout(() => {
      cargarTodo();
    }, textoBusqueda ? 400 : 0);

    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [textoBusqueda, filtroGenero]); // Depende de ambos filtros

  const obtenerNombreGenero = (genero: number | { CodGenero: number; NombreGenero?: string }) => {
    if (typeof genero === 'object' && genero !== null) {
      return genero.NombreGenero || 'Género desconocido';
    }
    const gen = generos.find(g => g.CodGenero === genero);
    if (!gen) return 'Género desconocido';
    return gen.NombreGenero;
  };

  // Filtramos para mostrar (aunque el useEffect ya trae filtrado, esto asegura que el select filtre al instante)
  const peliculasMostradas = useMemo(() => {
    if (filtroGenero === '') return peliculas;
    return peliculas.filter(peli => coincideGenero(peli, filtroGenero));
  }, [peliculas, filtroGenero]);

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
      
      {error && <p className="peliculas-error">{error}</p>}

      {/* Controles de búsqueda y filtro */}
      <div className="peliculas-filtros">
        <input 
          type="text" 
          placeholder="Escribí el título de la película..." 
          value={textoBusqueda}
          onChange={e => {
            setTextoBusqueda(e.target.value);
            setCargando(true); 
          }}
          className="peliculas-input-busqueda"
        />
        
        <select 
          value={filtroGenero} 
          onChange={e => setFiltroGenero(e.target.value)}
          className="peliculas-select-genero"
        >
          <option value="">Todos los géneros</option>
          {generos.map(g => (
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
          {peliculasMostradas.map(peli => {
            const tieneFunciones = funcionesPorPelicula[peli.IdPelicula!] && funcionesPorPelicula[peli.IdPelicula!].length > 0;

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