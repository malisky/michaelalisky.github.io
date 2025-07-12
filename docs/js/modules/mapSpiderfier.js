// Enhanced Spiderfier utility for overlapping markers
// Spreads markers in a circle, draws dotted lines to center, and supports tooltips

let spiderLines = [];
let spiderTooltips = [];
let spiderCenter = null;

export function spiderfyMarkers(map, markers) {
  console.log("spiderfyMarkers called", markers.length, "markers");
  if (!markers || markers.length <= 1) return;
  spiderCenter = markers[0].getLatLng();

  // Calculate centroid of all marker positions
  let sumLat = 0, sumLng = 0;
  markers.forEach(m => {
    sumLat += m.getLatLng().lat;
    sumLng += m.getLatLng().lng;
  });
  const centroid = {
    lat: sumLat / markers.length,
    lng: sumLng / markers.length
  };

  // Dynamic spread: for each marker, calculate direction from centroid and offset by a fixed pixel distance
  const basePixelRadius = 60; // Spread radius in pixels
  const centroidPt = map.latLngToContainerPoint(centroid);

  markers.forEach((marker, i) => {
    const origLatLng = marker.getLatLng();
    const origPt = map.latLngToContainerPoint(origLatLng);
    // Direction vector from centroid to marker
    let dx = origPt.x - centroidPt.x;
    let dy = origPt.y - centroidPt.y;
    // Normalize direction
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= len;
    dy /= len;
    // Offset by basePixelRadius
    const newPt = L.point(
      centroidPt.x + dx * basePixelRadius,
      centroidPt.y + dy * basePixelRadius
    );
    const newLatLng = map.containerPointToLatLng(newPt);
    console.log(`Moving marker ${i} to`, newLatLng.lat, newLatLng.lng);
    marker._originalLatLng = origLatLng;
    marker.setLatLng([newLatLng.lat, newLatLng.lng]);
    const el = marker.getElement();
    if (el) el.classList.add('spiderfied');

    // Draw dotted line from marker to centroid
    console.log(`Drawing line from [${newLatLng.lat}, ${newLatLng.lng}] to [${centroid.lat}, ${centroid.lng}]`);
    const line = L.polyline([
      [newLatLng.lat, newLatLng.lng],
      [centroid.lat, centroid.lng]
    ], {
      color: '#888',
      weight: 2,
      dashArray: '4, 6',
      interactive: false
    }).addTo(map);
    spiderLines.push(line);

    // Prepare tooltip (smaller, offset away from centroid)
    const data = marker._markerData;
    const tooltipContent = `
      <div class="spider-tooltip">
        <img src="${data.image}" alt="${data.title}" />
        <div class="spider-tooltip-text">${data.title}</div>
      </div>
    `;
    // Offset tooltip 24px away from marker, in direction away from centroid
    const tooltipOffset = [dx * 24, dy * 24];
    const tooltip = L.tooltip({
      permanent: false,
      direction: 'auto',
      className: 'spider-tooltip-leaflet',
      offset: tooltipOffset,
      opacity: 1
    })
      .setContent(tooltipContent)
      .setLatLng([newLatLng.lat, newLatLng.lng]);
    spiderTooltips.push({ marker, tooltip });
    // Do not add to map yet; show on hover
  });
}

export function unspiderfyMarkers(map, markers) {
  if (!markers) return;
  markers.forEach(marker => {
    if (marker._originalLatLng) {
      marker.setLatLng(marker._originalLatLng);
      delete marker._originalLatLng;
    }
    const el = marker.getElement();
    if (el) el.classList.remove('spiderfied', 'spiderfied-hover');
  });
  // Remove lines
  spiderLines.forEach(line => map.removeLayer(line));
  spiderLines = [];
  // Remove tooltips
  spiderTooltips.forEach(({ tooltip }) => {
    if (tooltip._map) tooltip.remove();
  });
  spiderTooltips = [];
  spiderCenter = null;
}

export function showSpiderTooltip(map, marker) {
  // Find the tooltip for this marker
  const found = spiderTooltips.find(obj => obj.marker === marker);
  if (found && !map.hasLayer(found.tooltip)) {
    found.tooltip.addTo(map);
  }
  const el = marker.getElement();
  if (el) el.classList.add('spiderfied-hover');
}

export function hideSpiderTooltip(map, marker) {
  const found = spiderTooltips.find(obj => obj.marker === marker);
  if (found && found.tooltip._map) {
    found.tooltip.remove();
  }
  const el = marker.getElement();
  if (el) el.classList.remove('spiderfied-hover');
}
