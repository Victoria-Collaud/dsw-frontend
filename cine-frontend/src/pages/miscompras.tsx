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

  return (<div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      
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
            
            // Obtenemos los datos de la función
            const funcion = typeof compra.funcion === 'object' ? compra.funcion : null;
            const pelicula = funcion?.pelicula;
            const sala = funcion?.sala;

            // Verificamos si la función ya ocurrió
            const fechaFuncion = funcion 
              ? new Date(`${funcion.Fecha.split('T')[0]}T${funcion.Horario}`) 
              : null;
            const funcionYaOcurrio = fechaFuncion ? fechaFuncion < new Date() : true;

            // Separamos los QR (uno por entrada)
            const qrs = compra.QREntradas ? compra.QREntradas.split('|||') : [];

            return (
              <div key={compra.IdCompra} style={{ backgroundColor: '#141414', border: '1px solid #222', borderRadius: '8px', padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {pelicula?.Cartelera && (
                  <img src={pelicula.Cartelera} alt={pelicula.TituloPelicula} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '4px' }} />
                )}

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>{pelicula?.TituloPelicula || 'Película'}</h3>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#aaa' }}>
                    📅 Función: {funcion ? new Date(funcion.Fecha).toLocaleDateString('es-AR') : '-'} | 🕒 {funcion?.Horario || '-'}
                  </p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#aaa' }}>
                    🏛️ Sala #{sala?.NumSala || '-'} | 💺 {compra.CantEntradas} entrada(s)
                  </p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>🧾 Compra realizada el {fechaCompra}</p>
                  
                  {/* BOTÓN PARA VER EL QR (solo si la función no ocurrió) */}
                  {!funcionYaOcurrio && qrs.length > 0 && (
                    <button
                      onClick={() => setQrSeleccionado({ 
                        urls: qrs.map(qr => qr.trim()), // Limpiamos cada QR 
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
                       Ver mi QR ({qrs.length})
                    </button>
                  )}
                </div>

                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>${compra.Precio}</p>
                  <p style={{ margin: '0', fontSize: '0.8rem', color: '#888' }}>💳 {compra.MetodoPago}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL PARA VER EL QR EN GRANDE */}
      {qrSeleccionado && (
  <div
    onClick={() => setQrSeleccionado(null)}
    style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', 
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
              border: '1px solid #222',
              padding: '30px', 
              borderRadius: '10px', 
              textAlign: 'center', 
              maxWidth: '800px', 
              width: '100%',
              maxHeight: '90vh',
              display: 'flex', 
              flexDirection: 'column'
            }}
    >
      {/* HEADER: Título y Fecha (Siempre visible) */}
      <div style={{ flexShrink: 0 }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.5rem' }}>
                 {qrSeleccionado.pelicula}
              </h3>
              <p style={{ margin: '0 0 20px 0', color: '#aaa', fontSize: '0.95rem' }}>
                📅 {qrSeleccionado.fecha} | 🕒 {qrSeleccionado.horario}
              </p>
            </div>

      {/* GRILLA CON SCROLL (Solo esta parte scrollea) */}
      <div style={{ 
              overflowY: 'auto', 
              flex: 1, 
              paddingRight: '10px', 
              marginBottom: '20px'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px'
              }}>
                {qrSeleccionado.urls.map((url, index) => (
                  <div key={index} style={{ 
                    padding: '15px', 
                    border: '1px solid #333', 
                    borderRadius: '8px',
                    backgroundColor: '#1f1f1f',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <p style={{ margin: '0 0 10px 0', color: '#fff', fontWeight: 'bold' }}>
                      Entrada {index + 1}
                    </p>
              <img 
                      src={url} 
                      alt={`QR de la entrada ${index + 1}`} 
                      style={{ width: '100%', maxWidth: '200px', display: 'block', backgroundColor: '#fff', padding: '8px', borderRadius: '4px' }} 
                    />
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER: Botón Cerrar (Siempre visible) */}
     <div style={{ flexShrink: 0, borderTop: '1px solid #222', paddingTop: '20px' }}>
              <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '0 0 15px 0' }}>
                Presentá cada código en la entrada del cine
              </p>
              <button
                onClick={() => setQrSeleccionado(null)}
                style={{ padding: '12px 30px', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
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