import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPeliculas, buscarPeliculaPorTitulo } from '../services/peliculaServices';
import type { Pelicula } from '../services/peliculaServices';
import { getGeneros } from '../services/generosServices';
import type { Genero } from '../services/generosServices';

export default function Peliculas() {
  const location = useLocation();


  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  // Arranca en true porque la carga inicial se hace al montar
  const [cargando, setCargando] = useState(true); 
  const [error, setError] = useState('');
  
const busquedaInicial = location.state?.busquedaInicial || '';
const generoInicial = String(location.state?.generoInicial || '');

const [textoBusqueda, setTextoBusqueda] = useState(
  () => busquedaInicial
);

const [filtroGenero, setFiltroGenero] = useState(
  () => generoInicial
);

 
// 1. Cargamos los géneros
  useEffect(() => {
    getGeneros().then(setGeneros).catch(console.error);
  }, []);

  // 2. Efecto con Debounce (Sin setCargando(true) al principio)
  useEffect(() => {
    let activo = true; // Para evitar actualizar estado en componente desmontado


    async function cargar() {
      try {
        if (textoBusqueda.trim() === '') {
          const data = await getPeliculas();
          if (activo) setPeliculas(data);
        } else {
          // Esperamos 400ms antes de buscar
          await new Promise((resolve) => setTimeout(resolve, 400));
          const data = await buscarPeliculaPorTitulo(textoBusqueda);
          if (activo) setPeliculas(data);
        }
      } catch {
        if (activo) setError('Error al buscar películas.');
      } finally {
        // 👇 PONEMOS setCargando(false) AL FINAL
        if (activo) setCargando(false); 
      }
    }
    cargar();
    // Cleanup: si el usuario sigue tipeando, cancelamos esta ejecución
    return () => {
      activo = false;
    };
  }, [textoBusqueda]);

  const obtenerNombreGenero = (idGenero: number) => {
    const gen = generos.find(g => g.CodGenero === idGenero);
    return gen ? gen.NombreGenero : 'Género desconocido';
  };

  const peliculasMostradas = useMemo(() => {
    if (filtroGenero === '') return peliculas;
    return peliculas.filter(peli => String(peli.genero) === filtroGenero);
  }, [peliculas, filtroGenero]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#fff' }}>
      <h1>🎬 Cartelera</h1>
      
      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Escribí el título de la película..." 
          value={textoBusqueda}
          // ACÁ ACTIVAMOS EL CARGANDO CUANDO EL USUARIO TIPEA
          onChange={e => {
            setTextoBusqueda(e.target.value);
            setCargando(true); 
          }}
          style={{ padding: '10px', flex: 1, minWidth: '250px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff' }}
        />
        
        <select 
          value={filtroGenero} 
          onChange={e => setFiltroGenero(e.target.value)}
          style={{ padding: '10px', flex: 1, minWidth: '200px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff' }}
        >
          <option value="">Todos los géneros</option>
          {generos.map(g => (
            <option key={g.CodGenero} value={g.CodGenero}>{g.NombreGenero}</option>
          ))}
        </select>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', marginTop: '40px' }}>Buscando películas...</p>
      ) : peliculasMostradas.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontSize: '1.2rem', color: '#aaa' }}>No se encontraron películas con esos filtros.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
          {/* ... el map de películas queda exactamente igual que antes ... */}
          {peliculasMostradas.map(peli => (
            <Link key={peli.IdPelicula} to={`/pelicula/${peli.IdPelicula}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: '#1e1e1e', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ height: '320px', backgroundColor: '#333', position: 'relative' }}>
                  {peli.Cartelera ? <img src={peli.Cartelera} alt={peli.TituloPelicula} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Sin imagen</div>}
                </div>
                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{peli.TituloPelicula}</h3>
                  <p style={{ margin: '0 0 15px 0', color: '#aaa', fontSize: '0.9rem' }}>🎭 {obtenerNombreGenero(peli.genero)} | ⚠️ {peli.Clasificacion}</p>
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'block', textAlign: 'center', padding: '10px', backgroundColor: '#ea5098', color: 'white', borderRadius: '5px', fontWeight: 'bold' }}>Ver Detalle</div>
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