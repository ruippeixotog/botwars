import fs from "fs";
import { Cluster, N1qlQuery } from "couchbase";
import Promise from "bluebird";
import _ from "lodash";

const dbConfig = JSON.parse(fs.readFileSync("config.json")).couchbase;

function getNoopDatabase() {
  return {
    games: {
      save: _.constant(),
      getAll: _.constant(Promise.resolve([]))
    },
    competitions: {
      save: _.constant(),
      getAll: _.constant(Promise.resolve([]))
    }
  };
}

function getCouchbaseDatabase(bucket) {
  let bucketQueryDirect = Promise.promisify(bucket.query, { context: bucket });
  let bucketUpsertDirect = Promise.promisify(bucket.upsert, { context: bucket });

  let createIndexQuery = N1qlQuery.fromString(`CREATE PRIMARY INDEX ON \`${dbConfig.bucket}\``);
  let createIndexPromise = bucketQueryDirect(createIndexQuery);

  let bucketQuery = query => createIndexPromise.then(() => bucketQueryDirect(query));
  let bucketUpsert = (id, obj) => createIndexPromise.then(() => bucketUpsertDirect(id, obj));

  function saveGame(object) {
    object.type = "game";
    return bucketUpsert(object.id, object);
  }

  function getAllGames(gameClassName) {
    let query = N1qlQuery.fromString(`
      SELECT default.* FROM default
      WHERE type = "game" AND game.gameClass = "${gameClassName}"
    `);
    return bucketQuery(query);
  }

  function saveCompetition(object) {
    object.type = "competition";
    return bucketUpsert(object.id, object);
  }

  function getAllCompetitions(gameClassName) {
    let query = N1qlQuery.fromString(`
      SELECT default.*
      FROM default
      WHERE type = "competition"
      AND ANY gameInstance IN OBJECT_VALUES(gameRegistry.instances)
      SATISFIES gameInstance.game.gameClass = "${gameClassName}" END
    `);
    return bucketQuery(query);
  }

  return {
    games: {
      save: saveGame,
      getAll: getAllGames
    },
    competitions: {
      save: saveCompetition,
      getAll: getAllCompetitions
    }
  };
}

let dbPromise = new Promise(function (resolve /*, reject*/) {
  if (!dbConfig.enabled) {
    resolve(getNoopDatabase());
    return;
  }

  function printDbError(error) {
    console.error(`Error setting up the database: ${error.message}`);
    console.error("Data will not be persisted on shutdown.");
  }

  let cluster = new Cluster(`${dbConfig.cluster}?detailed_errcodes=1`);
  
  let bucket = cluster.openBucket(dbConfig.bucket, dbConfig.password, function (error) {
    if (error) {
      printDbError(error);
      resolve(getNoopDatabase());
      return;
    }

    resolve(getCouchbaseDatabase(bucket));
  });
});

let database = {
  games: {
    save: obj => dbPromise.then(db => db.games.save(obj)),
    getAll: gameClassName => dbPromise.then(db => db.games.getAll(gameClassName))
  },
  competitions: {
    save: obj => dbPromise.then(db => db.competitions.save(obj)),
    getAll: gameClassName => dbPromise.then(db => db.competitions.getAll(gameClassName))
  }
};

export default database;
