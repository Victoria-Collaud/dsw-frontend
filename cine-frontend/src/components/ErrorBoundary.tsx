import  { Component } from 'react';
import type { ErrorInfo } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  // Se activa cuando ocurre un error en los hijos para actualizar el estado
  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  // Permite registrar el error en la consola para depurar
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error no controlado atrapado por el Boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Pantalla de respaldo elegante cuando ocurre una falla
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#fff', 
          backgroundColor: '#141414', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#e50914', fontSize: '28px', marginBottom: '15px' }}>
            ¡Ups, algo salió mal!
          </h2>
          <p style={{ color: '#aaa', marginBottom: '25px', fontSize: '16px' }}>
            Ocurrió un error inesperado en esta sección de la aplicación.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#e50914', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer', 
              fontSize: '16px', 
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;