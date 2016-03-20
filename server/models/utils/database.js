import fs from "fs";
import couchbase from "couchbase";

const config = JSON.parse(fs.readFileSync("config.json"));
let cluster = new couchbase.Cluster(config.couchbase.cluster);
let bucket = cluster.openBucket(config.couchbase.bucket);

var N1qlQuery = require('couchbase').N1qlQuery;

let database = {
    games: {
        save: function(object, callback) {
            object.type = 'game';
            bucket.upsert(object.id, object, callback);
        },
        getAll: function(gameClassName, callback) {
            var query = N1qlQuery.fromString(`
                SELECT default.* FROM default 
                where type = 'game' and game.gameClass = '${gameClassName}'
            `);
            bucket.query(query, callback);
        }
    },
    competitions: {
        save: function(object, callback) {
            object.type = 'competition';
            bucket.upsert(object.id, object, callback);
        },
        getAll: function(gameClassName, callback) {
            var query = N1qlQuery.fromString(`
                SELECT default.* FROM default 
                where type = 'competition' and gameClass = '${gameClassName}'
            `);
            bucket.query(query, callback);
        }
    }
};

export default database;
