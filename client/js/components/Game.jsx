import React from "react";
import {History} from "react-router";

var Game = React.createClass({
  mixins: [History],

  handleGameIdSubmit: function(e) {
    e.preventDefault();
    var game = this.props.route.game;
    var nextGameId = React.findDOMNode(this.refs.nextGameId).value;
    this.history.pushState(null, `${game.href}/${nextGameId}`);
  },

  render: function () {
    var gameId = this.props.params.gameId;
    var game = this.props.route.game;
    var GameComponent = game.component;

    return (
        <div>
          <div className="row">
            <div className="col-lg-12">
              <h1 className="page-header">{game.name}</h1>
            </div>
          </div>
          <form className="form-inline" onSubmit={this.handleGameIdSubmit}>
            <label>Watch another game:</label>
            <input className="form-control" ref="nextGameId" defaultValue={gameId} />
            <button className="btn btn-default">Go</button>
          </form>
          <GameComponent gameId={gameId} />
        </div>
    );
  }
});

export default Game;
