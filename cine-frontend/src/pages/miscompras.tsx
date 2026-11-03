import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMisCompras } from '../services/compraServices';
import type { Compra } from '../services/compraServices';
import Loader from '../components/Loader';

export default function MisCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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
      <h1 style={{ borderBottom: '2px solid #e50914', paddingBottom: '15px', marginBottom: '30px' }}>
         Mis Compras:
      </h1>

      {error && (
        <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px' }}>
          {error}
        </p>
      )}

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
            const fechaCompra = new Date(compra.Fecha).toLocaleDateString('es-AR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            });

            // Si la función viene populada, mostramos los datos
            const funcion = typeof compra.funcion === 'object' ? compra.funcion : null;
            const pelicula = funcion?.pelicula;
            const sala = funcion?.sala;

            return (
              <div key={compra.IdCompra} style={{ backgroundColor: '#141414', border: '1px solid #222', borderRadius: '8px', padding: '20px', display: 'flex', gap: '20px' }}>
                {/* Poster de la película */}
                {pelicula?.Cartelera && (
                  <img src={pelicula.Cartelera} alt={pelicula.TituloPelicula} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '4px' }} />
                )}

                {/* Información de la compra */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>
                    {pelicula?.TituloPelicula || 'Película'}
                  </h3>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#aaa' }}>
                    📅 Función: {funcion ? new Date(funcion.Fecha).toLocaleDateString('es-AR') : '-'} | 🕒 {funcion?.Horario || '-'}
                  </p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#aaa' }}>
                    🏛️ Sala #{sala?.NumSala || '-'} | 💺 {compra.CantEntradas} entrada(s)
                  </p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>
                    🧾 Compra realizada el {fechaCompra}
                  </p>
                </div>

                {/* Precio y método de pago */}
                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>
                    ${compra.Precio}
                  </p>
                  <p style={{ margin: '0', fontSize: '0.8rem', color: '#888' }}>
                    💳 {compra.MetodoPago}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}