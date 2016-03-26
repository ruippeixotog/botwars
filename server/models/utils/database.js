import fs from "fs";
import { Cluster, N1qlQuery } from "couchbase"
import Promise from "bluebird";

const config = JSON.parse(fs.readFileSync("config.json"));

function getNoopFunction(value) {
  return () => value;
}

let database = {
  games: {
    save: getNoopFunction(),
    getAll: getNoopFunction(Promise.resolve([]))
  },
  competitions: {
    save: getNoopFunction(),
    getAll: getNoopFunction(Promise.resolve([]))
  }
};

if (config.couchbase.enabled) {

  let cluster = new Cluster(config.couchbase.cluster);
  let bucket = cluster.openBucket(config.couchbase.bucket);

  let bucketQuery = Promise.promisify(bucket.query, { context: bucket });
  let bucketUpsert = Promise.promisify(bucket.upsert, { context: bucket });

  database.games.save = function (object) {
    object.type = "game";
    return bucketUpsert(object.id, object);
  };

  database.games.getAll =  function (gameClassName) {
    let query = N1qlQuery.fromString(`
        SELECT default.* FROM default
        where type = "game" and game.gameClass = "${gameClassName}"
      `);
    return bucketQuery(query);
  };

  database.competitions.save = function (object) {
    object.type = "competition";
    return bucketUpsert(object.id, object);
  };

  database.competitions.getAll = function (gameClassName) {
    let query = N1qlQuery.fromString(`
        select default.*
        from default
        where type = "competition"
        and ANY gameInstance IN OBJECT_VALUES(gameRegistry.instances)
        SATISFIES gameInstance.game.gameClass = "${gameClassName}" END
      `);
    return bucketQuery(query);
  }
}

export default database;
