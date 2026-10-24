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
        // Traemos películas y géneros en paralelo
        const [pelisData, generosData] = await Promise.all([
          getPeliculas(),
          getGeneros()
        ]);
        setPeliculas(pelisData);
        setGeneros(generosData);

        // 2. Traemos las funciones de cada película
        const funcionesPromesas = pelisData.map(peli => 
          getFuncionesDePelicula(peli.IdPelicula!)
            .then(funcs => ({ id: peli.IdPelicula, funcs }))
            .catch(() => ({ id: peli.IdPelicula, funcs: [] })) // Si falla, asumimos que no tiene
        );
        const resultados = await Promise.all(funcionesPromesas);
      // 3. Armamos el diccionario { 1: [...], 2: [] }
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

  // Función para obtener el nombre del género a partir de su ID
const obtenerNombreGenero = (idGenero: number) => {
  const gen = generos.find(g => g.CodGenero === idGenero);
  return gen ? gen.NombreGenero : 'Género desconocido';
}; 

  if (cargando) return <p style={{ padding: '50px', textAlign: 'center' }}>Cargando cartelera...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Hero Section */}
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: '#9b59b6' }}>🍿 Bienvenido a mi Cine!</h1>
        <p style={{ fontSize: '1rem', color: '#666', marginBottom: '20px' }}>
          Disfrutá de la mejor cartelera. ¡Compra tus entradas ahora!
        </p>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        🌟 Cartelera:
      </h2>

      {peliculas.length === 0 ? (
        <p>No hay películas disponibles en este momento ¡Vuelva pronto!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
          {peliculas.slice(0, 8).map((peli) => {
            
            // 👇 1. VERIFICAMOS SI LA PELÍCULA TIENE FUNCIONES
            const tieneFunciones = funcionesPorPelicula[peli.IdPelicula!] && funcionesPorPelicula[peli.IdPelicula!].length > 0;

            return (
              // ENVOLVEMOS TODA LA TARJETA EN UN LINK
              <Link 
                key={peli.IdPelicula} 
                to={`/pelicula/${peli.IdPelicula}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={{ 
                    borderRadius: '10px', 
                    overflow: 'hidden',
                    backgroundColor: '#1e1e1e',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    cursor: 'pointer',
                    // 👇 Si no tiene funciones, bajamos la opacidad para que se note
                    opacity: tieneFunciones ? 1 : 0.7
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {/* Imagen */}
                  <div style={{ height: '300px', backgroundColor: '#333', position: 'relative' }}>
                    {peli.Cartelera ? (
                      <img 
                        src={peli.Cartelera} 
                        alt={`Póster de ${peli.TituloPelicula}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{peli.TituloPelicula}</h3>
                    <p style={{ margin: '0 0 15px 0', color: '#aaa', fontSize: '0.9rem' }}>
                      {obtenerNombreGenero(peli.genero)} | {peli.Clasificacion}
                    </p>
                    
                    <div style={{ marginTop: 'auto' }}>
                      
                      {/* 👇 2. CARTEL DE AGOTADA / SIN FUNCIONES */}
                      {!tieneFunciones && (
                        <div style={{ 
                          color: '#ff4d4d', 
                          fontWeight: 'bold', 
                          textAlign: 'center', 
                          marginBottom: '8px',
                          fontSize: '0.85rem'
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
                          // 👇 Cambia a gris si no hay funciones
                          backgroundColor: tieneFunciones ? '#ea5098' : '#555', 
                          color: 'white',
                          borderRadius: '5px',
                          fontWeight: 'bold'
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