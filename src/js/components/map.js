'use strict';

import L from 'leaflet';
import topojson from 'topojson';
import { getColor } from '../utils/utils.js';

// add topojson support
// Copyright (c) 2013 Ryan Clark
L.TopoJSON = L.GeoJSON.extend({
  addData(jsonData) {
    if (jsonData.type === 'Topology') {
      for (const key of jsonData.objects) {
        const geojson = topojson.feature(jsonData, jsonData.objects[key]);
        L.GeoJSON.prototype.addData.call(this, geojson);
      }
    } else {
      L.GeoJSON.prototype.addData.call(this, jsonData);
    }
    return this;
  },
});
L.topoJson = function topoJson(data, options) {
  return new L.TopoJSON(data, options);
};

// config
const api = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
const config = {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'mapbox.light',
  accessToken: 'pk.eyJ1IjoibXluZGZsYW1lIiwiYSI6ImNpbXJ1am85cDAwNGx2OW0xbnU0amdkZHgifQ.56NzZw6OPm41VEqhaqGHAA',
};

// private variables
let map = null;
let info = null;
let legend = null;
let tileLayer = null;
let markerLayer = null;
let heatmapLayer = null;
let geometryLayer = null;

// private methods
function createMarker(venue) {
  function html(v) {
    const name = v.ds_pdv;
    const stats = Object.keys(v)
    .filter(k => k !== 'ds_pdv')
    .map(k => k === `<br><p>${v[k] || '-'}</p>`);
    return `<div>${name}${stats}</div>`;
  }
  return L.marker([venue.lat, venue.lon]).bindPopup(html(venue));
}
function createPoint(venue, vbl) {
  return [venue.lat, venue.lon, venue[vbl]];
}

module.exports = {
  init(node) {
    map = L.map(node, { zoomControl: false }).setView([40.417049, -3.703525], 6);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    info = L.control();
    info.onAdd = function onAdd(m) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    info.update = function update(props) {
      let content = '';
      if (props) {
        for (const k in props) {
          if (props.hasOwnProperty(k)) {
            content += `${k}: ${props[k]}<br>`;
          }
        }
      } else {
        content = 'Hover over an area';
      }
      this._div.innerHTML = `<h4>Area Data</h4>${content}`;
    };

    legend = L.control({ position: 'bottomright' });
    legend.onAdd = function onAdd(m) {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 10, 20, 50, 100, 200, 500, 1000];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += `
          <i style="background:${getColor(grades[i] + 1)}"></i>
          <span>${grades[i]}${(grades[i + 1] ? `&ndash;${grades[i + 1]}<br>` : '+')}</span>`;
      }

      return div;
    };

    tileLayer = L.tileLayer(api, config).addTo(map);
    markerLayer = L.markerClusterGroup({ disableClusteringAtZoom: 18 }).addTo(map);
    heatmapLayer = [];
    geometryLayer = [];
  },

  // markers
  clearMarkers() {
    markerLayer.clearLayers();
    return this;
  },
  addMarkers(venues) {
    if (venues.length) markerLayer.addLayers(venues.map(createMarker));
    return this;
  },
  fitBoundsMarkers() {
    map.fitBounds(markerLayer.getBounds());
    return this;
  },

  // heatmaps
  clearHeatmaps() {
    while (heatmapLayer.length) {
      const h = heatmapLayer.shift();
      map.removeLayer(h.heatmap);
    }
    return this;
  },
  clearHeatmap(area, name) {
    const mapIndex = heatmapLayer.reduce((prev, curr, index) => {
      if (curr.area === area && curr.name === name) return index;
      return prev;
    }, -1);
    if (mapIndex !== -1) {
      map.removeLayer(heatmapLayer[mapIndex].heatmap);
      heatmapLayer = [...heatmapLayer.slice(0, mapIndex),
                      ...heatmapLayer.slice(mapIndex + 1)];
    }
    return this;
  },
  addHeatmap(venues, area, name, vbl) {
    const pts = venues.map(venue => createPoint(venue, vbl));
    const max = Math.max(...pts.map(pt => pt[2]).sort((a, b) => b - a).slice(pts.length * 0.1));
    const heatmap = L.heatLayer(pts, { radius: 25, max });
    heatmap.addTo(map);
    heatmapLayer.push({ area, name, heatmap });
    return this;
  },
  fitBoundsHeatmaps() {
    // not working -> map.fitBounds(heatmapLayer.getBounds());
    return this;
  },

  // geometry
  clearGeometries() {
    while (geometryLayer.length) {
      const h = geometryLayer.shift();
      map.removeLayer(h.geometry);
    }
    return this;
  },
  clearGeometry(area, name) {
    const mapIndex = geometryLayer.reduce((prev, curr, index) => {
      if (curr.area === area && curr.name === name) return index;
      return prev;
    }, -1);
    if (mapIndex !== -1) {
      map.removeLayer(geometryLayer[mapIndex].geometry);
      geometryLayer = [...geometryLayer.slice(0, mapIndex),
                       ...geometryLayer.slice(mapIndex + 1)];
    }
    map.removeControl(info);
    map.removeControl(legend);
    map.setView([40.417049, -3.703525], 6);
    return this;
  },
  addGeometry(shapes, area, name, vbl) {
    const geometry = L.topoJson(null, {
      onEachFeature(feature, layer) {
        layer.on({
          mouseover: function highlightFeature(e) {
            e.target.setStyle({
              weight: 2,
              color: '#666',
              dashArray: '',
              fillOpacity: 0.7,
            });
            if (!L.Browser.ie && !L.Browser.opera) e.target.bringToFront();
            info.update(e.target.feature.properties);
          },
          mouseout: function resetHighlight(e) {
            geometry.resetStyle(e.target);
            info.update();
          },
          click: function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
          },
        });
      },
      style(feature) {
        return {
          fillColor: getColor(feature.properties[vbl]),
          fillOpacity: 0.7,
          weight: 1,
          opacity: 1,
          color: 'white',
          dashArray: '3',
        };
      },
    }).addData(shapes).addTo(map);
    geometryLayer.push({ area, name, geometry });
    info.addTo(map);
    legend.addTo(map);
    return this;
  },
  fitBoundsGeometries() {
    map.fitBounds(geometryLayer.getBounds());
    return this;
  },
};
