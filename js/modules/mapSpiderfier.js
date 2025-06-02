/**
 * Marker spiderfier for overlapping markers
 * Handles overlapping markers by spreading them out when clicked
 */

function initSpiderfier(map) {
  const countryMarkers = {};
  let currentCountry = null;

  const spiderfier = {
    markers: [],
    spiderfied: false,
    currentCountry: null,

    addMarker(marker) {
      this.markers.push(marker);

      if (marker.countryGroup) {
        const country = marker.countryGroup;
        if (!countryMarkers[country]) countryMarkers[country] = [];
        countryMarkers[country].push(marker);

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);

          if (this.spiderfied && this.currentCountry === country) {
            window.location.href = marker.options.link || marker._path;
          } else {
            this.spiderfy(country);
          }
        });
      }

      return marker;
    },

    spiderfy(country) {
      if (this.spiderfied && this.currentCountry === country) return;
      if (this.spiderfied) this.unspiderfy();

      const markers = countryMarkers[country] || [];
      if (!markers.length) return;

      this.currentCountry = country;
      this.spiderfied = true;

      const lats = markers.map(m => m.getLatLng().lat);
      const lngs = markers.map(m => m.getLatLng().lng);
      const center = L.latLng(
        lats.reduce((a, b) => a + b, 0) / lats.length,
        lngs.reduce((a, b) => a + b, 0) / lngs.length
      );

      const angleStep = (2 * Math.PI) / markers.length;
      const baseLength = 0.03;
      const zoomFactor = Math.pow(0.8, map.getZoom() - 10);
      const spokeLength = baseLength * zoomFactor;

      markers.forEach((marker, i) => {
        const angle = i * angleStep;
        const radius = spokeLength * (1 + i * 0.2);
        const newLat = center.lat + radius * Math.cos(angle);
        const newLng = center.lng + radius * Math.sin(angle);

        marker._originalLatLng = marker.getLatLng();
        this._animateMarkerMove(marker, newLat, newLng);

        marker.getElement()?.classList.add('spiderfied');
      });

      map.once('click', () => this.unspiderfy());
    },

    unspiderfy() {
      if (!this.spiderfied) return;

      const markers = countryMarkers[this.currentCountry] || [];
      markers.forEach(marker => {
        if (marker._originalLatLng) {
          this._animateMarkerMove(marker, marker._originalLatLng.lat, marker._originalLatLng.lng);
          delete marker._originalLatLng;
        }
        marker.getElement()?.classList.remove('spiderfied');
      });

      this.spiderfied = false;
      this.currentCountry = null;
    },

    _animateMarkerMove(marker, newLat, newLng) {
      const startPos = marker.getLatLng();
      const endPos = L.latLng(newLat, newLng);
      const duration = 500;
      const start = performance.now();

      function animate(timestamp) {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        marker.setLatLng([
          startPos.lat + (endPos.lat - startPos.lat) * eased,
          startPos.lng + (endPos.lng - startPos.lng) * eased
        ]);

        if (progress < 1) requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    }
  };

  return spiderfier;
}
