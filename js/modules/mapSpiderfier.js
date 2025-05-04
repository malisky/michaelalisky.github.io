function initSpiderfier(map) {
  let countryMarkers = {};
  let activeCountry = null;

  const spiderfier = {
    markers: [],
    spiderfied: false,
    currentCountry: null,

    addMarker: function (marker) {
      this.markers.push(marker);

      if (marker.countryGroup) {
        const country = marker.countryGroup;

        if (!countryMarkers[country]) {
          countryMarkers[country] = [];
        }

        countryMarkers[country].push(marker);
        marker._originalLatLng = marker.getLatLng();

        marker.on('click', () => {
          if (this.spiderfied) {
            this.unspreadMarkers();
          } else if (country === 'Kazakhstan') {
            this.spreadMarkers(country);
          }
        });

        marker.on('mouseover', () => {
          if (country === 'Kazakhstan' && window.kzLayer) {
            window.kzLayer.setStyle({ color: '#ff6600', weight: 4 });
          }
        });

        marker.on('mouseout', () => {
          if (country === 'Kazakhstan' && window.kzLayer) {
            window.kzLayer.setStyle({ color: '#ffcc00', weight: 2 });
          }
        });
      }

      return marker;
    },

    spreadMarkers: function (country) {
      if (!countryMarkers[country]) return;

      const markers = countryMarkers[country];
      const center = markers[0]._originalLatLng;
      const angleStep = (2 * Math.PI) / markers.length;
      const radius = 0.03;

      markers.forEach((marker, i) => {
        const angle = angleStep * i;
        const offsetLat = center.lat + radius * Math.cos(angle);
        const offsetLng = center.lng + radius * Math.sin(angle);
        const newLatLng = L.latLng(offsetLat, offsetLng);

        const line = L.polyline([center, newLatLng], {
          color: '#666',
          weight: 1,
          dashArray: '4,4',
          interactive: false,
        }).addTo(map);

        marker.setLatLng(newLatLng);
        marker._spiderLine = line;
      });

      this.spiderfied = true;
      this.currentCountry = country;
    },

    unspreadMarkers: function () {
      if (!this.spiderfied || !this.currentCountry) return;

      const markers = countryMarkers[this.currentCountry];
      markers.forEach((marker) => {
        marker.setLatLng(marker._originalLatLng);
        if (marker._spiderLine) {
          map.removeLayer(marker._spiderLine);
          delete marker._spiderLine;
        }
      });

      this.spiderfied = false;
      this.currentCountry = null;
    },
  };

  return spiderfier;
}
