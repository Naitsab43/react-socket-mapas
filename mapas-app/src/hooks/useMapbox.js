import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl';
import { Subject } from 'rxjs'
import { v4 } from 'uuid'

mapboxgl.accessToken = 'pk.eyJ1IjoibmFpdHNhYjQzIiwiYSI6ImNranJudmUzZDAxMmYydmw1dzB2OGY5dngifQ.HUUrYOpBfqvoZnT-9TJwaA';

export const useMapbox = (puntoInicial) => {
  
  // Referencia al DIV del mapa
  const mapaDiv = useRef();
  const setRef = useCallback((node) => {
    mapaDiv.current = node
  }, [])

  // Referencia los marcadores
  const marcadores = useRef({});


  // Aca usa un useRef en vez de un useState por que el mapa solo se setea una vez, por esto mejor utiliza un useRef para mantener la referencia y en el useEffect en donde se inicia un listener tiene la dependencia vacia y eso asegura que solo se cree un listener en cambio si tuviera la dependencia del mapa otro evento que cambie el map puede hacer que se cree otro listener del evento
  const mapa = useRef();
  const [ coords, setCoords ] = useState(puntoInicial)

  // Observables de Rxjs
  const movimientoMarcador = useRef(new Subject());
  const nuevoMarcador = useRef(new Subject());
  
  // Funcion para agregar marcadores
  const agregarMarcador = useCallback(((e, id) => {

    const { lng, lat } = e.lngLat || e;

    const marker = new mapboxgl.Marker()
    marker.id = id || v4();

    marker.setLngLat([lng, lat]).addTo(mapa.current).setDraggable(true)
    marcadores.current[marker.id] = marker;

    if(!id){

      nuevoMarcador.current.next({
        id: marker.id,
        lng,
        lat
      })

    }

    // Escuchar movimientos del marcador
    marker.on("drag", ({target}) => {

      const { id } = target;
      const { lng, lat } = target.getLngLat();
      
      // Emite la referencia del observable
      movimientoMarcador.current.next({
        id,
        lng,
        lat
      })

    })

  }), [])

  // Funcion para actualizar la ubicacion del marcador
  const actualizarPosicion = useCallback(({id, lng, lat}) => {

    marcadores.current[id].setLngLat([ lng, lat]);

  }, [])

  useEffect(() => {

    const map = new mapboxgl.Map({
      container: mapaDiv.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [ puntoInicial.lng, puntoInicial.lat ],
      zoom: puntoInicial.zoom
    });

    mapa.current = map;

  }, [puntoInicial])

  // Cuando se mueve el mapa
  useEffect(() => {

    mapa.current?.on("move", () => {
      const { lng, lat } = mapa.current.getCenter()

      setCoords({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: mapa.current.getZoom().toFixed(2)
      })

    })
    
  }, [])

  // Agregar marcadores cuando hacemos click
  useEffect(() => {

    mapa.current?.on("click", agregarMarcador)

  }, [agregarMarcador])

  return {
    agregarMarcador,
    actualizarPosicion,
    coords,
    nuevoMarcador$: nuevoMarcador.current,
    movimientoMarcador$: movimientoMarcador.current,
    marcadores,
    setRef
  }
  
}
