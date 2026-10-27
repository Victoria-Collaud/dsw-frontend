import { useState, useEffect } from 'react';
import { getCompras } from '../../services/compraServices';
import type { Compra } from '../../services/compraServices';

export default function AdminCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const data = await getCompras();
        if (activo) setCompras(data);
      } catch (err) {
        console.error(err);
        if (activo) setError('No se pudieron obtener los registros de compras.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) return <p style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>Cargando auditoría de compras...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      
      <div style={{ margin: '20px 0 30px 0' }}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          🎟️ Registro de Compras
        </h2>
      </div>

      {error && <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</p>}

      {compras.length === 0 && !error ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
          No hay compras registradas en el sistema todavía.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {compras.map((c) => {
            const fechaObj = new Date(c.Fecha);
            const fechaFormateada = isNaN(fechaObj.getTime()) 
              ? String(c.Fecha) 
              : fechaObj.toLocaleString('es-AR', { 
                  day: '2-digit', month: '2-digit', year: 'numeric', 
                  hour: '2-digit', minute: '2-digit' 
                });

            return (
              <div
                key={c.IdCompra}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  backgroundColor: '#141414',
                  border: '1px solid #222',
                  borderRadius: '4px',
                  color: '#fff',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e50914'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
              >
{/* Columna Izquierda: Info de la Película y la Compra */}
                <div>
                  <h3 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>
                    🎬 {typeof c.funcion === 'object' ? c.funcion.pelicula?.TituloPelicula : 'Película Desconocida'}
                  </h3>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#aaa' }}>
                    🏛️ Sala: {typeof c.funcion === 'object' ? c.funcion.sala?.NumSala : '-'} | 
                    👤 Cliente: {typeof c.usuario === 'object' ? c.usuario.EmailUsuario : `ID ${c.usuario}`}
                  </p>
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>📅 {fechaFormateada}</small>
                </div>

{/* Columna Derecha: Detalles Financieros y QR */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#e50914' }}>
                    ${c.Precio}
                  </p>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#aaa' }}>
                    🎟️ {c.CantEntradas} {c.CantEntradas === 1 ? 'entrada' : 'entradas'} | 💳 {c.MetodoPago}
                  </p>
                  <small style={{ fontSize: '0.75rem', color: '#555', display: 'block', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.QREntradas}>
                    QR: {c.QREntradas?.split(',')[0]}...
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}