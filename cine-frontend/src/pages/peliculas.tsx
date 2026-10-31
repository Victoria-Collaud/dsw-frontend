import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPeliculas, buscarPeliculaPorTitulo } from '../services/peliculaServices';
import type { Pelicula } from '../services/peliculaServices';
import { getGeneros } from '../services/generosServices';
import type { Genero } from '../services/generosServices';
import Loader from '../components/Loader';

export default function Peliculas() {
  const location = useLocation();

  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [cargando, setCargando] = useState(true); 
  const [error, setError] = useState('');
  
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
          pelisData = data.filter(p => coincideGenero(p, filtroGenero));
        } 
        // Caso B: Solo hay texto
        else if (textoBusqueda.trim() !== '') {
          pelisData = await buscarPeliculaPorTitulo(textoBusqueda);
        } 
        // Caso C: Solo hay género
        else if (filtroGenero !== '') {
          const todas = await getPeliculas();
          pelisData = todas.filter(p => coincideGenero(p, filtroGenero));
        } 
        // Caso D: No hay filtros
        else {
          pelisData = await getPeliculas();
        }
        if (activo) {
          setPeliculas(pelisData);
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
    <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#fff', backgroundColor: '#0b0c10', minHeight: '100vh' }}>
      
      <div style={{ margin: '10px 0 30px 0', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '1.75rem', letterSpacing: '1px', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '700', color: '#fff' }}>
          🎬 Cartelera
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
          Explorá todas las películas disponibles y encontrá tu próxima función.
        </p>
      </div>
      
      {error && <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</p>}

      {/* Controles de búsqueda y filtro */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '35px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Escribí el título de la película..." 
          value={textoBusqueda}
          onChange={e => {
            setTextoBusqueda(e.target.value);
            setCargando(true); 
          }}
          style={{ padding: '12px', flex: 1, minWidth: '250px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#141414', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
        />
        
        <select 
          value={filtroGenero} 
          onChange={e => setFiltroGenero(e.target.value)}
          style={{ padding: '12px', flex: 1, minWidth: '200px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#141414', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
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
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <p style={{ fontSize: '1.1rem', color: '#888' }}>No se encontraron películas con esos filtros.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
          {peliculasMostradas.map(peli => (
            <Link key={peli.IdPelicula} to={`/pelicula/${peli.IdPelicula}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div 
                style={{ 
                  borderRadius: '4px', 
                  overflow: 'hidden', 
                  backgroundColor: '#141414', 
                  border: '1px solid #222', 
                  transition: 'transform 0.2s ease, border-color 0.2s ease', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  cursor: 'pointer' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#e50914';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.borderColor = '#222';
                }}
              >
                <div style={{ height: '320px', backgroundColor: '#000', position: 'relative' }}>
                  {peli.Cartelera ? (
                    <img src={peli.Cartelera} alt={peli.TituloPelicula} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Sin imagen</div>
                  )}
                </div>
                
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#fff', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{peli.TituloPelicula}</h3>
                  <p style={{ margin: '0 0 15px 0', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {obtenerNombreGenero(peli.genero)} | {peli.Clasificacion || peli.Clasificacion}
                  </p>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'block', textAlign: 'center', padding: '10px', backgroundColor: '#e50914', color: 'white', borderRadius: '2px', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Ver Detalle
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}