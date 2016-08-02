'use strict';

import $ from 'jquery';

import { getToken, getVenues, getMap } from './utils/api.js';
import { capitalize } from './utils/utils.js';
import map from './components/map.js';

// init
$(document).foundation();
map.init('map');
const api = getToken();
const venues = [];
const queries = [];
const geometries = [];

// helpers
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
    case 'markers': {
      $(e.currentTarget).parent().remove();

      const activeItems = $('.controls .layers').find('li').toArray()
        .map(a => ({ type: $(a).data('type'), area: $(a).data('area'), name: $(a).data('name') }))
        .filter(a => a.type === type);

      const activeMarkers = venues
        .filter((v) => {
          for (const a of activeItems) {
            if (v[a.area].toLowerCase() === a.name) return true;
          }
          return false;
        })
        .filter(v => v.lat && v.lon);

      map.clearMarkers().addMarkers(activeMarkers);
      break;
    }
    case 'heatmaps': {
      map.clearHeatmap(area, name);
      $(e.currentTarget).parent().remove();
      break;
    }
    case 'geometry': {
      map.clearGeometry(area, name);
      $(e.currentTarget).parent().remove();
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
  const type = 'markers';
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
    : api
      .then(token => getVenues({ token, area, name }))
      .then((data) => {
        const savedVenueIds = venues.map(venue => venue.cd_pdv);
        const newVenues = data.filter(venue => savedVenueIds.indexOf(venue.cd_pdv) === -1);
        venues.push(...newVenues);
        queries.push({ area, name });
      });

  p.then(() => {
    activeItems.push({ type, area, name });

    const activeMarkers = venues
      .filter((v) => {
        for (const a of activeItems) {
          if (v[a.area].toLowerCase() === a.name) return true;
        }
        return false;
      })
      .filter(v => v.lat && v.lon);

    map.clearMarkers().addMarkers(activeMarkers).fitBoundsMarkers();

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

  const type = 'heatmaps';
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
    : api
      .then(token => getVenues({ token, area, name }))
      .then((data) => {
        const savedVenueIds = venues.map(venue => venue.cd_pdv);
        const newVenues = data.filter(venue => savedVenueIds.indexOf(venue.cd_pdv) === -1);
        venues.push(...newVenues);
        queries.push({ area, name });
      });

  p.then(() => {
    const activePoints = venues
      .filter(v => v.lat && v.lon && v[vbl])
      .filter(v => v[area].toLowerCase() === name);

    map.addHeatmap(activePoints, area, name, vbl);

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

  const type = 'geometry';
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
  const p = (geometries.filter(a => a.area === area).map(a => a.name).indexOf(name) === -1)
    ? api
      .then(token => getMap(token, area, name, gran))
      .then(shapes => geometries.push({ area, name, gran, shapes }))
    : Promise.resolve();

  p.then(() => {
    const shapes = geometries
      .find(m => m.area === area && m.name === name && m.gran === gran).shapes;
    map.addGeometry(shapes, area, name, vbl);
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
