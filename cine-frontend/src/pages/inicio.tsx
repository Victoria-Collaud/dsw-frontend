import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getPeliculasActivas } from '../services/peliculaServices';
import type { Pelicula } from '../services/peliculaServices';
import { getGeneros } from '../services/generosServices';
import type { Genero } from '../services/generosServices';
import { getFuncionesDePelicula, type Funcion } from '../services/funcionesServices.ts';
import Loader from '../components/Loader';
import '../pages/Inicio.css';


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
  // Si es un objeto y tiene NombreGenero, lo devolvemos
  if (typeof genero === 'object' && genero !== null && genero.NombreGenero) {
    return genero.NombreGenero;
  }
  
  // Si es un número, lo buscamos
  if (typeof genero === 'number') {
    const gen = generos.find(g => g.CodGenero === genero);
    return gen ? gen.NombreGenero : 'Género desconocido';
  }

  return 'Género desconocido';
};


  if (cargando) return <Loader mensaje="Cargando cartelera..." />;

 return (
    <div className="inicio-container">
      
      {/* NOTIFICACIÓN EMERGENTE DE COMPRA EXITOSA */}
      {mostrarAvisoCompra && (
        <div className="inicio-aviso-compra">
          <div>
            <h4 className="inicio-aviso-titulo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-party-popper preview-icon"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg>
              ¡Compra realizada con éxito!
            </h4>
            <p className="inicio-aviso-texto">
              <span>Ya podés ver tus entradas y códigos QR haciendo clic en tu perfil y seleccionando&nbsp;</span>
              <strong className="inicio-aviso-destacado">"Mis Compras"</strong>
              {/* Flechita */}
              <span className="inicio-aviso-flecha">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </span>
            </p>
          </div>
          <button 
            onClick={() => setMostrarAvisoCompra(false)}
            className="inicio-aviso-cerrar"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="inicio-hero">
        <h1 className="inicio-hero-titulo">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-popcorn preview-icon"><path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4"/><path d="M10 22 9 8"/><path d="m14 22 1-14"/><path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z"/></svg>
          ¡Bienvenido a NewCine!
        </h1>
        <p className="inicio-hero-subtitulo">
          Disfrutá de la mejor cartelera. ¡Comprá tus entradas ahora!
        </p>
      </div>

      {error && <p className="inicio-error">{error}</p>}

      <div className="inicio-seccion-header">
        <h2 className="inicio-seccion-titulo">
          ESTRENOS
        </h2>
      </div>

      {peliculas.length === 0 ? (
        <p className="inicio-vacio">No hay películas disponibles en este momento ¡Vuelva pronto!</p>
      ) : (
        <div className="inicio-grid">

          {peliculas.slice(0, 8).map((peli) => {
            
            const tieneFunciones = funcionesPorPelicula[peli.IdPelicula!] && funcionesPorPelicula[peli.IdPelicula!].length > 0;

            return (
              <Link 
                key={peli.IdPelicula} 
                to={`/pelicula/${peli.IdPelicula}`}
                className="inicio-card-link"
              >
                <div className={`inicio-card ${!tieneFunciones ? 'sin-funciones' : ''}`}>
                  {/* Imagen */}
                  <div className="inicio-card-poster-wrapper">
                    {peli.Cartelera ? (
                      <img 
                        src={peli.Cartelera} 
                        alt={`Póster de ${peli.TituloPelicula}`} 
                        loading="lazy"
                        className="inicio-card-poster"
                      />
                    ) : (
                      <div className="inicio-card-sin-imagen">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="inicio-card-body">
                    <h3 className="inicio-card-titulo">{peli.TituloPelicula}</h3>
                    <p className="inicio-card-meta">
                      {obtenerNombreGenero(peli.genero)} | {peli.Clasificacion || peli.Clasificacion}
                    </p>
                    
                    <div className="inicio-card-footer">
                      {!tieneFunciones && (
                        <div className="inicio-card-aviso-funciones">
                          SIN FUNCIONES DISPONIBLES
                        </div>
                      )}

                      {/* Botón Ver Película */}
                      <div className={`inicio-card-btn ${!tieneFunciones ? 'deshabilitado' : ''}`}>
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
  );}