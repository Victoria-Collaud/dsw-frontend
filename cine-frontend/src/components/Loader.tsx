interface LoaderProps {
  mensaje?: string;
}

export default function Loader({ mensaje = 'Cargando...' }: LoaderProps) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px',
      minHeight: '200px',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* El círculo giratorio */}
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #333',       // Color de fondo del círculo
        borderTop: '4px solid #e50914', // Color de la animación
        borderRadius: '50%',
        animation: 'spin 1s linear infinite' // Animación de CSS
      }} />
      
      {/* El texto abajo */}
      <p style={{ marginTop: '20px', color: '#aaa', fontSize: '1rem', letterSpacing: '0.5px' }}>
        {mensaje}
      </p>

      {/* Definimos la animación de CSS acá para no tocar el index.css */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}