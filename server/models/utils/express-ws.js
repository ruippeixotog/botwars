var http = require('http');
var url = require('url');

var ServerResponse = http.ServerResponse;
var WebSocketServer = require('ws').Server;

var wsHandledPath = function(path) {
  var urlObj = url.parse(path);
  urlObj.pathname += '/__websocket__';
  return url.format(urlObj);
};

var prepareApp = function(app) {
  var server = http.createServer(app);
  app.listen = function() {
    return server.listen.apply(server, arguments);
  };

  app.wsServer = new WebSocketServer({ server: server });

  app.wsServer.on('connection', function(ws) {
    var res = new ServerResponse(ws.upgradeReq);
    res.writeHead = function (statusCode) {
      if (statusCode > 200) ws.close();
    };

    ws.upgradeReq.ws = ws;
    ws.upgradeReq.url = wsHandledPath(ws.upgradeReq.url);

    app.handle(ws.upgradeReq, res, function() {
      if (!ws.upgradeReq.wsHandled) {
        ws.close();
      }
    });
  });
};

module.exports = function (router) {
  if(router.mountpath) { // if(router is the app object)
    prepareApp(router);
  }

  router.ws = function(path, middleware) {
    router.get(wsHandledPath(path), function(req, res, next) {
      if (req.ws) {
        req.wsHandled = true;
        middleware(req.ws, req, next);
      } else {
        next();
      }
    });

    return router;
  };

  return router;
};
