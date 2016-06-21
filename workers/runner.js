'use strict';

const flatten = require('flat');
const database = require('mssql');

const dbConfig = {
  user: process.env.CSADB_USER,
  password: process.env.CSADB_PASSWORD,
  server: process.env.CSADB_SERVER,
  database: process.env.CSADB_DATABASE,
};
const connection = database.connect(dbConfig);

function prepareTable(name, db, cols) {
  const table = new db.Table(name);
  table.create = true;

  cols.forEach((col) => {
    if (col === 'id') table.columns.add(col, db.NVarChar(250), { nullable: false, primary: true });
    else table.columns.add(col, db.NVarChar(db.MAX), { nullable: true });
  });

  return table;
}

function handleSave(table, data) {
  return connection
    .then(() => {
      data.forEach((row) => {
        const flatRow = flatten(row);
        const values = Object.keys(flatRow).map(key => flatRow[key]);
        table.rows.add(...values);
      });

      return new database.Request().bulk(table);
    })
    .then(() => data.map(row => row.id))
    .catch(error => ({ error, source: 'handleSave' }));
}

function makeGenerator({ config, data, handlers }) {
  const { name, tableName } = config;
  const { input, model, todo, done } = data;
  const { handleGet, handleResponse } = handlers;

  const maxRetries = 3;
  let retries = 0;
  let message = 'Getting';
  let progress = Math.floor(done.length / input.length * 100);

  return function *gen() {
    if (!process.send) process.stdout.write(`Start: ${name}\n`);
    if (!process.send) process.stdout.write(`Remaining: ${todo.length}\n`);

    while (todo.length) {
      const item = todo.shift();

      try {
        if (!process.send) process.stdout.write(`\n${message} ${item.name}`);

        const response = yield handleGet(item);
        if (response.error) throw response.error;

        const results = yield handleResponse(item, response, done);
        if (results.error) throw results.error;

        const table = prepareTable(tableName, database, Object.keys(flatten(model)));
        const inserted = yield handleSave(table, results);
        if (inserted.error) throw inserted.error;

        done.push(...inserted);
        retries = 0;
        message = 'Getting';
        const newProgress = Math.floor(done.length / input.length * 100);

        if (!process.send) process.stdout.write(` -> results: ${results.length} -> OK`);
        if (newProgress > progress) {
          progress = newProgress;
          if (process.send) process.send({ [`${name}_progress`]: progress });
        }
      } catch (e) {
        if (!process.send) process.stdout.write(' -> ERROR\n');
        if (!process.send) console.error(e);
        if (retries < maxRetries) {
          retries += 1;
          message = `Retrying (attempt ${retries})`;
          todo.unshift(item);
        } else {
          if (!process.send) process.stdout.write('Reached maximum number of retry attempts.\n');
          if (process.send) process.send({ [`${name}_error`]: e });
          break;
        }
      }
    }

    if (!process.send) process.stdout.write(`Done: ${name}`);
    if (process.send) process.send(`${name}_stop`);
  };
}

// NOTE:
// use it.throw(reason) to handle error
// however using it.throw(reason) stops the loop
function run({ config, data, handlers }) {
  const gen = makeGenerator({ config, data, handlers });
  const it = gen();

  (function pull(val) {
    const ret = it.next(val);
    if (!ret.done) {
      Promise
      .resolve(ret.value)
      .then(pull)
      .catch(error => pull({ error, source: 'runner' }));
    }
  }());
}

function runner({ config, data, handlers }) {
  const { tableName } = config;
  const { input, model } = data;

  connection

  // create table
  .then(() => {
    const table = prepareTable(tableName, database, Object.keys(flatten(model)));
    return new database.Request().bulk(table);
  })

  // get progress
  .then(() => {
    // FIXME:
    // if centroide has 0 unique values no records will be saved and
    // we won't know that it has already been done
    const pClusters = new database.Request()
      .query(`SELECT distinct cluster FROM ${tableName}`);
    const pIds = new database.Request()
      .query(`SELECT distinct id FROM ${tableName}`);

    return Promise.all([pClusters, pIds]);
  })

  // start runner
  .then((values) => {
    const clustersDone = values[0].map(item => item.cluster);
    const idsDone = values[1].map(venue => venue.id);

    const clustersTodo = input
      .filter(item => clustersDone.indexOf(item.cluster) === -1);

    data.done = idsDone;
    data.todo = clustersTodo;

    run({ config, data, handlers });
  })
  .catch(err => console.error(err));
}

module.exports = runner;
