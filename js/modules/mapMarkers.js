/**
 * Marker creation and management
 * Handles loading newsletter data and creating map markers
 */

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
  const locationsByCountry = groupMarkersByCountry(data);

  data.forEach(entry => {
    if (!entry.location || typeof entry.location.lat !== 'number' || typeof entry.location.lng !== 'number') {
      console.warn('Skipping invalid entry:', entry);
      return;
    }

    const marker = L.marker([entry.location.lat, entry.location.lng], {
      icon: markerIcon,
    });

    marker.bindTooltip(entry.title, {
      direction: 'top',
      offset: L.point(0, -10)
    });

    marker.newsletterId = entry.id;
    marker.newsletterTitle = entry.title;
    marker.newsletterLocation = entry.location_name || '';
    marker._path = entry.link;

    if (entry.location_name) {
      const country = extractCountry(entry.location_name);
      if (country && locationsByCountry[country] && locationsByCountry[country].length > 1) {
        marker.countryGroup = country;
      }

      marker.on('click', () => {
        window.location.href = entry.link;
      });
    } else {
      marker.on('click', () => {
        window.location.href = entry.link;
      });
    }

    marker.on('mouseover', () => {
      marker.getElement()?.classList.add('hover');
    });

    marker.on('mouseout', () => {
      marker.getElement()?.classList.remove('hover');
    });

    const markerElement = marker.getElement();
    if (markerElement) {
      markerElement.style.cursor = 'pointer';
    }

    marker.addTo(map);

    if (spiderfier) {
      spiderfier.addMarker(marker);
    }

    allMarkers.push(marker);
    validCount++;
  });

  if (validCount > 0) {
    fitAllMarkers(map);
  } else {
    handleDataError("No valid markers created");
  }

  return allMarkers;
}

function extractCountry(locationString) {
  if (!locationString) return null;
  const parts = locationString.split(',');
  return parts.length > 1 ? parts[parts.length - 1].trim() : locationString.trim();
}

function groupMarkersByCountry(data) {
  const groups = {};
  data.forEach(entry => {
    if (entry.location && entry.location_name) {
      const country = extractCountry(entry.location_name);
      if (country) {
        if (!groups[country]) groups[country] = [];
        groups[country].push(entry);
      }
    }
  });
  return groups;
}

function fitAllMarkers(map) {
  if (allMarkers.length > 0) {
    const bounds = L.featureGroup(allMarkers).getBounds();
    map.flyToBounds(bounds, {
      padding: [50, 50],
      duration: 1.5,
      easeLinearity: 0.5
    });
  }
}

function handleDataError(error) {
  console.error('Error loading newsletter data:', error);
  const mapContainer = document.querySelector('.map-full-width');
  if (mapContainer) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'map-error';
    errorDiv.textContent = 'Could not load newsletter locations';
    mapContainer.appendChild(errorDiv);
  }
}
