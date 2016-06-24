'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function iife($, L) {
  // init variables
  var token = '';
  var venues = {
    saved: [],
    active: []
  };
  var queries = {
    countries: [],
    regions: [],
    cities: []
  };

  // init foundation
  $(document).foundation();

  // init leaflet map
  var map = L.map('map').setView([40.417049, -3.703525], 6);

  // add tile layer to leaflet map
  var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoibXluZGZsYW1lIiwiYSI6ImNpbXJ1am85cDAwNGx2OW0xbnU0amdkZHgifQ.56NzZw6OPm41VEqhaqGHAA'
  }).addTo(map);

  // add marker layer to leaflet map
  var markerLayer = L.markerClusterGroup({
    disableClusteringAtZoom: 18
  }).addTo(map);

  // add heatmap layer to leaflet map
  var heatmapLayer = [];

  // fetch api token
  var get = fetch('./api/v1/token', { credentials: 'same-origin' }).then(function (response) {
    return response.text();
  }).then(function (t) {
    token = t;
    setTimeout(function () {
      return $('.loading').toggle();
    }, 1000);
  }).catch(function (err) {
    return console.log(err);
  });

  // init map controls
  $('.map-controls .toggle').on('click', function (e) {
    e.preventDefault();
    $('.map-controls').toggleClass('open');
    $('.leaflet-left').toggleClass('open');
  });

  $('.control-active').on('click', '.delete', function (e) {
    e.preventDefault();
    var values = $(e.currentTarget).siblings('span');
    var type = $(values[0]).text();
    var city = $(values[1]).text().toLowerCase();
    switch (type) {
      case 'Marker Layer':
        {
          var filtered = venues.active.filter(function (venue) {
            return venue.city.toLowerCase() !== city;
          });
          venues.active = filtered;
          var markers = filtered.map(function (venue) {
            return L.marker([venue.lat, venue.lon]).bindPopup('<div>' + venue.ds_pdv + '<br>' + (venue.twitter_statuses || 0) + '<br>' + (venue.foursquare_usercount || 0) + '</div>');
          });
          $(e.currentTarget).parent().remove();
          markerLayer.clearLayers();
          markerLayer.addLayers(markers);
          break;
        }
      case 'Heatmap Layer':
        {
          var activeCities = heatmapLayer.map(function (layer) {
            return layer.city;
          });
          var heatmapIndex = activeCities.indexOf(city);
          map.removeLayer(heatmapLayer[heatmapIndex].heatmap);
          heatmapLayer = [].concat(_toConsumableArray(heatmapLayer.slice(0, heatmapIndex)), _toConsumableArray(heatmapLayer.slice(heatmapIndex + 1)));
          $(e.currentTarget).parent().remove();
          break;
        }
      default:
        {
          break;
        }
    }
  });

  $('.control-markers .submit').on('click', function (e) {
    e.preventDefault();
    var savedVenueIds = venues.saved.map(function (v) {
      return v.cd_pdv;
    });
    var activeVenueIds = venues.active.map(function (v) {
      return v.cd_pdv;
    });
    var city = $('.control-markers .city').val().toLowerCase();
    if (!city) return;
    if (queries.cities.indexOf(city) === -1) {
      $('.loading').toggle();
      get.then(function () {
        fetch('./api/v1/venues?city=' + city + '&token=' + token).then(function (response) {
          return response.json();
        }).then(function (data) {
          queries.cities.push(city);
          var markerList = data.filter(function (venue) {
            return savedVenueIds.indexOf(venue.cd_pdv) === -1;
          }).map(function (venue) {
            venues.saved.push(venue);
            return venue;
          }).filter(function (venue) {
            return venue.lat && venue.lon;
          }).filter(function (venue) {
            return activeVenueIds.indexOf(venue.cd_pdv) === -1;
          }).map(function (venue) {
            venues.active.push(venue);
            return L.marker([venue.lat, venue.lon]).bindPopup('<div>' + venue.ds_pdv + '<br>' + (venue.twitter_statuses || 0) + '<br>' + (venue.foursquare_usercount || 0) + '</div>');
          });
          if (markerList.length) {
            markerLayer.addLayers(markerList);
            $('.control-active ul').append('<li><span class="fa fa-times delete"></span> <span class="type">Marker Layer</span> - <span class="city">' + city[0].toUpperCase() + city.slice(1) + '</span></li>');
            $('.control-markers .city').val('');
          }
          $('.loading').toggle();
        }).catch(function (err) {
          $('.loading').toggle();
          console.log(err);
        });
      });
    } else {
      var markerList = venues.saved.filter(function (venue) {
        return venue.city.toLowerCase() === city;
      }).filter(function (venue) {
        return venue.lat && venue.lon;
      }).filter(function (venue) {
        return activeVenueIds.indexOf(venue.cd_pdv) === -1;
      }).map(function (venue) {
        venues.active.push(venue);
        return L.marker([venue.lat, venue.lon]).bindPopup('<div>' + venue.ds_pdv + '<br>' + (venue.twitter_statuses || 0) + '<br>' + (venue.foursquare_usercount || 0) + '</div>');
      });
      if (markerList.length) {
        markerLayer.addLayers(markerList);
        $('.control-active ul').append('<li><span class="fa fa-times delete"></span> <span class="type">Marker Layer</span> - <span class="city">' + city[0].toUpperCase() + city.slice(1) + '</span></li>');
        $('.control-markers .city').val('');
      }
    }
  });

  $('.control-heatmaps .submit').on('click', function (e) {
    e.preventDefault();
    var savedVenueIds = venues.saved.map(function (v) {
      return v.cd_pdv;
    });
    var activeVenueIds = venues.active.map(function (v) {
      return v.cd_pdv;
    });
    var city = $('.control-heatmaps .city').val().toLowerCase();
    var variable = $('.control-heatmaps .variable').val().toLowerCase();
    if (!city || !variable) return;
    if (heatmapLayer.map(function (heatmap) {
      return heatmap.city;
    }).indexOf(city) !== -1) return;
    if (queries.cities.indexOf(city) === -1) {
      $('.loading').toggle();
      get.then(function () {
        fetch('./api/v1/venues?city=' + city + '&token=' + token).then(function (response) {
          return response.json();
        }).then(function (data) {
          queries.cities.push(city);
          var points = data.filter(function (venue) {
            return savedVenueIds.indexOf(venue.cd_pdv) === -1;
          }).map(function (venue) {
            venues.saved.push(venue);
            return venue;
          }).filter(function (venue) {
            return venue.lat && venue.lon && venue[variable];
          }).map(function (venue) {
            return [venue.lat, venue.lon, parseInt(venue[variable], 10)];
          });
          if (points.length) {
            var max = Math.max.apply(Math, _toConsumableArray(points.map(function (point) {
              return point[2];
            }))) / points.length;
            var heatmap = L.heatLayer(points, { radius: 25, max: max });
            heatmap.addTo(map);
            heatmapLayer.push({ city: city, heatmap: heatmap });
            $('.control-active ul').append('<li><span class="fa fa-times delete"></span> <span class="type">Heatmap Layer</span> - <span class="city">' + city[0].toUpperCase() + city.slice(1) + '</span></li>');
            $('.control-heatmaps .city').val('');
            $('.control-heatmaps .variable').val('');
          }
          $('.loading').toggle();
        }).catch(function (err) {
          $('.loading').toggle();
          console.log(err);
        });
      });
    } else {
      var points = venues.saved.filter(function (venue) {
        return venue.city.toLowerCase() === city;
      }).filter(function (venue) {
        return venue.lat && venue.lon && venue[variable];
      }).map(function (venue) {
        return [venue.lat, venue.lon, parseInt(venue[variable], 10)];
      });
      if (points.length) {
        var max = Math.max.apply(Math, _toConsumableArray(points.map(function (point) {
          return point[2];
        }))) / points.length;
        var heatmap = L.heatLayer(points, { radius: 25, max: max });
        heatmap.addTo(map);
        heatmapLayer.push({ city: city, heatmap: heatmap });
        $('.control-active ul').append('<li><span class="fa fa-times delete"></span> <span class="type">Heatmap Layer</span> - <span class="city">' + city[0].toUpperCase() + city.slice(1) + '</span></li>');
        $('.control-heatmaps .city').val('');
        $('.control-heatmaps .variable').val('');
      }
    }
  });
})($, L);