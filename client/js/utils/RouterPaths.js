import _ from "lodash";

function games(gameHref) {
  return `${gameHref}/games`;
}

function gameInfo(gameHref, gameId) {
  return `${gameHref}/games/${gameId}`;
}

function gameStream(gameHref, gameId, opts = {}) {
  let q = _.map(opts, (v, k) => v == null ? "" : `${k}=${v}`).join("&");
  if (q.length > 0) q = "?" + q;

  return `${gameHref}/games/${gameId}/stream${q}`;
}

function comps(gameHref) {
  return `${gameHref}/competitions`;
}

function compInfo(gameHref, compId) {
  return `${gameHref}/competitions/${compId}`;
}

let routerPaths = { games, gameInfo, gameStream, comps, compInfo };

export default routerPaths;
