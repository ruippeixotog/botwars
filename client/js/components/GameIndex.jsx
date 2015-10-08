import React from "react";
import {History} from "react-router";

var GameIndex = React.createClass({
  mixins: [History],

  propTypes: {
    children: React.PropTypes.element
  },

  handleGameIdSubmit: function(e) {
    e.preventDefault();
    var game = this.props.route.game;
    var nextGameId = this.refs.nextGameId.value;
    this.history.pushState(null, `${game.href}/${nextGameId}`);
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
          <form className="form-inline" onSubmit={this.handleGameIdSubmit}>
            <label>Enter the ID of the game to start:</label>
            <input className="form-control" ref="nextGameId" />
            <button className="btn btn-default">Go</button>
          </form>
          {this.props.children}
        </div>
    );
  }
});

export default GameIndex;
