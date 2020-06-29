import { ContextProps, Map, Marker, TileLayer, withLeaflet } from 'react-leaflet';
import * as React                                            from 'react';
import styled                          from '../../config/styled';

const MapContainer = styled.div<{ width: string, height: string }>`
    .leaflet-container {
        width: ${props => props.width};
        height: ${props => props.height};
    }

    .leaflet-left {
        visibility: hidden;
    }
`;

export interface LeafletMapProps {
    width: string;
    height: string;
    coords: {
        lat: number;
        lon: number;
    }
}

export const LeafletMap =  withLeaflet<LeafletMapProps & ContextProps>((props: LeafletMapProps) => (
  <MapContainer width={props.width} height={props.height}>
    <Map
      center={{ lat: props.coords.lat, lng: props.coords.lon }}
      zoom={18}
      dragging={false}
      keyboard={false}
      doubleClickZoom={false}
      tap={false}
      scrollWheelZoom={false}
      touchZoom={false}
    >
      <TileLayer
        attribution={'&copy; <a href="http://osm.org/copyright"></a>'}
        url={'https://{s}.tile.osm.org/{z}/{x}/{y}.png'} />
      <Marker position={{ lat: props.coords.lat, lng: props.coords.lon }} />
    </Map>
  </MapContainer>
));
