import { useState } from 'react'; 
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; 

import { getMisCompras } from '../services/compraServices';

import Loader from '../components/Loader';
import '../pages/MisCompras.css';

export default function MisCompras() {
  // Consulta de compras con TanStack Query
  const {
    data: compras = [],
    isLoading: cargando,
    isError: error,
  } = useQuery({
    queryKey: ['misCompras'],
    queryFn: getMisCompras,
  });

  // Estado para manejar el QR seleccionado y mostrarlo en un modal
  const [qrSeleccionado, setQrSeleccionado] = useState<{
    urls: string[];
    pelicula: string;
    fecha: string;
    horario: string;

  } | null>(null);

 if (cargando) return <Loader mensaje="Cargando tus compras..." />;

  return (
    <div className="mis-compras-container">

      <h1 className="mis-compras-titulo">
        Mis Compras:
      </h1>

      {error && <p className="mis-compras-error">No se pudieron obtener tus compras.</p>} {/* ✨ */}

      {compras.length === 0 && !error ? (
        <div className="mis-compras-vacio">
          <p className="mis-compras-vacio-texto">Todavía no realizaste ninguna compra.</p>
          <Link to="/peliculas" className="mis-compras-btn-cartelera">
            Ver cartelera
          </Link>
        </div>
      ) : (
        <div className="mis-compras-lista">
          {compras.map((compra) => {
            const fechaCompra = new Date(compra.Fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            const funcion = typeof compra.funcion === 'object' ? compra.funcion : null;
            const pelicula = funcion?.pelicula;
            const sala = funcion?.sala;
           const qrs = compra.QREntradas
          ? compra.QREntradas.split('|||').map((qr) => qr.trim()).filter(Boolean)
           : [];

            const fechaFuncion = funcion
              ? new Date(`${funcion.Fecha.split('T')[0]}T${funcion.Horario}`)
              : null;
            const funcionYaOcurrio = fechaFuncion ? fechaFuncion < new Date() : true;
            
            return (
              <div key={compra.IdCompra} className="mis-compras-card">
                {pelicula?.Cartelera && (
                  <img src={pelicula.Cartelera} alt={pelicula.TituloPelicula} className="mis-compras-poster" />
                )}

                <div className="mis-compras-info">
                  <h3 className="mis-compras-pelicula-titulo">{pelicula?.TituloPelicula || 'Película'}</h3>
            
                  <div className="mis-compras-detalle-row">
                    <span className="mis-compras-detalle-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/>
                      </svg>
                      <span>Función: {funcion ? new Date(funcion.Fecha).toLocaleDateString('es-AR') : '-'}</span>
                    </span>

                    <span className="mis-compras-divider">|</span>

                    <span className="mis-compras-detalle-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      <span>{funcion?.Horario || '-'}</span>
                    </span>
                  </div>

                  <div className="mis-compras-detalle-row">
                    <span className="mis-compras-detalle-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>
                      </svg>
                      <span>Sala #{sala?.NumSala || '-'}</span>
                    </span>

                    <span className="mis-compras-divider">|</span>

                    <span className="mis-compras-detalle-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/>
                      </svg>
                      <span>{compra.CantEntradas} entrada(s)</span>
                    </span>
                  </div>

                  <div className="mis-compras-fecha-realizada">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M13 16H8"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/>
                    </svg>
                    <span>Compra realizada el {fechaCompra}</span>
                  </div>

                  {!funcionYaOcurrio && qrs.length > 0 && (
                    <button
                      onClick={() => setQrSeleccionado({ 
                        urls: qrs, 
                        pelicula: pelicula?.TituloPelicula || 'Película',
                        fecha: funcion ? new Date(funcion.Fecha).toLocaleDateString('es-AR') : '-',
                        horario: funcion?.Horario || '-'
                      })}
                      className="mis-compras-btn-qr"
                    >
                      Ver mis QRs ({qrs.length})
                    </button>
                  )}
                </div>

                <div className="mis-compras-precio-col">
                  <p className="mis-compras-precio">${compra.Precio}</p>
                  <p className="mis-compras-metodo-pago">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card preview-icon"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/><path d="M6 14h2"/></svg> 
                    {compra.MetodoPago}
                  </p>
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
          className="mis-compras-modal-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mis-compras-modal-content"
          >
            {/* HEADER: Título y Fecha */}
            <div className="mis-compras-modal-header">
              <h3 className="mis-compras-modal-titulo">
                 {qrSeleccionado.pelicula}
              </h3>
             <p className="mis-compras-modal-sub">
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
            <div className="mis-compras-modal-scroll">
              {qrSeleccionado.urls.map((url, index) => (
                <div key={index} className="mis-compras-qr-card">
                  <span className="mis-compras-qr-label">
                    Entrada #{index + 1}
                  </span>
                  <img 
                    src={url} 
                    alt={`QR de la entrada ${index + 1}`} 
                    className="mis-compras-qr-imagen" 
                  />
                </div>
              ))}
            </div>

            {/* FOOTER: Botón Cerrar */}
            <div className="mis-compras-modal-footer">
              <button
                onClick={() => setQrSeleccionado(null)}
                className="mis-compras-modal-btn-cerrar"
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