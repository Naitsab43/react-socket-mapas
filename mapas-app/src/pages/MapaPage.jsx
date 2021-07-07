import React, { useContext, useEffect } from 'react'
import { SocketContext } from '../context/SocketContext';
import { useMapbox } from '../hooks/useMapbox';
 
const puntoInicial = {
  lng: -122.4701,
  lat:  37.8028,
  zoom: 13.5
}

export const MapaPage = () => {

  const { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion} = useMapbox(puntoInicial)
  const { socket } = useContext(SocketContext)
  
  // Ecuchar los marcadores existentes
  useEffect(() => {
    socket.on("marcadores-activos", (marcadores) => {

      for(const key of Object.keys(marcadores)){
        agregarMarcador(marcadores[key], key)
      }

    })
  }, [socket, agregarMarcador])

  // Nuevo marcador
  useEffect(() => {
    // Escucha la referencia del observable
    nuevoMarcador$.subscribe(marcador => {
      socket.emit("marcador-nuevo", marcador);
    })

  }, [nuevoMarcador$, socket])

  // Movimiento de el marcador
  useEffect(() => {
    
    movimientoMarcador$.subscribe(marcador => {
      socket.emit("marcador-actualizado", marcador);
    });

  }, [socket, movimientoMarcador$])

  // Mover marcador mediante socket
  useEffect(() => {

    socket.on("marcador-actualizado", (marcador) => {
      actualizarPosicion(marcador);
    });

  }, [socket, actualizarPosicion])

  // Escuchar nuevos marcadores
  useEffect(() => {

    socket.on("marcador-nuevo", (marcador) => {
      agregarMarcador(marcador, marcador.id)
    });

  }, [socket, agregarMarcador])


  return (  
    <>

      <div className="info">Lng: {coords.lng} | Lat: {coords.lat} | zoom: {coords.zoom} </div>

      <div className="mapContainer" ref={setRef} />

      
    </>
  )
}
