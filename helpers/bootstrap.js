'use strict';

const loadDataSync = require('./funcs.js').loadDataSync;

function bootstrap() {
  const data = {
    map: {
      ccaa: {},
      provincias: {},
      barrios: {
        madrid: {},
      },
      secciones: {
        madrid: {},
      },
    },
    demographic: {
      ccaa: {},
      provincias: {},
      barrios: {
        madrid: {},
      },
      secciones: {
        madrid: {},
      },
    },
  };

  data.map.ccaa = loadDataSync('maps/spain_ccaa.topojson');
  data.map.provincias = loadDataSync('maps/spain_provincias.topojson');
  data.map.barrios.madrid = loadDataSync('maps/spain_barrios_madrid.topojson');
  data.map.secciones.madrid = loadDataSync('maps/spain_secciones_censales_madrid.topojson');

  data.demographic.ccaa = loadDataSync('demographic/spain_ccaa.json');
  data.demographic.provincias = loadDataSync('demographic/spain_provincias.json');
  data.demographic.barrios.madrid = loadDataSync('demographic/spain_barrios_madrid.json');
  data.demographic.secciones.madrid = loadDataSync('demographic/spain_secciones_censales_madrid.json');

  return data;
}

module.exports = bootstrap;
