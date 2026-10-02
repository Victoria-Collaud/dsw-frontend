/*
//import { useState } from 'react'
import './App.css'
import { useEffect, useState } from 'react'

function App() {
 
  const [salas, setSalas] = useState<any[]>([])

  useEffect(() => {

    fetch('http://localhost:3001/api/salas')
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setSalas(data.data)
      })

  }, []) 
  return ( 
<div>
      <h1>Cine Frontend</h1>
   
     {salas.map(sala => (
        <div key={sala.id}>
          <p>Sala: {sala.NumSala}</p>
          <p>Capacidad: {sala.Capacidad}</p>
          <p>Pantalla: {sala.TipoPantalla}</p>
          <p>Asiento: {sala.TipoAsiento}</p>
          <p>Precio: {sala.PrecioSala}</p>
          <hr />
        </div>
      ))}
    </div>
    )
}
export default App
*/

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Inicio from './pages/inicio'
import Peliculas from './pages/peliculas'
import DetallePelicula from './pages/detallepelicula'
import Compra from './pages/compra'
import Admin from './pages/admin'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/peliculas" element={<Peliculas />} />
          <Route path="/pelicula/:id" element={<DetallePelicula />} />
          <Route path="/comprar/:funcionId" element={<Compra />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}