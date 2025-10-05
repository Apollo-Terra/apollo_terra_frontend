import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Classe customizada para NASA GIBS - corrige ordem das coordenadas
const NasaGibsLayer = L.TileLayer.extend({
  initialize: function(templateUrl, options) {
    this._templateUrl = templateUrl;
    L.TileLayer.prototype.initialize.call(this, '', options);
  },
  
  getTileUrl: function(coords) {
    // NASA GIBS usa {z}/{y}/{x} - Leaflet passa coords como {z, x, y}
    // Precisamos trocar x e y para o padrão NASA
    return this._templateUrl
      .replace('{z}', coords.z)
      .replace('{y}', coords.y)
      .replace('{x}', coords.x);
  }
});

const NasaTileLayer = ({ url, opacity = 0.7, selectedDate }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    // Remove camada anterior
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    // Cria nova instância com key única para forçar recriação
    layerRef.current = new NasaGibsLayer(url, {
      opacity: opacity,
      key: `${selectedDate}-${Date.now()}`
    });

    layerRef.current.addTo(map);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [url, selectedDate, map, opacity]);

  return null;
};

export default NasaTileLayer;