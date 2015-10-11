import http from "http";

import {Server as WebSocketServer} from "ws";
import {EventEmitter} from "events";

function prepareApp(app) {
  var oldListen = app.listen.bind(app);

  app.listen = function(...args) {
    var server = oldListen(...args);

    var proxyServer = new EventEmitter();
    app.wsServer = new WebSocketServer({ server: proxyServer });

    server.on('upgrade', function(req, socket, head) {
      var res = new http.ServerResponse(req);
      res.assignSocket(socket);

      res.upgradeWs = function(handler) {
        req._wsHandler = handler;
        proxyServer.emit('upgrade', req, socket, head);
      };

      app.handle(req, res);
    });

    app.wsServer.on('connection', function(ws) {
      ws.upgradeReq._wsHandler(ws);
    });

    return server;
  };
}

export default function (router) {
  if(router.mountpath) { // if(router is the app object)
    prepareApp(router);
  }

  router.ws = function(path, middleware) {
    return router.get(path, function(req, res, next) {
      res.upgradeWs(function(ws) {
        middleware(ws, req, next);
      });
    });
  };

  return router;
}
