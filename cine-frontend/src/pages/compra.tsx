import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crearCompra, Metodopago } from '../services/compraServices.ts';

export default function Compra() {
  const { funcionId } = useParams(); // Obtiene el ID de la función desde la URL (ej: /comprar/3)
  const navigate = useNavigate();

  const [cantidad, setCantidad] = useState<number>(1);
  const [metodoPago, setMetodoPago] = useState<Metodopago>(Metodopago.MERCADO_PAGO);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // Precio base simulado o fijo por entrada (lo ideal es traerlo de la función/sala)
  const precioUnitario = 4500; 
  const total = cantidad * precioUnitario;

  async function handleComprar(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!funcionId) {
      setError('No se especificó la función a comprar.');
      return;
    }

    try {
      await crearCompra({
        MetodoPago: metodoPago,
        Fecha: new Date().toISOString(),
        CantEntradas: cantidad,
        Precio: total,
        QREntradas: `QR-CODE-FUNCION-${funcionId}-${Date.now()}`,
        usuario: 1, // ID del usuario actual (puedes adaptarlo según tu sistema de login)
        funcion: Number(funcionId)
      });

      setExito(true);
      setTimeout(() => {
        navigate('/peliculas'); // Redirige al catálogo después de comprar
      }, 2000);

    } catch (err) {
      console.error(err);
      setError('Hubo un error al procesar la compra.');
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>🎟️ Finalizar Compra de Entradas</h2>

      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '8px' }}>{error}</p>}
      {exito && <p style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '8px' }}>¡Compra exitosa! Redirigiendo...</p>}

      <form onSubmit={handleComprar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Cantidad de Entradas:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Método de Pago:</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value as Metodopago)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value={Metodopago.MERCADO_PAGO}>Mercado Pago</option>
            <option value={Metodopago.TARJETA_CREDITO}>Tarjeta de Crédito</option>
            <option value={Metodopago.TARJETA_DEBITO}>Tarjeta de Débito</option>
            <option value={Metodopago.TRANSFERENCIA}>Transferencia Bancaria</option>
          </select>
        </div>

        <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
          <p style={{ margin: '0 0 5px 0' }}>Precio por entrada: ${precioUnitario}</p>
          <h3 style={{ margin: 0 }}>Total a Pagar: ${total}</h3>
        </div>

        <button 
          type="submit" 
          disabled={exito}
          style={{ padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Confirmar y Pagar
        </button>
      </form>
    </div>
  );
}