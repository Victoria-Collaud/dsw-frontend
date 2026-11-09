import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getPeliculasActivas } from '../services/peliculaServices';
import type { Pelicula } from '../services/peliculaServices';
import { getGeneros } from '../services/generosServices';
import type { Genero } from '../services/generosServices';
import { getFuncionesDePelicula, type Funcion } from '../services/funcionesServices.ts';
import Loader from '../components/Loader';


export default function Inicio() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [funcionesPorPelicula, setFuncionesPorPelicula] = useState<Record<number, Funcion[]>>({});


  const [mostrarAvisoCompra, setMostrarAvisoCompra] = useState(() => Boolean(location.state?.compraExitosa));


  useEffect(() => {
    if (location.state?.compraExitosa) {
      navigate('.', { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    async function cargar() {
      try {
        const [pelisData, generosData] = await Promise.all([
          getPeliculasActivas(),
          getGeneros()
        ]);
        setPeliculas(pelisData);
        setGeneros(generosData);
        
        const funcionesPromesas = pelisData.map(async (peli) => {
          try {
            const funcs = await getFuncionesDePelicula(peli.IdPelicula!);
            // FILTRAMOS SOLO LAS FUNCIONES FUTURAS Y CON CAPACIDAD
            const ahora = new Date();
            const funcionesValidas = funcs.filter(func => {
              // Combinamos fecha y horario para comparar
              const fechaHora = new Date(`${func.Fecha.split('T')[0]}T${func.Horario}`);
              
              // Condición A: La función debe ser en el futuro
              const esFutura = fechaHora > ahora;
              
              // Condición B: Debe haber asientos disponibles (mayor a 0)
              const tieneCapacidad = (func.CapacidadDisponible ?? 0) > 0;

              // Solo la guardamos si cumple AMBAS condiciones
              return esFutura && tieneCapacidad;
            });
            return { id: peli.IdPelicula!, funcs: funcionesValidas };
          } catch {
            // Si falla la petición de esta película, guardamos un array vacío
            return { id: peli.IdPelicula!, funcs: [] as Funcion[] };
          }
        });

        const resultados = await Promise.all(funcionesPromesas);
        const dict: Record<number, Funcion[]> = {}; 
        resultados.forEach(r => {
          if (r.id !== undefined) {
            dict[r.id] = r.funcs;
          }
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

  const obtenerNombreGenero = (genero: number | { CodGenero: number; NombreGenero?: string }) => {
    // Si ya viene como objeto con el nombre, lo devolvemos directo
    if (typeof genero === 'object' && genero !== null) {
      return genero.NombreGenero || 'Género desconocido';
    }
    // Si viene como número, lo buscamos en el array de géneros
    const gen = generos.find(g => g.CodGenero === genero);
    return gen ? gen.NombreGenero : 'Género desconocido';
  };

  if (cargando) return <Loader mensaje="Cargando cartelera..." />;

  return (
    <div style={{ padding: '40px 20px', width: '100%', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box', backgroundColor: '#0b0c10', color: '#fff', minHeight: '100vh' }}>
      
    
      {/* NOTIFICACIÓN EMERGENTE DE COMPRA EXITOSA */}
      {mostrarAvisoCompra && (
        <div style={{
          backgroundColor: '#14291c',
          border: '1px solid #4ade80',
          color: '#4ade80',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#4ade80' }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-party-popper preview-icon"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg> ¡Compra realizada con éxito!</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <span>Ya podés ver tus entradas y códigos QR haciendo clic en tu perfil y seleccionando&nbsp;</span>
              <strong style={{ color: '#fff' }}>"Mis Compras"</strong>
              {/* Flechita */}
              <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px', transform: 'translateY(-1px)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </span>
            </p>
          </div>
          <button 
            onClick={() => setMostrarAvisoCompra(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#4ade80',
              fontSize: '1.2rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: '0 8px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div style={{ textAlign: 'left', margin: '10px 0 35px 0', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '1.75rem', letterSpacing: '1px', margin: '0 0 8px 0', color: '#ffffff', textTransform: 'uppercase', fontWeight: '700', fontFamily: 'system-ui, sans-serif' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-popcorn preview-icon"><path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4"/><path d="M10 22 9 8"/><path d="m14 22 1-14"/><path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z"/></svg> ¡Bienvenido a NewCine!
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
                        alt={`Póster de ${peli.TituloPelicula}`} loading="lazy"
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
