'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function iife($, L, topojson) {
  // types
  var enumLayers = Object.freeze({
    markers: 'markers',
    heatmaps: 'heatmaps',
    geometry: 'geometry'
  });

  // init variables
  var venues = [];
  var queries = [];
  var maps = [];

  // init foundation
  $(document).foundation();

  // init leaflet map and ui elements
  var map = L.map('map', { zoomControl: false }).setView([40.417049, -3.703525], 6);
  L.control.zoom({ position: 'bottomleft' }).addTo(map);

  var info = L.control();
  info.onAdd = function onAdd(m) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };
  info.update = function update(props) {
    var content = '';
    if (props) {
      for (var k in props) {
        if (props.hasOwnProperty(k)) {
          content += k + ': ' + props[k] + '<br>';
        }
      }
    } else {
      content = 'Hover over an area';
    }
    this._div.innerHTML = '<h4>Area Data</h4>' + content;
  };

  var legend = L.control({ position: 'bottomright' });
  legend.onAdd = function onAdd(m) {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [0, 10, 20, 50, 100, 200, 500, 1000];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += '\n        <i style="background:' + getColor(grades[i] + 1) + '"></i>\n        <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+') + '</span>';
    }

    return div;
  };

  // add topojson support
  // Copyright (c) 2013 Ryan Clark
  L.TopoJSON = L.GeoJSON.extend({
    addData: function addData(jsonData) {
      if (jsonData.type === 'Topology') {
        for (var key in jsonData.objects) {
          var geojson = topojson.feature(jsonData, jsonData.objects[key]);
          L.GeoJSON.prototype.addData.call(this, geojson);
        }
      } else {
        L.GeoJSON.prototype.addData.call(this, jsonData);
      }
      return this;
    }
  });
  L.topoJson = function topoJson(data, options) {
    return new L.TopoJSON(data, options);
  };

  // init layers
  var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoibXluZGZsYW1lIiwiYSI6ImNpbXJ1am85cDAwNGx2OW0xbnU0amdkZHgifQ.56NzZw6OPm41VEqhaqGHAA'
  }).addTo(map);

  var markerLayer = L.markerClusterGroup({
    disableClusteringAtZoom: 18
  }).addTo(map);

  var heatmapLayer = [];

  var geometryLayer = [];

  // helpers
  function capitalize(str) {
    return '' + str[0].toUpperCase() + str.slice(1);
  }
  function checkFetchStatus(response) {
    if (response.status >= 200 && response.status < 300) return response;
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
  function htmlMarker(name, content) {
    var twitter = content.twitter;
    var foursquare = content.foursquare;

    return '\n      <div>\n        ' + name + '\n        <br>\n        ' + twitter.statuses + '\n        <br>\n        ' + foursquare.usercount + '\n      </div>\n    ';
  }
  function createActive(type, area, name) {
    return $('\n        <li>\n          <span class="fa fa-times delete"></span>\n          <span>' + capitalize(type) + ': ' + capitalize(area) + ' - ' + capitalize(name) + '</span>\n        </li>').data('type', type).data('area', area).data('name', name);
  }
  function createMarker(venue) {
    var twitter = { statuses: venue.twitter_statuses || 0 };
    var foursquare = { usercount: venue.foursquare_usercount || 0 };
    return L.marker([venue.lat, venue.lon]).bindPopup(htmlMarker(venue.ds_pdv, { twitter: twitter, foursquare: foursquare }));
  }
  function createMarkers(activeItems) {
    return venues.filter(function (v) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = activeItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var a = _step.value;

          if (v[a.area].toLowerCase() === a.name) return true;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }).filter(function (v) {
      return v.lat && v.lon;
    }).map(createMarker);
  }
  function createPoints(area, name, vbl) {
    return venues.filter(function (v) {
      return v.lat && v.lon && v[vbl];
    }).filter(function (v) {
      return v[area].toLowerCase() === name;
    }).map(function (v) {
      return [v.lat, v.lon, v[vbl]];
    });
  }
  function getToken() {
    return fetch('./api/v1/token', { credentials: 'same-origin' }).then(checkFetchStatus).then(function (response) {
      return response.text();
    });
  }
  function getVenues(token, area, name) {
    return fetch('./api/v1/venues?area=' + area + '&name=' + name + '&token=' + token).then(checkFetchStatus).then(function (response) {
      return response.json();
    }).then(function (data) {
      var savedVenueIds = venues.map(function (venue) {
        return venue.cd_pdv;
      });
      var newVenues = data.filter(function (venue) {
        return savedVenueIds.indexOf(venue.cd_pdv) === -1;
      });
      venues.push.apply(venues, _toConsumableArray(newVenues));
      queries.push({ area: area, name: name });
    });
  }
  function getMap(token, area, name, gran) {
    return fetch('./api/v1/map?area=' + area + '&name=' + name + '&gran=' + gran + '&token=' + token).then(checkFetchStatus).then(function (response) {
      return response.json();
    }).then(function (shapes) {
      return maps.push({ area: area, name: name, gran: gran, shapes: shapes });
    });
  }
  function getColor(d) {
    return d > 1000 ? '#800026' : d > 500 ? '#BD0026' : d > 200 ? '#E31A1C' : d > 100 ? '#FC4E2A' : d > 50 ? '#FD8D3C' : d > 20 ? '#FEB24C' : d > 10 ? '#FED976' : '#FFEDA0';
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
  var api = getToken();

  // init map controls
  $('.select').on('click', '.markers', function (e) {
    e.preventDefault();
    $(e.currentTarget).addClass('active').siblings().removeClass('active');
    $('.control .markers').addClass('active').siblings().removeClass('active');
    $('.control').addClass('active');
  }).on('click', '.markers.active', function (e) {
    e.preventDefault();
    $(e.currentTarget).removeClass('active').siblings().removeClass('active');
    $('.control .markers').removeClass('active').siblings().removeClass('active');
    $('.control').removeClass('active');
  }).on('click', '.heatmaps', function (e) {
    e.preventDefault();
    $(e.currentTarget).addClass('active').siblings().removeClass('active');
    $('.control .heatmaps').addClass('active').siblings().removeClass('active');
    $('.control').addClass('active');
  }).on('click', '.heatmaps.active', function (e) {
    e.preventDefault();
    $(e.currentTarget).removeClass('active').siblings().removeClass('active');
    $('.control .heatmaps').removeClass('active').siblings().removeClass('active');
    $('.control').removeClass('active');
  }).on('click', '.geometry', function (e) {
    e.preventDefault();
    $(e.currentTarget).addClass('active').siblings().removeClass('active');
    $('.control .geometry').addClass('active').siblings().removeClass('active');
    $('.control').addClass('active');
  }).on('click', '.geometry.active', function (e) {
    e.preventDefault();
    $(e.currentTarget).removeClass('active').siblings().removeClass('active');
    $('.control .geometry').removeClass('active').siblings().removeClass('active');
    $('.control').removeClass('active');
  });

  $('.controls .layers').on('click', '.delete', function (e) {
    e.preventDefault();
    var type = $(e.currentTarget).parent().data('type');
    var area = $(e.currentTarget).parent().data('area');
    var name = $(e.currentTarget).parent().data('name');
    switch (type) {
      case enumLayers.markers:
        {
          $(e.currentTarget).parent().remove();
          var activeItems = $('.controls .layers').find('li').toArray().map(function (a) {
            return { type: $(a).data('type'), area: $(a).data('area'), name: $(a).data('name') };
          }).filter(function (a) {
            return a.type === type;
          });
          markerLayer.clearLayers();
          markerLayer.addLayers(createMarkers(activeItems));
          break;
        }
      case enumLayers.heatmaps:
        {
          var mapIndex = heatmapLayer.reduce(function (prev, curr, index) {
            if (curr.area === area && curr.name === name) return index;
            return prev;
          }, -1);
          if (mapIndex !== -1) {
            map.removeLayer(heatmapLayer[mapIndex].heatmap);
            heatmapLayer = [].concat(_toConsumableArray(heatmapLayer.slice(0, mapIndex)), _toConsumableArray(heatmapLayer.slice(mapIndex + 1)));
            $(e.currentTarget).parent().remove();
          }
          break;
        }
      case enumLayers.geometry:
        {
          var _mapIndex = geometryLayer.reduce(function (prev, curr, index) {
            if (curr.area === area && curr.name === name) return index;
            return prev;
          }, -1);
          if (_mapIndex !== -1) {
            map.removeLayer(geometryLayer[_mapIndex].geometry);
            geometryLayer = [].concat(_toConsumableArray(geometryLayer.slice(0, _mapIndex)), _toConsumableArray(geometryLayer.slice(_mapIndex + 1)));
            $(e.currentTarget).parent().remove();
          }
          map.removeControl(info);
          map.removeControl(legend);
          map.setView([40.417049, -3.703525], 6);
          break;
        }
      default:
        {
          break;
        }
    }
  });

  $('.control .markers').on('click', '.advanced', function (e) {
    e.preventDefault();
  }).on('click', '.add', function (e) {
    e.preventDefault();
    var type = enumLayers.markers;
    var area = $('.control .markers').find('input[type="radio"]:checked').val().trim().toLowerCase();
    var name = $('.control .markers').find('.name').val().trim().toLowerCase();
    if (!area || !name) return;

    var activeItems = $('.controls .layers').find('li').toArray().map(function (a) {
      return { type: $(a).data('type'), area: $(a).data('area'), name: $(a).data('name') };
    }).filter(function (a) {
      return a.type === type;
    });
    if (activeItems.find(function (a) {
      return a.area === area && a.name === name;
    })) return;

    $('.loading').toggle();
    var p = queries.find(function (a) {
      return a.area === area && a.name === name;
    }) ? Promise.resolve() : api.then(function (token) {
      return getVenues(token, area, name);
    });

    p.then(function () {
      activeItems.push({ type: type, area: area, name: name });
      markerLayer.clearLayers();
      markerLayer.addLayers(createMarkers(activeItems));
      map.fitBounds(markerLayer.getBounds());
      $('.controls .layers').find('ul').append(createActive(type, area, name));
      resetControls();
      $('.loading').toggle();
    }).catch(function () {
      return $('.loading').toggle();
    });
  }).on('click', '.cancel', function (e) {
    e.preventDefault();
    resetControls();
  });

  $('.control .heatmaps').on('click', '.advanced', function (e) {
    e.preventDefault();
  }).on('click', '.add', function (e) {
    e.preventDefault();
    if ($('.control .heatmaps').find('.variable').prop('selectedIndex') === 0) return;

    var type = enumLayers.heatmaps;
    var area = $('.control .heatmaps').find('input[type="radio"]:checked').val().trim().toLowerCase();
    var name = $('.control .heatmaps').find('.name').val().trim().toLowerCase();
    var vbl = $('.control .heatmaps').find('.variable').val().trim().toLowerCase();
    if (!area || !name || !vbl) return;

    var activeItems = $('.controls .layers').find('li').toArray().map(function (a) {
      return { type: $(a).data('type'), area: $(a).data('area'), name: $(a).data('name') };
    }).filter(function (a) {
      return a.type === type;
    });
    if (activeItems.find(function (a) {
      return a.area === area && a.name === name;
    })) return;

    $('.loading').toggle();
    var p = queries.find(function (a) {
      return a.area === area && a.name === name;
    }) ? Promise.resolve() : api.then(function (token) {
      return getVenues(token, area, name);
    });

    p.then(function () {
      var pts = createPoints(area, name, vbl);
      var max = Math.max.apply(Math, _toConsumableArray(pts.map(function (pt) {
        return pt[2];
      }).sort(function (a, b) {
        return b - a;
      }).slice(pts.length * 0.1)));
      var heatmap = L.heatLayer(pts, { radius: 25, max: max });
      heatmap.addTo(map);
      heatmapLayer.push({ area: area, name: name, heatmap: heatmap });
      // not working -> map.fitBounds(heatmapLayer.getBounds());
      $('.controls .layers').find('ul').append(createActive(type, area, name));
      resetControls();
      $('.loading').toggle();
    }).catch(function () {
      return $('.loading').toggle();
    });
  }).on('click', '.cancel', function (e) {
    e.preventDefault();
    resetControls();
  });

  $('.control .geometry').on('click', '.advanced', function (e) {
    e.preventDefault();
  }).on('click', '.add', function (e) {
    e.preventDefault();
    if ($('.control .geometry').find('.variable').prop('selectedIndex') === 0) return;

    var type = enumLayers.geometry;
    var area = $('.control .geometry').find('input[type="radio"]:checked').val().trim().toLowerCase();
    var name = $('.control .geometry').find('.name').val().trim().toLowerCase();
    var gran = $('.control .geometry').find('.gran').val().trim().toLowerCase();
    var vbl = $('.control .geometry').find('.variable').val().trim().toLowerCase();
    if (!area || !name || !gran || !vbl) return;

    var activeItems = $('.controls .layers').find('li').toArray().map(function (a) {
      return { type: $(a).data('type'), area: $(a).data('area'), name: $(a).data('name') };
    }).filter(function (a) {
      return a.type === type;
    });
    if (activeItems.length) return;

    $('.loading').toggle();
    var p = maps.filter(function (a) {
      return a.area === area;
    }).map(function (a) {
      return a.name;
    }).indexOf(name) === -1 ? api.then(function (token) {
      return getMap(token, area, name, gran);
    }) : Promise.resolve();

    p.then(function () {
      var shapes = maps.find(function (m) {
        return m.area === area && m.name === name && m.gran === gran;
      }).shapes;
      var geometry = L.topoJson(null, {
        onEachFeature: function onEachFeature(feature, layer) {
          layer.on({
            mouseover: function highlightFeature(e) {
              e.target.setStyle({
                weight: 2,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
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
            }
          });
        },
        style: function style(feature) {
          return {
            fillColor: getColor(feature.properties[vbl]),
            fillOpacity: 0.7,
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3'
          };
        }
      }).addData(shapes).addTo(map);
      geometryLayer.push({ area: area, name: name, geometry: geometry });
      info.addTo(map);
      legend.addTo(map);
      map.fitBounds(geometry.getBounds());
      $('.controls .layers').find('ul').append(createActive(type, area, name));
      resetControls();
      $('.loading').toggle();
    }).catch(function () {
      return $('.loading').toggle();
    });
  }).on('click', '.cancel', function (e) {
    e.preventDefault();
    resetControls();
  });
})($, L, topojson);