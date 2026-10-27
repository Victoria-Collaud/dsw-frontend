import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPeliculas } from '../services/peliculaServices';
import type { Pelicula } from '../services/peliculaServices';
import { getGeneros } from '../services/generosServices';
import type { Genero } from '../services/generosServices';
import { getFuncionesDePelicula, type Funcion } from '../services/funcionesServices.ts';

export default function Inicio() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [funcionesPorPelicula, setFuncionesPorPelicula] = useState<Record<number, Funcion[]>>({});

  useEffect(() => {
    async function cargar() {
      try {
        const [pelisData, generosData] = await Promise.all([
          getPeliculas(),
          getGeneros()
        ]);
        setPeliculas(pelisData);
        setGeneros(generosData);

        const funcionesPromesas = pelisData.map(peli => 
          getFuncionesDePelicula(peli.IdPelicula!)
            .then(funcs => ({ id: peli.IdPelicula, funcs }))
            .catch(() => ({ id: peli.IdPelicula, funcs: [] }))
        );
        const resultados = await Promise.all(funcionesPromesas);
        const dict: Record<number, Funcion[]> = {}; 
        resultados.forEach(r => {
          if (r.id !== undefined) dict[r.id] = r.funcs;
        });
        setFuncionesPorPelicula(dict);

      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la cartelera.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const obtenerNombreGenero = (idGenero: number) => {
    const gen = generos.find(g => g.CodGenero === idGenero);
    return gen ? gen.NombreGenero : 'Género desconocido';
  }; 

  if (cargando) return <p style={{ padding: '60px', textAlign: 'center', color: '#888', backgroundColor: '#0b0c10', minHeight: '100vh', margin: 0 }}>Cargando cartelera...</p>;

  return (
    <div style={{ padding: '40px 20px', width: '100%', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box', backgroundColor: '#0b0c10', color: '#fff', minHeight: '100vh' }}>
      
{/* Hero Section */}
      <div style={{ textAlign: 'left', margin: '10px 0 35px 0', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '1.75rem', letterSpacing: '1px', margin: '0 0 8px 0', color: '#ffffff', textTransform: 'uppercase', fontWeight: '700', fontFamily: 'system-ui, sans-serif' }}>
          🍿 ¡Bienvenido a NewCine!
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
          Disfrutá de la mejor cartelera. ¡Comprá tus entradas ahora!
        </p>
      </div>

      {error && <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</p>}

      <div style={{ margin: '0 0 25px 0' }}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          ESTRENOS
        </h2>
      </div>

      {peliculas.length === 0 ? (
        <p style={{ color: '#888', padding: '20px 0' }}>No hay películas disponibles en este momento ¡Vuelva pronto!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px', marginTop: '15px' }}>
          {peliculas.slice(0, 8).map((peli) => {
            
            const tieneFunciones = funcionesPorPelicula[peli.IdPelicula!] && funcionesPorPelicula[peli.IdPelicula!].length > 0;

            return (
              <Link 
                key={peli.IdPelicula} 
                to={`/pelicula/${peli.IdPelicula}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
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
                    cursor: 'pointer',
                    opacity: tieneFunciones ? 1 : 0.6
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
{/* Imagen */}
                  <div style={{ height: '320px', backgroundColor: '#000', position: 'relative' }}>
                    {peli.Cartelera ? (
                      <img 
                        src={peli.Cartelera} 
                        alt={`Póster de ${peli.TituloPelicula}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#141414' }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#fff', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{peli.TituloPelicula}</h3>
                    <p style={{ margin: '0 0 15px 0', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {obtenerNombreGenero(peli.genero)} | {peli.Clasificacion || peli.Clasificacion}
                    </p>
                    
                    <div style={{ marginTop: 'auto' }}>
                      
                      {!tieneFunciones && (
                        <div style={{ 
                          color: '#ff4d4d', 
                          fontWeight: 'bold', 
                          textAlign: 'center', 
                          marginBottom: '10px',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px'
                        }}>
                          SIN FUNCIONES DISPONIBLES
                        </div>
                      )}

                      {/* Botón Ver Película */}
                      <div 
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          padding: '10px',
                          backgroundColor: tieneFunciones ? '#e50914' : '#222', 
                          color: 'white',
                          borderRadius: '2px',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}
                      >
                        Ver Película
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