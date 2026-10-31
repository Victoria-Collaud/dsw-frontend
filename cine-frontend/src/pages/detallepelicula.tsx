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
        // Cargamos películas y géneros en paralelo
        const [todasPelis, funcsData, generosData] = await Promise.all([
          getPeliculas(),
          getFuncionesDePelicula(idPelicula),
          getGeneros() 
        ]);
        
        const peliEncontrada = todasPelis.find(p => p.IdPelicula === idPelicula);
        if (!peliEncontrada) throw new Error('Película no encontrada');

        setPelicula(peliEncontrada);
        setFunciones(funcsData); 

        const idGen = peliEncontrada.genero; 
        const gen = generosData.find(g => Number(g.CodGenero) === Number(idGen));
        if (gen) {
          setGeneroNombre(gen.NombreGenero);
        }

        // Intentamos cargar las funciones por separado para que si falla/no hay, no rompa la página
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
    return <p style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Cargando detalle...</p>;
  }

  if (error || !pelicula) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#0b0c10', minHeight: '100vh', color: '#fff' }}>
        <p style={{ color: '#ff4d4d', marginBottom: '20px' }}>{error || 'Película no encontrada.'}</p>
        <Link to="/" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 'bold' }}>Volver al inicio</Link>
      </div>
    );
  }

  const trailerEmbedUrl = obtenerUrlEmbed(pelicula.Trailer);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#fff', backgroundColor: '#0b0c10', minHeight: '100vh' }}>
      
      <Link to="/" style={{ color: '#888', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', display: 'inline-block', marginBottom: '25px', transition: 'color 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
      >
        ← Volver a la cartelera
      </Link>
      
      <div style={{ display: 'flex', gap: '35px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {pelicula.Cartelera ? (
          <img 
            src={pelicula.Cartelera} 
            alt={`Póster de ${pelicula.TituloPelicula}`} loading="lazy"
            style={{ width: '220px', height: '330px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #222' }}
          />
        ) : (
          <div style={{ width: '220px', height: '330px', backgroundColor: '#141414', border: '1px solid #222', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
            Sin imagen
          </div>
        )}
        
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h1 style={{ marginTop: 0, marginBottom: '12px', fontSize: '2rem', fontWeight: '700', letterSpacing: '1px' }}>{pelicula.TituloPelicula}</h1>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span>🎭 {generoNombre}</span>
            <span>⏱️ {pelicula.Duracion} min</span>
            <span>⚠️ {pelicula.Clasificacion || pelicula.Clasificacion}</span>
          </div>

          <h3 style={{ fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', color: '#fff', borderBottom: '1px solid #222', paddingBottom: '6px' }}>Sinopsis</h3>
          <p style={{ lineHeight: '1.7', color: '#aaa', fontSize: '0.95rem', margin: 0 }}>{pelicula.Sinopsis}</p>
        </div>
      </div>

{/* SECCIÓN DEL TRAILER */}
      {trailerEmbedUrl && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px', color: '#fff', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block' }}>🎬 Trailer</h3>
          <div style={{ 
            position: 'relative', 
            paddingBottom: '56.25%', 
            height: 0, 
            overflow: 'hidden', 
            borderRadius: '4px',
            border: '1px solid #222',
            backgroundColor: '#141414'
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

      <div style={{ margin: '40px 0 20px 0' }}>
        <h3 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          🎟️ Funciones Disponibles
        </h3>
      </div>

      {(() => {
        const hoyStr = new Date().toISOString().split('T')[0];

        const funcionesVigentes = funciones.filter(func => {
          const fechaFuncStr = new Date(func.Fecha).toISOString().split('T')[0];
          return fechaFuncStr >= hoyStr;
        });

        if (!funciones || funciones.length === 0 || funcionesVigentes.length === 0) {
          return <p style={{ color: '#888', fontStyle: 'italic', marginTop: '10px' }}>No hay funciones programadas para esta película por el momento.</p>;
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {funcionesVigentes.map(func => {
              const fechaStr = new Date(func.Fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' });
              
              return (
                <div key={func.IdFuncion} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px', 
                  backgroundColor: '#141414', 
                  border: '1px solid #222', 
                  borderRadius: '4px',
                  flexWrap: 'wrap',
                  gap: '15px',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e50914'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                >
                  <div>
                    <strong style={{ fontSize: '1.05rem', display: 'block', marginBottom: '6px', color: '#fff' }}>
                      📅 {fechaStr} &nbsp;|&nbsp; 🕒 {func.Horario}
                    </strong>
                    <small style={{ color: '#888', fontSize: '0.85rem' }}>
                      🗣️ {func.Idioma} &nbsp;|&nbsp; 🏛️ Sala #{func.sala.NumSala} &nbsp;|&nbsp; <span style={{ color: '#e50914', fontWeight: 'bold' }}>💺 {func.CapacidadDisponible} disponibles</span>
                    </small>
                  </div>
                  
                  <Link 
                    to={`/comprar/${func.IdFuncion}`}
                    style={{ 
                      padding: '10px 22px', 
                      backgroundColor: '#e50914', 
                      color: 'white', 
                      textDecoration: 'none', 
                      borderRadius: '2px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'inline-block'
                    }}
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
