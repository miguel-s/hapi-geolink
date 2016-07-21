'use strict';

(function iife($, L, topojson) {
  // types
  const enumLayers = Object.freeze({
    markers: 'markers',
    heatmaps: 'heatmaps',
    geometry: 'geometry',
  });

  // init variables
  const venues = [];
  const queries = [];
  const maps = [];

  // init foundation
  $(document).foundation();

  // init leaflet map and ui elements
  const map = L.map('map', { zoomControl: false }).setView([40.417049, -3.703525], 6);
  L.control.zoom({ position: 'bottomleft' }).addTo(map);

  const info = L.control();
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

  const legend = L.control({ position: 'bottomright' });
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

  // add topojson support
  // Copyright (c) 2013 Ryan Clark
  L.TopoJSON = L.GeoJSON.extend({
    addData(jsonData) {
      if (jsonData.type === 'Topology') {
        for (const key in jsonData.objects) {
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

  // init layers
  const tileLayer = L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.light',
      accessToken: 'pk.eyJ1IjoibXluZGZsYW1lIiwiYSI6ImNpbXJ1am85cDAwNGx2OW0xbnU0amdkZHgifQ.56NzZw6OPm41VEqhaqGHAA',
    }
  ).addTo(map);

  const markerLayer = L.markerClusterGroup({
    disableClusteringAtZoom: 18,
  }).addTo(map);

  let heatmapLayer = [];

  let geometryLayer = [];

  // helpers
  function capitalize(str) {
    return `${str[0].toUpperCase()}${str.slice(1)}`;
  }
  function checkFetchStatus(response) {
    if (response.status >= 200 && response.status < 300) return response;
    const error = new Error(response.statusText);
    error.response = response;
    throw new Error(error);
  }
  function htmlMarker(name, content) {
    const { twitter, foursquare } = content;
    return `
      <div>
        ${name}
        <br>
        ${twitter.statuses}
        <br>
        ${foursquare.usercount}
      </div>
    `;
  }
  function createActive(type, area, name) {
    return $(`
        <li>
          <span class="fa fa-times delete"></span>
          <span>${capitalize(type)}: ${capitalize(area)} - ${capitalize(name)}</span>
        </li>`
      )
      .data('type', type)
      .data('area', area)
      .data('name', name);
  }
  function createMarker(venue) {
    const twitter = { statuses: venue.twitter_statuses || 0 };
    const foursquare = { usercount: venue.foursquare_usercount || 0 };
    return L.marker([venue.lat, venue.lon])
      .bindPopup(htmlMarker(venue.ds_pdv, { twitter, foursquare }));
  }
  function createMarkers(activeItems) {
    return venues
      .filter((v) => {
        for (const a of activeItems) {
          if (v[a.area].toLowerCase() === a.name) return true;
        }
        return false;
      })
      .filter(v => v.lat && v.lon)
      .map(createMarker);
  }
  function createPoints(area, name, vbl) {
    return venues
      .filter(v => v.lat && v.lon && v[vbl])
      .filter(v => v[area].toLowerCase() === name)
      .map(v => [v.lat, v.lon, v[vbl]]);
  }
  function getToken() {
    return fetch('./api/v1/token', { credentials: 'same-origin' })
      .then(checkFetchStatus)
      .then(response => response.text());
  }
  function getVenues(token, area, name) {
    return fetch(`./api/v1/venues?area=${area}&name=${name}&token=${token}`)
      .then(checkFetchStatus)
      .then(response => response.json())
      .then((data) => {
        const savedVenueIds = venues.map(venue => venue.cd_pdv);
        const newVenues = data.filter(venue => savedVenueIds.indexOf(venue.cd_pdv) === -1);
        venues.push(...newVenues);
        queries.push({ area, name });
      });
  }
  function getMap(token, area, name, gran) {
    return fetch(`./api/v1/map?area=${area}&name=${name}&gran=${gran}&token=${token}`)
      .then(checkFetchStatus)
      .then(response => response.json())
      .then(shapes => maps.push({ area, name, gran, shapes }));
  }
  function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
  }
  function resetControls() {
    // markers
    $('.control .markers').find('#marker-city').prop('checked', true);
    $('.control .markers').find('.name').val('');
    $('.select .markers').removeClass('active');
    $('.control .markers').removeClass('active');
    $('.control').removeClass('active');

    // heatmaps
    $('.control .heatmaps').find('#heatmap-city').prop('checked', true);
    $('.control .heatmaps').find('.name').val('');
    $('.control .heatmaps').find('.variable').val('');
    $('.select .heatmaps').removeClass('active');
    $('.control .heatmaps').removeClass('active');
    $('.control').removeClass('active');

    // geometry
    $('.control .geometry').find('#geometry-city').prop('checked', true);
    $('.control .geometry').find('.name').val('');
    $('.control .geometry').find('.gran').val('');
    $('.select .geometry').removeClass('active');
    $('.control .geometry').removeClass('active');
    $('.control').removeClass('active');
  }

  // fetch api token
  const api = getToken();

  // init map controls
  $('.select')
  .on('click', '.markers', (e) => {
    e.preventDefault();
    $(e.currentTarget).addClass('active').siblings().removeClass('active');
    $('.control .markers').addClass('active').siblings().removeClass('active');
    $('.control').addClass('active');
  })
  .on('click', '.markers.active', (e) => {
    e.preventDefault();
    $(e.currentTarget).removeClass('active').siblings().removeClass('active');
    $('.control .markers').removeClass('active').siblings().removeClass('active');
    $('.control').removeClass('active');
  })
  .on('click', '.heatmaps', (e) => {
    e.preventDefault();
    $(e.currentTarget).addClass('active').siblings().removeClass('active');
    $('.control .heatmaps').addClass('active').siblings().removeClass('active');
    $('.control').addClass('active');
  })
  .on('click', '.heatmaps.active', (e) => {
    e.preventDefault();
    $(e.currentTarget).removeClass('active').siblings().removeClass('active');
    $('.control .heatmaps').removeClass('active').siblings().removeClass('active');
    $('.control').removeClass('active');
  })
  .on('click', '.geometry', (e) => {
    e.preventDefault();
    $(e.currentTarget).addClass('active').siblings().removeClass('active');
    $('.control .geometry').addClass('active').siblings().removeClass('active');
    $('.control').addClass('active');
  })
  .on('click', '.geometry.active', (e) => {
    e.preventDefault();
    $(e.currentTarget).removeClass('active').siblings().removeClass('active');
    $('.control .geometry').removeClass('active').siblings().removeClass('active');
    $('.control').removeClass('active');
  });

  $('.controls .layers')
  .on('click', '.delete', (e) => {
    e.preventDefault();
    const type = $(e.currentTarget).parent().data('type');
    const area = $(e.currentTarget).parent().data('area');
    const name = $(e.currentTarget).parent().data('name');
    switch (type) {
      case enumLayers.markers: {
        $(e.currentTarget).parent().remove();
        const activeItems = $('.controls .layers').find('li').toArray()
          .map(a => ({ type: $(a).data('type'), area: $(a).data('area'), name: $(a).data('name') }))
          .filter(a => a.type === type);
        markerLayer.clearLayers();
        markerLayer.addLayers(createMarkers(activeItems));
        break;
      }
      case enumLayers.heatmaps: {
        const mapIndex = heatmapLayer.reduce((prev, curr, index) => {
          if (curr.area === area && curr.name === name) return index;
          return prev;
        }, -1);
        if (mapIndex !== -1) {
          map.removeLayer(heatmapLayer[mapIndex].heatmap);
          heatmapLayer = [...heatmapLayer.slice(0, mapIndex),
                          ...heatmapLayer.slice(mapIndex + 1)];
          $(e.currentTarget).parent().remove();
        }
        break;
      }
      case enumLayers.geometry: {
        const mapIndex = geometryLayer.reduce((prev, curr, index) => {
          if (curr.area === area && curr.name === name) return index;
          return prev;
        }, -1);
        if (mapIndex !== -1) {
          map.removeLayer(geometryLayer[mapIndex].geometry);
          geometryLayer = [...geometryLayer.slice(0, mapIndex),
                          ...geometryLayer.slice(mapIndex + 1)];
          $(e.currentTarget).parent().remove();
        }
        map.removeControl(info);
        map.removeControl(legend);
        map.setView([40.417049, -3.703525], 6);
        break;
      }
      default: {
        break;
      }
    }
  });

  $('.control .markers')
  .on('click', '.advanced', (e) => {
    e.preventDefault();
  })
  .on('click', '.add', (e) => {
    e.preventDefault();
    const type = enumLayers.markers;
    const area = $('.control .markers').find('input[type="radio"]:checked').val().trim().toLowerCase();
    const name = $('.control .markers').find('.name').val().trim().toLowerCase();
    if (!area || !name) return;

    const activeItems = $('.controls .layers').find('li').toArray()
      .map(a => ({ type: $(a).data('type'), area: $(a).data('area'), name: $(a).data('name') }))
      .filter(a => a.type === type);
    if (activeItems.find(a => a.area === area && a.name === name)) return;

    $('.loading').toggle();
    const p = queries.find(a => a.area === area && a.name === name)
      ? Promise.resolve()
      : api.then(token => getVenues(token, area, name));

    p.then(() => {
      activeItems.push({ type, area, name });
      markerLayer.clearLayers();
      markerLayer.addLayers(createMarkers(activeItems));
      map.fitBounds(markerLayer.getBounds());
      $('.controls .layers').find('ul').append(createActive(type, area, name));
      resetControls();
      $('.loading').toggle();
    })
    .catch(() => $('.loading').toggle());
  })
  .on('click', '.cancel', (e) => {
    e.preventDefault();
    resetControls();
  });

  $('.control .heatmaps')
  .on('click', '.advanced', (e) => {
    e.preventDefault();
  })
  .on('click', '.add', (e) => {
    e.preventDefault();
    if ($('.control .heatmaps').find('.variable').prop('selectedIndex') === 0) return;

    const type = enumLayers.heatmaps;
    const area = $('.control .heatmaps').find('input[type="radio"]:checked').val().trim().toLowerCase();
    const name = $('.control .heatmaps').find('.name').val().trim().toLowerCase();
    const vbl = $('.control .heatmaps').find('.variable').val().trim().toLowerCase();
    if (!area || !name || !vbl) return;

    const activeItems = $('.controls .layers').find('li').toArray()
      .map(a => ({ type: $(a).data('type'), area: $(a).data('area'), name: $(a).data('name') }))
      .filter(a => a.type === type);
    if (activeItems.find(a => a.area === area && a.name === name)) return;

    $('.loading').toggle();
    const p = queries.find(a => a.area === area && a.name === name)
      ? Promise.resolve()
      : api.then(token => getVenues(token, area, name));

    p.then(() => {
      const pts = createPoints(area, name, vbl);
      const max = Math.max(...pts.map(pt => pt[2]).sort((a, b) => b - a).slice(pts.length * 0.1));
      const heatmap = L.heatLayer(pts, { radius: 25, max });
      heatmap.addTo(map);
      heatmapLayer.push({ area, name, heatmap });
      // not working -> map.fitBounds(heatmapLayer.getBounds());
      $('.controls .layers').find('ul').append(createActive(type, area, name));
      resetControls();
      $('.loading').toggle();
    })
    .catch(() => $('.loading').toggle());
  })
  .on('click', '.cancel', (e) => {
    e.preventDefault();
    resetControls();
  });

  $('.control .geometry')
  .on('click', '.advanced', (e) => {
    e.preventDefault();
  })
  .on('click', '.add', (e) => {
    e.preventDefault();
    if ($('.control .geometry').find('.variable').prop('selectedIndex') === 0) return;

    const type = enumLayers.geometry;
    const area = $('.control .geometry').find('input[type="radio"]:checked').val().trim().toLowerCase();
    const name = $('.control .geometry').find('.name').val().trim().toLowerCase();
    const gran = $('.control .geometry').find('.gran').val().trim().toLowerCase();
    const vbl = $('.control .geometry').find('.variable').val().trim().toLowerCase();
    if (!area || !name || !gran || !vbl) return;

    const activeItems = $('.controls .layers').find('li').toArray()
      .map(a => ({ type: $(a).data('type'), area: $(a).data('area'), name: $(a).data('name') }))
      .filter(a => a.type === type);
    if (activeItems.length) return;

    $('.loading').toggle();
    const p = (maps.filter(a => a.area === area).map(a => a.name).indexOf(name) === -1)
      ? api.then(token => getMap(token, area, name, gran))
      : Promise.resolve();

    p.then(() => {
      const shapes = maps.find(m => m.area === area && m.name === name && m.gran === gran).shapes;
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
      map.fitBounds(geometry.getBounds());
      $('.controls .layers').find('ul').append(createActive(type, area, name));
      resetControls();
      $('.loading').toggle();
    })
    .catch(() => $('.loading').toggle());
  })
  .on('click', '.cancel', (e) => {
    e.preventDefault();
    resetControls();
  });
}($, L, topojson));
