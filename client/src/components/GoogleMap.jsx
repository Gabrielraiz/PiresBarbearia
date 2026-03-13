import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function GoogleMap({
  address: propAddress,
  zoom = 17,
  height = '400px'
}) {
  const { settings } = useSettings();
  const address = propAddress || settings.address || 'R. Cinco Mil, Quinhentos e Nove, 191 - Da Várzea';
  
  // Verifica se a URL de embed é válida e externa. Se carregar o próprio site, vai dar loop ou erro.
  const isExternalEmbed = settings.map_embed_url && (settings.map_embed_url.startsWith('http') || settings.map_embed_url.startsWith('https'));
  
  const embedUrl = isExternalEmbed ? settings.map_embed_url : 
    `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY || ''}&q=${encodeURIComponent(address)}&zoom=${zoom}`;

  if (!isExternalEmbed && !import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY) {
    // Fallback para link direto caso não tenha API Key nem Embed URL
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    return (
      <div className="w-full relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] flex flex-col items-center justify-center text-center p-8 gap-4" style={{ height }}>
        <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] mb-2">
          <Icons.MapPin size={32} />
        </div>
        <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-widest">{settings.site_name || 'PiresQK Barbearia'}</h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs">{address}</p>
        <a href={mapLink} target="_blank" rel="noreferrer" className="btn-gold px-8 py-3 text-[10px] font-black tracking-widest uppercase mt-2">
          VER NO GOOGLE MAPS
        </a>
      </div>
    );
  }

  return (
    <div
      className="w-full relative rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl"
      style={{ height: height }}
    >
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0, filter: settings.theme === 'dark' ? 'invert(90%) hue-rotate(180deg)' : 'none' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Localização da PiresQK Barbearia"
      />

      {/* Overlay com informações */}
      <div className="absolute bottom-4 left-4 right-4 md:right-auto bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl shadow-xl backdrop-blur-md bg-opacity-90">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center text-black shrink-0">
            <span className="text-xl">📍</span>
          </div>
          <div>
            <div className="font-bold text-[var(--text-primary)] mb-0.5">
              {settings.site_name || 'PiresQK Barbearia'}
            </div>
            <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {address}
            </div>
            <div className="text-[10px] mt-2 font-bold text-[var(--gold)] uppercase tracking-wider">
              Seg-Sab: 09:00 - 20:00
            </div>
          </div>
        </div>
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
