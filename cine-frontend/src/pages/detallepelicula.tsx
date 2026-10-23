import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPeliculas } from '../services/peliculaServices';
import type { Pelicula } from '../services/peliculaServices';
import { getGeneros } from '../services/generosServices'; 
import { getFuncionesDePelicula } from '../services/funcionesServices';
import type { Funcion } from '../services/funcionesServices';

export default function DetallePelicula() {
  const { id } = useParams<{ id: string }>();
  const idPelicula = Number(id);

  const [pelicula, setPelicula] = useState<Pelicula | null>(null);
  const [generoNombre, setGeneroNombre] = useState<string>('Desconocido');
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
   async function cargar() {
      setCargando(true);
      setError('');
      try {
        // 1. Cargamos películas y géneros en paralelo
        const [todasPelis, generosData] = await Promise.all([
          getPeliculas(),
          getGeneros() 
        ]);
        
        const peliEncontrada = todasPelis.find(p => p.IdPelicula === idPelicula);
        if (!peliEncontrada) throw new Error('Película no encontrada');

        setPelicula(peliEncontrada);

        const idGen = peliEncontrada.genero; 
        const gen = generosData.find(g => Number(g.CodGenero) === Number(idGen));
        if (gen) {
          setGeneroNombre(gen.NombreGenero);
        }

        // 2. Intentamos cargar las funciones por separado para que si falla/no hay, no rompa la página
        try {
          const funcsData = await getFuncionesDePelicula(idPelicula);
          setFunciones(funcsData || []);
        } catch (funcErr) {
          console.warn('No hay funciones o la API devolvió error:', funcErr);
          setFunciones([]); // Dejamos el array vacío para que active el mensaje de "No hay funciones"
        }

      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información de la película.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [idPelicula]);

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

  if (cargando) {
    return <p style={{ padding: '40px', textAlign: 'center' }}>Cargando detalle...</p>;
  }

  if (error || !pelicula) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red', marginBottom: '20px' }}>{error || 'Película no encontrada.'}</p>
        <Link to="/" style={{ color: '#9b59b6' }}>Volver al inicio</Link>
      </div>
    );
  }

  const trailerEmbedUrl = obtenerUrlEmbed(pelicula.Trailer);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', color: '#fff' }}>
      <Link to="/" style={{ color: '#9b59b6', textDecoration: 'none', fontWeight: 'bold' }}>
        ← Volver a la cartelera
      </Link>
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {pelicula.Cartelera && (
          <img 
            src={pelicula.Cartelera} 
            alt={`Póster de ${pelicula.TituloPelicula}`} 
            style={{ width: '200px', borderRadius: '10px', objectFit: 'cover' }}
          />
        )}
        
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h1 style={{ marginTop: 0, marginBottom: '10px' }}>{pelicula.TituloPelicula}</h1>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', color: '#aaa', fontSize: '0.9em' }}>
            <span>🎭 {generoNombre}</span>
            <span>⏱️ {pelicula.Duracion} min</span>
            <span>⚠️ {pelicula.Clasificacion}</span>
          </div>

          <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginTop: '20px' }}>Sinopsis</h3>
          <p style={{ lineHeight: '1.6', color: '#ddd', marginBottom: '0' }}>{pelicula.Sinopsis}</p>
        </div>
      </div>

      {/* SECCIÓN DEL TRAILER */}
      {trailerEmbedUrl && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>🎬 Trailer</h3>
          <div style={{ 
            position: 'relative', 
            paddingBottom: '56.25%', // Esto mantiene la proporción 16:9 del video
            height: 0, 
            overflow: 'hidden', 
            borderRadius: '10px',
            marginTop: '15px'
          }}>
            <iframe 
              src={trailerEmbedUrl}
              title={`Trailer de ${pelicula.TituloPelicula}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                border: 0 
              }}
            />
          </div>
        </div>
      )}

      <hr style={{ margin: '30px 0', borderColor: '#333' }} />

     <h3>🎟️ Funciones Disponibles</h3>
      {(() => {
        // Obtenemos la fecha de hoy en formato 'YYYY-MM-DD' local
        const hoyStr = new Date().toISOString().split('T')[0];

        const funcionesVigentes = funciones.filter(func => {
          // Extraemos la parte de la fecha (YYYY-MM-DD) tal como viene de la base
          const fechaFuncStr = new Date(func.Fecha).toISOString().split('T')[0];
          // Comparamos cadenas de texto directamente (ej: "2026-06-15" >= "2026-10-23")
          return fechaFuncStr >= hoyStr;
        });
if (!funciones || funciones.length === 0) {
          return <p style={{ color: '#aaa', fontStyle: 'italic', marginTop: '10px' }}>No hay funciones programadas para esta película por el momento.</p>;
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            {funcionesVigentes.map(func => {
              const fechaStr = new Date(func.Fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' });
              
              return (
                <div key={func.IdFuncion} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px', 
                  border: '1px solid #444', 
                  borderRadius: '8px',
                  backgroundColor: '#1e1e1e',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  <div>
                    <strong style={{ fontSize: '1.1em', display: 'block', marginBottom: '5px' }}>
                      📅 {fechaStr} 🕒 {func.Horario}
                    </strong>
                    <small style={{ color: '#aaa' }}>
                      🗣️ {func.Idioma} | 🏛️ Sala #{func.sala.NumSala} | 💺 {func.CapacidadDisponible} disponibles
                    </small>
                  </div>
                  
                  <Link 
                    to={`/comprar/${func.IdFuncion}`}
                    style={{ 
                      padding: '10px 25px', 
                      backgroundColor: '#2ecc71', 
                      color: 'white', 
                      textDecoration: 'none', 
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      display: 'inline-block',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2ecc71'}
                  >
                    Comprar Entrada
                  </Link>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
