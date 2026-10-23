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

  if (cargando) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Cargando auditoría de compras...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>🎟️ Auditoría de Compras</h2>

      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}

      {compras.length === 0 && !error ? (
        <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
          No hay compras registradas en el sistema todavía.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {compras.map((c) => {
            // Formateamos la fecha para que se vea linda (DD/MM/AAAA HH:MM)
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
                  padding: '15px',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              >
                {/* Columna Izquierda: Info de la Película y la Compra */}
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#ea5098' }}>
                    🎬 {typeof c.funcion === 'object' ? c.funcion.pelicula?.TituloPelicula : 'Película Desconocida'}
                  </h3>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#ccc' }}>
                    🏛️ Sala: {typeof c.funcion === 'object' ? c.funcion.sala?.NumSala : '-'} | 
                    👤 Cliente: {typeof c.usuario === 'object' ? c.usuario.EmailUsuario : `ID ${c.usuario}`}
                  </p>
                  <small style={{ color: '#888' }}>📅 {fechaFormateada}</small>
                </div>

                {/* Columna Derecha: Detalles Financieros y QR */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    ${c.Precio}
                  </p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#aaa' }}>
                    🎟️ {c.CantEntradas} {c.CantEntradas === 1 ? 'entrada' : 'entradas'} | 💳 {c.MetodoPago}
                  </p>
                  <small style={{ fontSize: '0.75rem', color: '#666', display: 'block', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.QREntradas}>
                    QR: {c.QREntradas.split(',')[0]}...
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