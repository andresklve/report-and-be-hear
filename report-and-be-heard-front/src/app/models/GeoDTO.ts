// Limites oficiales INEI (servicio WFS publicado en GeoIDEP), simplificados en /public/geo

export type Nivel = 'pais' | 'departamento' | 'provincia' | 'distrito';

export interface GeoProps {
  id: string;            // ccdd | ccdd+ccpp | ubigeo
  nombre: string;
  nivel: Exclude<Nivel, 'pais'>;
  bbox: [number, number, number, number];   // [minLng, minLat, maxLng, maxLat]
  centro: [number, number];                 // [lat, lng]
  dep?: string; depNombre?: string;
  prov?: string; provNombre?: string;
}

export interface GeoFeature {
  type: 'Feature';
  properties: GeoProps;
  geometry: { type: 'MultiPolygon'; coordinates: number[][][][] };
}

export interface GeoColeccion { type: 'FeatureCollection'; features: GeoFeature[]; }

// Entrada del buscador: t = d (departamento) | p (provincia) | x (distrito)
export interface GeoIndice { t: 'd' | 'p' | 'x'; id: string; n: string; p: string; b: [number, number, number, number]; pr?: string; }
