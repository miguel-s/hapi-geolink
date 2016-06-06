'use strict';

const fs = require('fs');
const path = require('path');

exports.loadDataSync = function loadDataSync(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/../data/${filePath}`)), 'utf8');
};

exports.addPropsToMap = function addPropsToMap(mapData, demoData, idField) {
  const map = Object.assign({}, mapData);
  const objectName = Object.keys(map.objects)[0];

  map.objects[objectName].geometries.forEach((geometry) => {
    const id = geometry.properties[idField];
    const demography = demoData.find(item => item[idField] === id);
    if (demography) {
      geometry.properties = Object.assign({ demography }, geometry.properties);
    }
  });

  return map;
};
