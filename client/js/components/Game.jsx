import React from "react";
import {History} from "react-router";

var Game = React.createClass({
  mixins: [History],

  getInitialState: function() {
    return { gameId: this.props.params.gameId };
  },

  onGameIdChange: function(e) {
    this.setState({ gameId: e.target.value });
  },

  goToGame: function(e) {
    var game = this.props.route.game;
    e.preventDefault();
    this.history.pushState(null, `${game.href}/${this.state.gameId}`);
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
          <form className="form-inline" onSubmit={this.goToGame}>
            <label>Watch another game:</label>
            <input className="form-control" onChange={this.onGameIdChange} value={this.state.gameId} />
            <button className="btn btn-default">Go</button>
          </form>
          <GameComponent gameId={gameId} />
        </div>
    );
  }
});

export default Game;
