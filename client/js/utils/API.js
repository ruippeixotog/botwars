import request from "superagent";
import _ from "underscore";

// --- Request utils ---

function uri(host, path, protocol = "http") {
  if (!host) {
    if (protocol === "http") return `/${path}`;
    if (protocol === "ws") host = window.location.host;
  }
  return `${protocol}://${host}/${path}`;
}

function exec(method, uri, data, cb) {
  return request(method, uri)
      .send(data)
      .set("Accept", "application/json")
      .end((err, res) => cb(err, res.body));
}

function httpGet(uri, cb) {
  return exec("GET", uri, null, cb);
}

function httpPost(uri, data, cb) {
  return exec("POST", uri, data, cb);
}

// --- Routes ---

function gameIdRoute(host, baseUri, gameId) {
  let path = `${baseUri}/${gameId}`;
  return {
    info: cb => httpGet(uri(host, path), cb),

    register: (payload, cb) => {
      if (_.isFunction(payload)) { cb = payload; payload = {}; }
      return httpPost(uri(host, `${path}/register`), payload, cb);
    },

    stream: (params, cb) => {
      if (_.isFunction(params)) { cb = params; params = {}; }

      let query = "";
      if (params.history) query += "history=true";
      if (params.playerToken) query += `&playerToken=${params.playerToken}`;

      return cb(null, new WebSocket(uri(host, `${path}/stream?${query}`, "ws")));
    }
  }
}

function compIdRoute(host, baseUri, compId) {
  let path = `${baseUri}/${compId}`;
  return {
    info: cb => httpGet(uri(host, path), cb),
    games: cb => httpGet(uri(host, `${path}/games`), cb),

    register: (player, cb) => {
      let payload = {};
      if (_.isFunction(player)) { cb = player; } else { payload.player = player; }
      return httpPost(uri(host, `${path}/register`), payload, cb);
    }
  }
}

function gamesRoute(host, baseUri) {
  let path = `${baseUri}/games`;
  return {
    all: cb => httpGet(uri(host, path), cb),
    gameId: gameId => gameIdRoute(host, path, gameId)
  }
}

function compsRoute(host, baseUri) {
  let path = `${baseUri}/competitions`;
  return {
    all: cb => httpGet(uri(host, path), cb),
    compId: compId => compIdRoute(host, path, compId)
  }
}

function gameHrefRoute(host, baseUri, gameHref) {
  let path = `${baseUri}${gameHref}`;
  return {
    games: () => gamesRoute(host, path),
    competitions: () => compsRoute(host, path)
  };
}

// --- Entrypoint ---

let apiConf = {
  host: null,
  basePath: "api"
};

let API = {
  gameHref: gameHref => gameHrefRoute(apiConf.host, apiConf.basePath, gameHref),
  _config: apiConf
};

export default API;
