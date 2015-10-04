import React from "react";
import {History} from "react-router";

var GameIndex = React.createClass({
  mixins: [History],

  propTypes: {
    children: React.PropTypes.element
  },

  getInitialState: function() {
    return { gameId: "" };
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
    var game = this.props.route.game;

    return (
        <div>
          <div className="row">
            <div className="col-lg-12">
              <h1 className="page-header">{game.name}</h1>
            </div>
          </div>
          <form className="form-inline" onSubmit={this.goToGame}>
            <label>Enter the ID of the game to start:</label>
            <input className="form-control" onChange={this.onGameIdChange} value={this.state.gameId} />
            <button className="btn btn-default">Go</button>
          </form>
          {this.props.children}
        </div>
    );
  }
});

export default GameIndex;
