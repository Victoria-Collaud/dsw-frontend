import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMisCompras } from '../services/compraServices';
import type { Compra } from '../services/compraServices';
import Loader from '../components/Loader';

export default function MisCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para manejar el QR seleccionado y mostrarlo en un modal
  const [qrSeleccionado, setQrSeleccionado] = useState<{ 
    urls: string[]; 
    pelicula: string; 
    fecha: string; 
    horario: string; 
  } | null>(null);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getMisCompras();
        setCompras(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron obtener tus compras.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (cargando) return <Loader mensaje="Cargando tus compras..." />;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      
      <h1 style={{ borderBottom: '2px solid #e50914', paddingBottom: '15px', marginBottom: '30px', color: '#fff' }}>
        Mis Compras:
      </h1>

      {error && <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', padding: '12px', borderRadius: '4px' }}>{error}</p>}

      {compras.length === 0 && !error ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <p style={{ color: '#888', fontSize: '1.1rem' }}>Todavía no realizaste ninguna compra.</p>
          <Link to="/peliculas" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 25px', backgroundColor: '#e50914', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            Ver cartelera
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {compras.map((compra) => {
            const fechaCompra = new Date(compra.Fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            const funcion = typeof compra.funcion === 'object' ? compra.funcion : null;
            const pelicula = funcion?.pelicula;
            const sala = funcion?.sala;

            const fechaFuncion = funcion 
              ? new Date(`${funcion.Fecha.split('T')[0]}T${funcion.Horario}`) 
              : null;
            const funcionYaOcurrio = fechaFuncion ? fechaFuncion < new Date() : true;

            const qrs = compra.QREntradas ? compra.QREntradas.split('|||') : [];

            return (
              <div key={compra.IdCompra} style={{ backgroundColor: '#141414', border: '1px solid #222', borderRadius: '8px', padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {pelicula?.Cartelera && (
                  <img src={pelicula.Cartelera} alt={pelicula.TituloPelicula} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '4px' }} />
                )}

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>{pelicula?.TituloPelicula || 'Película'}</h3>
            
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', color: '#aaa', fontSize: '0.9rem', margin: '0 0 5px 0' }}>
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/>
    </svg>
    <span>Función: {funcion ? new Date(funcion.Fecha).toLocaleDateString('es-AR') : '-'}</span>
  </span>

  <span style={{ color: '#555' }}>|</span>

  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
    <span>{funcion?.Horario || '-'}</span>
  </span>
</div>


<div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', color: '#aaa', fontSize: '0.9rem', margin: '0 0 5px 0' }}>
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>
    </svg>
    <span>Sala #{sala?.NumSala || '-'}</span>
  </span>

  <span style={{ color: '#555' }}>|</span>

  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/>
    </svg>
    <span>{compra.CantEntradas} entrada(s)</span>
  </span>
</div>


<div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.85rem', margin: '0 0 5px 0' }}>
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M13 16H8"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/>
  </svg>
  <span>Compra realizada el {fechaCompra}</span>
</div>
                  {!funcionYaOcurrio && qrs.length > 0 && (
                    <button
                      onClick={() => setQrSeleccionado({ 
                        urls: qrs.map(qr => qr.trim()), 
                        pelicula: pelicula?.TituloPelicula || 'Película',
                        fecha: funcion ? new Date(funcion.Fecha).toLocaleDateString('es-AR') : '-',
                        horario: funcion?.Horario || '-'
                      })}
                      style={{
                        marginTop: '10px', padding: '8px 20px', backgroundColor: '#e50914',
                        color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer',
                        fontWeight: 'bold', fontSize: '0.9rem'
                      }}
                    >
                        Ver mis QRs ({qrs.length})
                    </button>
                  )}
                </div>

                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>${compra.Precio}</p>
                  <p style={{ margin: '0', fontSize: '0.8rem', color: '#888' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-credit-card preview-icon"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/><path d="M6 14h2"/></svg> {compra.MetodoPago}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL PARA VER LOS QR */}
      {qrSeleccionado && (
        <div
          onClick={() => setQrSeleccionado(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.88)', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center', 
            zIndex: 2000, 
            padding: '20px', 
            boxSizing: 'border-box'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ 
              backgroundColor: '#141414', 
              border: '1px solid #333',
              padding: '30px', 
              borderRadius: '12px', 
              textAlign: 'center', 
              maxWidth: '550px', 
              width: '100%',
              maxHeight: '90vh',
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
            }}
          >
            {/* HEADER: Título y Fecha */}
            <div style={{ flexShrink: 0, borderBottom: '1px solid #222', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.5rem' }}>
                 {qrSeleccionado.pelicula}
              </h3>
             <p style={{ margin: '10px 0 0 0', color: '#aaa', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
  {/* Fecha */}
  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/>
    </svg> 
    {qrSeleccionado.fecha}
  </span>
  {/* Separador único */}
  <span style={{ color: '#444' }}>|</span>
  {/* Horario */}
  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg> 
    {qrSeleccionado.horario}
  </span>
</p>
            </div>

            {/* LISTA VERTICAL DE QR GIGANTES CON SCROLL */}
            <div style={{ 
              overflowY: 'auto', 
              flex: 1, 
              paddingRight: '5px', 
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              alignItems: 'center'
            }}>
              {qrSeleccionado.urls.map((url, index) => (
                <div key={index} style={{ 
                  padding: '20px', 
                  border: '1px solid #333', 
                  borderRadius: '10px',
                  backgroundColor: '#1b1b1b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '380px',
                  boxSizing: 'border-box'
                }}>
                  <span style={{ display: 'block', color: '#d1c8c9', fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '0.5px' }}>
                    Entrada #{index + 1}
                  </span>
                  <img 
                    src={url} 
                    alt={`QR de la entrada ${index + 1}`} 
                    style={{ 
                      width: '100%', 
                      maxWidth: '260px', 
                      height: 'auto', 
                      display: 'block', 
                      backgroundColor: '#fff', 
                      padding: '10px', 
                      borderRadius: '6px', 
                      objectFit: 'contain' 
                    }} 
                  />
                </div>
              ))}
            </div>

            {/* FOOTER: Botón Cerrar */}
            <div style={{ flexShrink: '0', borderTop: '1px solid #222', paddingTop: '15px' }}>
              <button
                onClick={() => setQrSeleccionado(null)}
                style={{ padding: '12px 25px', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', width: '100%' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}