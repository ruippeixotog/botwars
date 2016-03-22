import fs from "fs";
import couchbase from "couchbase";
import Promise from "bluebird";

const config = JSON.parse(fs.readFileSync("config.json"));
let cluster = new couchbase.Cluster(config.couchbase.cluster);
let bucket = cluster.openBucket(config.couchbase.bucket);

let bucketQuery = Promise.promisify(bucket.query, { context: bucket });
let bucketUpsert = Promise.promisify(bucket.upsert, { context: bucket });

let N1qlQuery = require("couchbase").N1qlQuery;

let database = {
  games: {
    save: function (object) {
      object.type = "game";
      return bucketUpsert(object.id, object);
    },
    getAll: function (gameClassName) {
      let query = N1qlQuery.fromString(`
        SELECT default.* FROM default
        where type = "game" and game.gameClass = "${gameClassName}"
      `);
      return bucketQuery(query);
    }
  },
  competitions: {
    save: function (object) {
      object.type = "competition";
      return bucketUpsert(object.id, object);
    },
    getAll: function (gameClassName) {
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
};

export default database;
