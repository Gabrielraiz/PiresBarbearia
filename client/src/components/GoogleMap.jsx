import React from 'react';

export default function GoogleMap({
  address = 'Piresqk Barbearia, Brazil',
  zoom = 17,
  height = '400px'
}) {
  // Usando Google Maps Embed API (GRATUITA E ILIMITADA)
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY}&q=${encodeURIComponent(address)}&zoom=${zoom}`;

  return (
    <div
      style={{
        width: '100%',
        height: height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #2a2a2a',
        position: 'relative'
      }}
    >
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Localização da PiresQK Barbearia"
      />

      {/* Overlay com informações */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
          📍 PiresQK Barbearia
        </div>
        <div>Rua das Flores, 123 - Centro</div>
        <div>Seg-Sab: 09:00 - 20:00</div>
      </div>
    </div>
  );
}

// Componente alternativo com JavaScript API (se quiser usar depois)
export function GoogleMapAdvanced({ address = 'Piresqk Barbearia, Brazil', zoom = 17, height = '400px' }) {
  const mapRef = useRef(null);
  const [map, setMap] = React.useState(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;

    googleMapScript.onload = () => {
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: zoom,
        center: { lat: -27.5954, lng: -48.5480 },
        mapTypeId: 'roadmap',
        tilt: 45,
        heading: 45,
        styles: [
          {
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }],
          },
          {
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{ color: '#616161' }],
          },
          {
            featureType: 'administrative.land_parcel',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#bdbdbd' }],
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#eeeeee' }],
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#757575' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#e5e5e5' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#757575' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#dadada' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#616161' }],
          },
          {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }],
          },
          {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [{ color: '#e5e5e5' }],
          },
          {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [{ color: '#eeeeee' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#c9c9c9' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }],
          },
        ],
      });

      new window.google.maps.Marker({
        position: { lat: -27.5954, lng: -48.5480 },
        map: newMap,
        title: 'PiresQK Barbearia',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#f5b800',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 5px; color: #f5b800;"><b>PiresQK Barbearia</b></h3>
            <p style="margin: 0; font-size: 12px;">Rua das Flores, 123 - Centro</p>
            <p style="margin: 5px 0 0; font-size: 12px;"><b>Seg-Sab: 09:00 - 20:00</b></p>
          </div>
        `,
        position: { lat: -27.5954, lng: -48.5480 },
      });

      infoWindow.open(newMap);
      setMap(newMap);
    };

    document.head.appendChild(googleMapScript);

    return () => {
      if (googleMapScript.parentNode) {
        googleMapScript.parentNode.removeChild(googleMapScript);
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #2a2a2a'
      }}
    />
  );
}
