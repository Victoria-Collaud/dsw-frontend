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
import Login from './pages/login'

import Admin from './pages/admin/admin';
import AdminSalas from './pages/admin/adminsala';
import AdminPeliculas from './pages/admin/adminpelicula';
import AdminFunciones from './pages/admin/adminfunciones.tsx'
import AdminCompras from './pages/admin/admincompra.tsx'
import AdminGeneros from './pages/admin/admingenero.tsx'

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
          <Route path="/login" element={<Login />} />
       <Route path="/admin" element={<Admin />}>
       <Route path="salas" element={<AdminSalas />} />
       <Route path="peliculas" element={<AdminPeliculas />} />
      <Route path="funciones" element={<AdminFunciones />} />
      
      <Route path="peliculas/:IdPelicula/funciones" element={<AdminFunciones />} />
      <Route path="generos" element={<AdminGeneros />} />
        <Route path="compras" element={<AdminCompras />} />
    
  </Route>
      
        </Routes>
      </main>
    </BrowserRouter>
  )
}