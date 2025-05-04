// Global array to store all markers
let allMarkers = [];

function initMapMarkers(map) {
  const markerIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: '<div class="marker-dot"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  const spiderfier = initSpiderfier(map);

  loadNewsletterData()
    .then(data => createMarkers(data, map, markerIcon, spiderfier))
    .catch(handleDataError);

  window.fitAllMarkers = function () {
    fitAllMarkers(map);
  };
}

async function loadNewsletterData() {
  try {
    const response = await fetch('/newsletter/newsletters.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading newsletter data:', error);
    throw error;
  }
}

function createMarkers(data, map, markerIcon, spiderfier) {
  let validCount = 0;

  data.forEach(entry => {
    const location = entry.location;
    if (!entry.link || !location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      console.warn('Skipping invalid entry:', entry);
      return;
    }

    const marker = L.marker([location.lat, location.lng], {
      icon: markerIcon,
      title: entry.title || '',
      alt: entry.title || '',
      link: entry.link,
    });

    marker.countryGroup = entry.location_name?.includes('Kazakhstan') ? 'Kazakhstan' : null;

    marker.on('click', () => {
      window.location.href = entry.link;
    });

    marker.addTo(map);
    spiderfier.addMarker(marker);
    allMarkers.push(marker);
    validCount++;
  });

  if (validCount === 0) {
    handleDataError("No valid markers");
  }
}

function fitAllMarkers(map) {
  if (allMarkers.length === 0) return;
  const group = L.featureGroup(allMarkers);
  map.fitBounds(group.getBounds().pad(0.2));
}

function handleDataError(error) {
  console.error('Map data error:', error);

  const mapContainer = document.querySelector('.map-full-width');
  if (mapContainer) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'map-error';
    errorDiv.textContent = 'Could not load newsletter locations';
    mapContainer.appendChild(errorDiv);
  }
}
