'use strict';

(function iife($, L) {
  // init variables
  let token = '';
  let venues = {
    saved: [],
    active: [],
  };
  let queries = {
    countries: [],
    regions: [],
    cities: [],
  };

  // init foundation
  $(document).foundation();

  // init leaflet map
  const map = L.map('map').setView([40.417049, -3.703525], 6);

  // add tile layer to leaflet map
  const tileLayer = L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.light',
      accessToken: 'pk.eyJ1IjoibXluZGZsYW1lIiwiYSI6ImNpbXJ1am85cDAwNGx2OW0xbnU0amdkZHgifQ.56NzZw6OPm41VEqhaqGHAA',
    }
  ).addTo(map);

  // add marker layer to leaflet map
  const markerLayer = L.markerClusterGroup({
    disableClusteringAtZoom: 18,
  }).addTo(map);

  // add heatmap layer to leaflet map
  let heatmapLayer = [];

  // fetch api token
  const get = fetch('./api/v1/token', { credentials: 'same-origin' })
    .then(response => response.text())
    .then((t) => {
      token = t;
      setTimeout(() => $('.loading').toggle(), 1000);
    })
    .catch(err => console.log(err));

  // init map controls
  $('.map-controls .toggle').on('click', (e) => {
    e.preventDefault();
    $('.map-controls').toggleClass('open');
    $('.leaflet-left').toggleClass('open');
  });

  $('.control-active').on('click', '.delete', (e) => {
    e.preventDefault();
    const values = $(e.currentTarget).siblings('span');
    const type = $(values[0]).text();
    const city = $(values[1]).text().toLowerCase();
    switch (type) {
      case 'Marker Layer': {
        const filtered = venues.active.filter(venue => venue.city.toLowerCase() !== city);
        venues.active = filtered;
        const markers = filtered.map(venue => L.marker([venue.lat, venue.lon])
          .bindPopup(`<div>${venue.ds_pdv}<br>${venue.twitter_statuses || 0}<br>${venue.foursquare_usercount || 0}</div>`));
        $(e.currentTarget).parent().remove();
        markerLayer.clearLayers();
        markerLayer.addLayers(markers);
        break;
      }
      case 'Heatmap Layer': {
        const activeCities = heatmapLayer.map(layer => layer.city);
        const heatmapIndex = activeCities.indexOf(city);
        map.removeLayer(heatmapLayer[heatmapIndex].heatmap);
        heatmapLayer = [...heatmapLayer.slice(0, heatmapIndex),
                        ...heatmapLayer.slice(heatmapIndex + 1)];
        $(e.currentTarget).parent().remove();
        break;
      }
      default: {
        break;
      }
    }
  });

  $('.control-markers .submit').on('click', (e) => {
    e.preventDefault();
    const savedVenueIds = venues.saved.map(v => v.cd_pdv);
    const activeVenueIds = venues.active.map(v => v.cd_pdv);
    const city = $('.control-markers .city').val().toLowerCase();
    if (!city) return;
    if (queries.cities.indexOf(city) === -1) {
      $('.loading').toggle();
      get.then(() => {
        fetch(`./api/v1/venues?city=${city}&token=${token}`)
          .then(response => response.json())
          .then((data) => {
            queries.cities.push(city);
            const markerList = data
              .filter(venue => savedVenueIds.indexOf(venue.cd_pdv) === -1)
              .map((venue) => {
                venues.saved.push(venue);
                return venue;
              })
              .filter(venue => venue.lat && venue.lon)
              .filter(venue => activeVenueIds.indexOf(venue.cd_pdv) === -1)
              .map((venue) => {
                venues.active.push(venue);
                return L.marker([venue.lat, venue.lon])
                  .bindPopup(`<div>${venue.ds_pdv}<br>${venue.twitter_statuses || 0}<br>${venue.foursquare_usercount || 0}</div>`);
              });
            if (markerList.length) {
              markerLayer.addLayers(markerList);
              $('.control-active ul').append(`<li><span class="fa fa-times delete"></span> <span class="type">Marker Layer</span> - <span class="city">${city[0].toUpperCase()}${city.slice(1)}</span></li>`);
              $('.control-markers .city').val('');
            }
            $('.loading').toggle();
          })
          .catch((err) => {
            $('.loading').toggle();
            console.log(err);
          });
      });
    } else {
      const markerList = venues.saved
        .filter(venue => venue.city.toLowerCase() === city)
        .filter(venue => venue.lat && venue.lon)
        .filter(venue => activeVenueIds.indexOf(venue.cd_pdv) === -1)
        .map((venue) => {
          venues.active.push(venue);
          return L.marker([venue.lat, venue.lon])
            .bindPopup(`<div>${venue.ds_pdv}<br>${venue.twitter_statuses || 0}<br>${venue.foursquare_usercount || 0}</div>`);
        });
      if (markerList.length) {
        markerLayer.addLayers(markerList);
        $('.control-active ul').append(`<li><span class="fa fa-times delete"></span> <span class="type">Marker Layer</span> - <span class="city">${city[0].toUpperCase()}${city.slice(1)}</span></li>`);
        $('.control-markers .city').val('');
      }
    }
  });

  $('.control-heatmaps .submit').on('click', (e) => {
    e.preventDefault();
    const savedVenueIds = venues.saved.map(v => v.cd_pdv);
    const activeVenueIds = venues.active.map(v => v.cd_pdv);
    const city = $('.control-heatmaps .city').val().toLowerCase();
    const variable = $('.control-heatmaps .variable').val().toLowerCase();
    if (!city || !variable) return;
    if (heatmapLayer.map(heatmap => heatmap.city).indexOf(city) !== -1) return;
    if (queries.cities.indexOf(city) === -1) {
      $('.loading').toggle();
      get.then(() => {
        fetch(`./api/v1/venues?city=${city}&token=${token}`)
          .then(response => response.json())
          .then((data) => {
            queries.cities.push(city);
            const points = data
              .filter(venue => savedVenueIds.indexOf(venue.cd_pdv) === -1)
              .map((venue) => {
                venues.saved.push(venue);
                return venue;
              })
              .filter(venue => venue.lat && venue.lon && venue[variable])
              .map(venue => [venue.lat, venue.lon, parseInt(venue[variable], 10)]);
            if (points.length) {
              const max = Math.max(...points.map(point => point[2])) / points.length;
              const heatmap = L.heatLayer(
                points,
                { radius: 25, max }
              );
              heatmap.addTo(map);
              heatmapLayer.push({ city, heatmap });
              $('.control-active ul').append(`<li><span class="fa fa-times delete"></span> <span class="type">Heatmap Layer</span> - <span class="city">${city[0].toUpperCase()}${city.slice(1)}</span></li>`);
              $('.control-heatmaps .city').val('');
              $('.control-heatmaps .variable').val('');
            }
            $('.loading').toggle();
          })
          .catch((err) => {
            $('.loading').toggle();
            console.log(err);
          });
      });
    } else {
      const points = venues.saved
        .filter(venue => venue.city.toLowerCase() === city)
        .filter(venue => venue.lat && venue.lon && venue[variable])
        .map(venue => [venue.lat, venue.lon, parseInt(venue[variable], 10)]);
      if (points.length) {
        const max = Math.max(...points.map(point => point[2])) / points.length;
        const heatmap = L.heatLayer(
          points,
          { radius: 25, max }
        );
        heatmap.addTo(map);
        heatmapLayer.push({ city, heatmap });
        $('.control-active ul').append(`<li><span class="fa fa-times delete"></span> <span class="type">Heatmap Layer</span> - <span class="city">${city[0].toUpperCase()}${city.slice(1)}</span></li>`);
        $('.control-heatmaps .city').val('');
        $('.control-heatmaps .variable').val('');
      }
    }
  });
}($, L));
