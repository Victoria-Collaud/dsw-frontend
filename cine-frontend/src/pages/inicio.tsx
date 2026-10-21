import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPeliculas } from '../services/peliculaServices';
import type { Pelicula } from '../services/peliculaServices';
import { getGeneros } from '../services/generosServices';
import type { Genero } from '../services/generosServices';

export default function Inicio() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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
        <Link 
          to="/peliculas"
          style={{
            display: 'inline-block', padding: '12px 30px', backgroundColor: '#ea5098',
            color: 'white', textDecoration: 'none', borderRadius: '25px',
            fontWeight: 'bold', fontSize: '1.1rem'
          }}
        >
          Ver todas las películas
        </Link>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        🌟 Cartelera:
      </h2>

      {peliculas.length === 0 ? (
        <p>No hay películas disponibles en este momento ¡Vuelva pronto!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
          {peliculas.slice(0, 8).map((peli) => (
            
            // ENVOLVEMOS TODA LA TARJETA EN UN LINK
            <Link 
              key={peli.IdPelicula} 
              to={`/pelicula/${peli.IdPelicula}`}
              style={{ textDecoration: 'none', color: 'inherit' }} // Para que no se vea subrayado ni cambie el color del texto
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
                  height: '100%', // Para que todas las tarjetas midan lo mismo
                  cursor: 'pointer' // Para que el mouse se vuelva una manito
                }}
                // Efecto hover (opcional)
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
                    {/* 👇 2. EL BOTÓN AHORA TAMBIÉN LLEVA AL DETALLE */}
                    <div 
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '10px',
                        backgroundColor: '#ea5098',
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
          ))}
        </div>
      )}
    </div>
  );
}