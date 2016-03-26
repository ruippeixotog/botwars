import fs from "fs";
import { Cluster, N1qlQuery } from "couchbase"
import Promise from "bluebird";

const dbConfig = JSON.parse(fs.readFileSync("config.json")).couchbase;

function getNoopFunction(value) {
  return () => value;
}

function getNoopDatabase() {
  return {
    games: {
      save: getNoopFunction(),
      getAll: getNoopFunction(Promise.resolve([]))
    },
    competitions: {
      save: getNoopFunction(),
      getAll: getNoopFunction(Promise.resolve([]))
    }
  }
}

function getWorkingDatabase(bucket) {

  let bucketQuery = Promise.promisify(bucket.query, { context: bucket });
  let bucketUpsert = Promise.promisify(bucket.upsert, { context: bucket });

  function saveGame(object) {
    object.type = "game";
    return bucketUpsert(object.id, object);
  }

  function getAllGames(gameClassName) {
    let query = N1qlQuery.fromString(`
      SELECT default.* FROM default
      where type = "game" and game.gameClass = "${gameClassName}"
    `);
    return bucketQuery(query);
  }

  function saveCompetition(object) {
    object.type = "competition";
    return bucketUpsert(object.id, object);
  }

  function getAllCompetitions(gameClassName) {
    let query = N1qlQuery.fromString(`
      select default.*
      from default
      where type = "competition"
      and ANY gameInstance IN OBJECT_VALUES(gameRegistry.instances)
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
  }
}

let databaseInstancePromise = new Promise(function (resolve /*, reject*/) {

  if (!dbConfig.enabled) {
    resolve(getNoopDatabase());
    return;
  }

  let cluster = new Cluster(dbConfig.cluster);

  let bucket = cluster.openBucket(dbConfig.bucket, dbConfig.password, function (error) {

    if (error) {
      console.error(`Please create the bucket in your couchbase server first
        Don't forget to create index as well!
        Cancelling database use for this run.`);
      resolve(getNoopDatabase());
      return;
    }

    resolve(getWorkingDatabase(bucket));
  });
});

let database = {
  games: {
    save: function (object) {
      return databaseInstancePromise.then(dbInstance => dbInstance.games.save(object));
    },
    getAll: function (gameClassName) {
      return databaseInstancePromise.then(dbInstance => dbInstance.games.getAll(gameClassName));
    }
  },
  competitions: {
    save: function (object) {
      return databaseInstancePromise.then(dbInstance => dbInstance.competitions.save(object));
    },
    getAll: function (gameClassName) {
      return databaseInstancePromise
        .then(dbInstance => dbInstance.competitions.getAll(gameClassName));
    }
  }
};

export default database;
