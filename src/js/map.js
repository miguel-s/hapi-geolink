(function iife(L, topojson, $, colorbrewer) {
  // INIT FOUNDATION

  $(document).foundation();

  // EXTENDS

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

  // TYPES

  const GranularityEnum = Object.freeze({
    empty: -1,
    ccaa: 1,
    provincias: 2,
    neighbourhoods: 3,
    censussections: 4,
  });
  const VariablesEnum = Object.freeze({
    empty: 'empty',
    population: 'poblacion',
    pmen: 'prop_hombres',
    pforeigners: 'prop_origen_extranjero',
  });

  let map;
  let tileLayer;
  let topojsonLayer;
  let markerLayer;
  let info;
  let legend;

  const mapData = {
    ccaa: {},
    provincias: {},
    neighbourhoods: {},
    censussections: {},
  };

  let currentGrades;
  let currentGranularity;
  let currentVariable;

  const dropdowns = {
    granularity: $('.granularity'),
    variables: $('.variables'),
    types: $('.types'),
    colors: $('.colors'),
    classes: $('.classes'),
  };

  const colorOptions = {
    type: 'sequential',
    color: 'OrRd',
    classes: 8,
  };

  function getGrades(max) {
    const grades = [];
    const step = max / (colorOptions.classes - 1);

    for (let i = 0; i <= colorOptions.classes - 1; i++) {
      grades.push(step * i);
    }

    return grades;
  }

  // TODO:
  // clean up function body
  // add mouseover color palette name
  function getColorPalettes() {
    return Object.keys(colorbrewer)
    .filter((colorName) => {
      if (colorOptions.type === 'sequential') {
        return ['Blues', 'Greens', 'Greys', 'Oranges', 'Purples', 'Reds',
                'BuGn', 'BuPu', 'GnBu', 'OrRd', 'PuBu', 'PuBuGn', 'PuRd',
                'RdPu', 'YlGn', 'YlGn', 'YlGnBu', 'YlOrBr', 'YlOrRd']
                .indexOf(colorName) >= 0;
      } else if (colorOptions.type === 'diverging') {
        return ['BrBG', 'PiYG', 'PRGn', 'PuOr', 'RdBu',
                'RdGy', 'RdYlBu', 'RdYlGn', 'Spectral']
                .indexOf(colorName) >= 0;
      } else if (colorOptions.type === 'qualitative') {
        return ['Accent', 'Dark2', 'Paired', 'Pastel1',
                'Pastel2', 'Set1', 'Set2', 'Set3']
                .indexOf(colorName) >= 0;
      }
      return false;
    })
    .map((colorName, index, array) => {
      const color = colorbrewer[colorName][5];
      let item = '';

      // Create dropdown menu
      if (index === 0) {
        item += '' +
          '<ul class="menu dropdown" data-dropdown-menu>' +
            '<li class="is-dropdown-submenu-parent">' +
              '<a href="#">Colors</a>' +
              '<ul class="menu">';
      }

      if (colorName === 'YlGn') {
        // Create dropdown submenu
        item += '' +
          '<li class="is-dropdown-submenu-parent">' +
          '<a href="#">Multi-hue</a>' +
          '<ul class="menu">';

        // Add first color
        item += `<li><a href="#" class="color-name ${colorName}"><div class="color-container">`;
        item += color.map(c => `<i style="background:${c}" class="color"></i>`).join('');
        item += '</div></a></li>';
      } else if (colorName === 'Purples') {
        // Close previous submenu
        item += '</ul></li>';

        // Create dropdown submenu
        item += '' +
          '<li class="is-dropdown-submenu-parent">' +
          '<a href="#">Single hue</a>' +
          '<ul class="menu">';
        // Add first color
        item += `<li><a href="#" class="color-name ${colorName}"><div class="color-container">`;
        item += color.map(c => `<i style="background:${c}" class="color"></i>`).join('');
        item += '</div></a></li>';
      } else {
        // Add other colors
        item += `<li><a href="#" class="color-name ${colorName}"><div class="color-container">`;
        item += color.map(c => `<i style="background:${c}" class="color"></i>`).join('');
        item += '</div></a></li>';
      }

      if (index === array.length - 1) {
        // Close previous submenu
        item += '</ul></li>';

        // Close dropdown menu
        item += '' +
            '</ul>' +
          '</li>' +
        '</ul>';
      }

      return item;
    })
    .join('');
  }

  function getColor(d) {
    const colors = colorbrewer[colorOptions.color][colorOptions.classes];
    return currentGrades.reduce((prev, curr, index) => d >= curr ? colors[index] : prev, colors[0]);
  }

  function style(feature) {
    return {
      fillColor: getColor(feature.properties.demography[currentVariable]),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  }

  function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
      weight: 2,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7,
    });

    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }

    info.update(layer.feature.properties);
  }

  function resetHighlight(e) {
    topojsonLayer.resetStyle(e.target);
    info.update();
  }

  function changeTopoJsonLayer(options) {
    // FIXME:
    // weird style
    // use es6 default parameters and destructuring
    const granularity = options ? (options.granularity || null) : null;
    const variable = options ? (options.variable || null) : null;

    currentGranularity = granularity;
    currentVariable = variable;

    // TODO:
    // check performance clear layer and add new data vs. remove layer and add differet geojson layer
    topojsonLayer.clearLayers();
    map.removeControl(legend);

    if (granularity !== GranularityEnum.empty) {
      const granularityName = Object.keys(GranularityEnum)[granularity];
      const objectName = Object.keys(mapData[granularityName].objects)[0];

      if (currentVariable === VariablesEnum.pmen || currentVariable === VariablesEnum.pforeigners) {
        currentGrades = getGrades(1);
      } else {
        currentGrades = getGrades(mapData[granularityName].objects[objectName].geometries
          .reduce((prev, curr) => Math.max(curr.properties.demography[variable], prev), 0));
      }

      topojsonLayer.addData(mapData[granularityName]);
    }

    if (granularity !== GranularityEnum.empty && variable !== VariablesEnum.empty) {
      map.addControl(legend);
    }

    // FIXME:
    // don't change the dropdown if the color option didnt change
    // make more efficient
    const maxClasses = Math.max(...Object.keys(colorbrewer[colorOptions.color]));
    const offset = 2;
    dropdowns.classes.find('.color-classes').each((index, element) => {
      const a = $(element).find('a');

      if (index + offset + 1 <= maxClasses) {
        a.removeClass('disabled');
      } else {
        a.addClass('disabled');
      }
    });
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());

    if (currentGranularity < Object.keys(GranularityEnum).length - 1) {
      changeTopoJsonLayer({
        granularity: currentGranularity + 1,
        variable: currentVariable,
      });
    }
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature,
    });
  }

  map = L.map('map').setView([40.417049, -3.703525], 6);

  /*
  tileLayer = L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    subdomains: ['otile1', 'otile2', 'otile3', 'otile4'],
  }).addTo(map);
  */

  tileLayer = L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.light',
      accessToken: 'pk.eyJ1IjoibXluZGZsYW1lIiwiYSI6ImNpbXJ1am85cDAwNGx2OW0xbnU0amdkZHgifQ.56NzZw6OPm41VEqhaqGHAA',
    }
  ).addTo(map);

  topojsonLayer = L.topoJson(null, {
    onEachFeature,
    style,
  }).addTo(map);

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
  info.addTo(map);

  legend = L.control({ position: 'bottomright' });
  legend.onAdd = function onAdd(m) {
    const div = L.DomUtil.create('div', 'info legend');

    for (let i = 0; i < currentGrades.length; i++) {
      const color = getColor(currentGrades[i]);
      let unit;
      let multiplier;

      if (currentVariable === VariablesEnum.population) {
        multiplier = 0.001;
        unit = 'k';
      } else if (currentVariable === VariablesEnum.pmen
        || currentVariable === VariablesEnum.pforeigners) {
        multiplier = 100;
        unit = '%';
      }

      const current = (currentGrades[i] * multiplier);
      const next = ((currentGrades[i + 1]) * multiplier);
      const label = next ? `&ndash;${next.toFixed(0)}${unit}<br>` : '+';
      div.innerHTML += `<i style="background:${color}"></i>${current.toFixed(0)}${unit}${label}`;
    }

    return div;
  };

  // GET DATA

  // TODO:
  // 1. simplify like so
  //
  //  $.getJSON('./api/v1.0/topoccaa')
  //    .done(addTopoData);
  //
  // function addTopoData(topoData) {
  //   topoLayer.addData(topoData);
  //   topoLayer.addTo(map);
  // }

  fetch('./api/v1/token', { credentials: 'same-origin' })
  .then(response => response.text())
  .then((token) => {
    fetch(`./api/v1/ccaa?token=${token}`)
    .then(
      (response) => {
        if (response.status !== 200) return;
        response.json().then((data) => {
          mapData.ccaa = data;
          changeTopoJsonLayer({
            granularity: GranularityEnum.ccaa,
            variable: VariablesEnum.population,
          });

          $.each(dropdowns, (key, value) => {
            value.find('button').removeClass('disabled');
          });

          dropdowns.granularity
            .find('.ca')
            .on('click', (event) => {
              changeTopoJsonLayer({
                granularity: GranularityEnum.ccaa,
                variable: currentVariable,
              });
            }).removeClass('disabled');
        });
      }
    );

    fetch(`./api/v1/provincias?token=${token}`)
    .then(response => response.json())
    .then((data) => {
      mapData.provincias = data;

      dropdowns.granularity
        .find('.pv')
        .on('click', (event) => {
          changeTopoJsonLayer({
            granularity: GranularityEnum.provincias,
            variable: currentVariable,
          });
        }).removeClass('disabled');
    })
    .catch(err => console.log(err));

    fetch(`./api/v1/barrios_madrid?token=${token}`)
    .then(response => response.json())
    .then((data) => {
      mapData.neighbourhoods = data;

      dropdowns.granularity
        .find('.nh')
        .on('click', (event) => {
          changeTopoJsonLayer({
            granularity: GranularityEnum.neighbourhoods,
            variable: currentVariable,
          });
        }).removeClass('disabled');
    })
    .catch(err => console.log(err));

    fetch(`./api/v1/secciones_censales_madrid?token=${token}`)
    .then(response => response.json())
    .then((data) => {
      mapData.censussections = data;

      dropdowns.granularity
        .find('.cs')
        .on('click', (event) => {
          changeTopoJsonLayer({
            granularity: GranularityEnum.censussections,
            variable: currentVariable,
          });
        })
        .removeClass('disabled');
    })
    .catch(err => console.log(err));

    fetch(`./api/v1/horeca?token=${token}`)
    .then(response => response.json())
    .then((data) => {
      markerLayer = L.markerClusterGroup({
        disableClusteringAtZoom: 17,
      });

      data.filter(item => item.lat && item.lon)
          .forEach((item) => {
            L.marker([item.lat, item.lon])
              .addTo(markerLayer)
              .bindPopup(item.ds_pdv);
          });

      map.addLayer(markerLayer);
    })
    .catch(err => console.log(err));
  });

  // UI

  dropdowns.colors.html(getColorPalettes()).foundation();

  // EVENT LISTENERS

  // FIXME:
  // eliminate repetition
  dropdowns.granularity
    .on('click', '.no', (event) => {
      changeTopoJsonLayer({
        granularity: GranularityEnum.empty,
        variable: currentVariable,
      });
    });

  dropdowns.variables
    .on('click', '.no', (event) => {
      changeTopoJsonLayer({
        granularity: currentGranularity,
        variable: VariablesEnum.empty,
      });
    });
  dropdowns.variables
    .on('click', '.po', (event) => {
      changeTopoJsonLayer({
        granularity: currentGranularity,
        variable: VariablesEnum.population,
      });
    });
  dropdowns.variables
    .on('click', '.pm', (event) => {
      changeTopoJsonLayer({
        granularity: currentGranularity,
        variable: VariablesEnum.pmen,
      });
    });
  dropdowns.variables
    .on('click', '.pf', (event) => {
      changeTopoJsonLayer({
        granularity: currentGranularity,
        variable: VariablesEnum.pforeigners,
      });
    });

  dropdowns.types
    .on('click', '.color-type', (event) => {
      // FIXME:
      // escape value for security
      colorOptions.type = event.target.firstChild.nodeValue.toLowerCase();
      dropdowns.colors.html(getColorPalettes()).foundation();
    });

  dropdowns.colors
    .on('click', '.color-name', (event) => {
        // TODO:
        // validate new color
        // FIXME:
        // escape value for security
      const newColor = event.currentTarget.className.replace('color-name ', '');
      const maxClasses = Math.max(...Object.keys(colorbrewer[newColor]));
      colorOptions.color = newColor;
      colorOptions.classes = colorOptions.classes > maxClasses ? maxClasses : colorOptions.classes;

      changeTopoJsonLayer({
          granularity: currentGranularity,
          variable: currentVariable,
        });
    });

  dropdowns.classes
    .on('click', '.color-classes', (event) => {
      // FIXME:
      // escape value for security
      if (!$(event.currentTarget.firstChild).hasClass('disabled')) {
        colorOptions.classes = event.target.firstChild.nodeValue;
        changeTopoJsonLayer({
          granularity: currentGranularity,
          variable: currentVariable,
        });
      }
    });
}(L, topojson, $, colorbrewer));
