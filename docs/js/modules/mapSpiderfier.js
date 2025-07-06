/**
 * Marker spiderfier for overlapping markers.
 * Handles overlapping markers by spreading them out when clicked
 */

function initSpiderfier(map) {
  const countryMarkers = {};
  
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
          
          const markersInCountry = countryMarkers[country] || [];
          
          // If there's only one marker in this country, open directly
          if (markersInCountry.length === 1) {
            const link = marker.options?.link || "#";
            window.open(link, "_blank");
            return;
          }

          // If multiple markers and already spiderfied for this country, open link
          if (this.spiderfied && this.currentCountry === country) {
            const link = marker.options?.link || "#";
            window.open(link, "_blank");
          } else {
            // Spiderfy the markers for this country
            this.spiderfy(country);
          }
        });
      } else {
        // For markers without country group, just open link directly
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          const link = marker.options?.link || "#";
          window.open(link, "_blank");
        });
      }

      return marker;
    },

    spiderfy(country) {
      if (this.spiderfied && this.currentCountry === country) return;
      if (this.spiderfied) this.unspiderfy();

      const markers = countryMarkers[country] || [];
      if (markers.length <= 1) return; // Don't spiderfy single markers

      this.currentCountry = country;
      this.spiderfied = true;

      const lats = markers.map(m => m.getLatLng().lat);
      const lngs = markers.map(m => m.getLatLng().lng);
      const center = L.latLng(
        lats.reduce((a, b) => a + b, 0) / lats.length,
        lngs.reduce((a, b) => a + b, 0) / lngs.length
      );

      const angleStep = (2 * Math.PI) / markers.length;
      const baseLength = 0.05;
      const zoomFactor = Math.pow(0.7, map.getZoom() - 8);
      const spokeLength = Math.max(baseLength * zoomFactor, 0.01);

      markers.forEach((marker, i) => {
        const angle = i * angleStep;
        const radius = spokeLength * (1 + i * 0.1);
        const newLat = center.lat + radius * Math.cos(angle);
        const newLng = center.lng + radius * Math.sin(angle);

        marker._originalLatLng = marker.getLatLng();
        this._animateMarkerMove(marker, newLat, newLng);

        const element = marker.getElement();
        if (element) {
          element.classList.add('spiderfied');
        }
      });

      // Close spiderfy when clicking elsewhere on map
      const closeHandler = () => {
        this.unspiderfy();
        map.off('click', closeHandler);
      };
      
      setTimeout(() => {
        map.on('click', closeHandler);
      }, 100);
    },

    unspiderfy() {
      if (!this.spiderfied || !this.currentCountry) return;

      const markers = countryMarkers[this.currentCountry] || [];
      markers.forEach(marker => {
        if (marker._originalLatLng) {
          this._animateMarkerMove(marker, marker._originalLatLng.lat, marker._originalLatLng.lng);
          delete marker._originalLatLng;
        }

        setTimeout(() => {
          const element = marker.getElement();
          if (element) {
            element.classList.remove('spiderfied');
          }
        }, 300);
      });

      this.spiderfied = false;
      this.currentCountry = null;
    },

    _animateMarkerMove(marker, newLat, newLng) {
      const startPos = marker.getLatLng();
      const endPos = L.latLng(newLat, newLng);
      const duration = 400;
      const start = performance.now();

      const animate = (timestamp) => {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

        marker.setLatLng([
          startPos.lat + (endPos.lat - startPos.lat) * eased,
          startPos.lng + (endPos.lng - startPos.lng) * eased
        ]);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  };

  return spiderfier;
}
