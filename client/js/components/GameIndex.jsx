import React from "react";
import { History } from "react-router";
import { Row, Col, Input, Button, PageHeader } from "react-bootstrap";

import GamesActions from "../actions/GamesActions";
import GamesStore from "../stores/GamesStore";
import GamesEvents from "../events/GamesEvents";

const JoinModes = Object.freeze({
  WATCH: "WATCH",
  REGISTER_AND_PLAY: "REGISTER_AND_PLAY",
  PLAY: "PLAY"
});

var GameIndex = React.createClass({
  mixins: [History],

  propTypes: {
    children: React.PropTypes.element
  },

  getInitialState: function () {
    return {
      joinMode: JoinModes.WATCH,
      registering: false
    };
  },

  componentWillUnmount: function () {
    this.removeRegisterListeners();
  },

  onRegisterSuccess: function (gameHref, gameId, playerToken) {
    var game = this.props.route.game;
    var pageGameId = this.refs.gameId.getValue();

    if (gameHref === game.href && gameId === pageGameId) {
      let queryStr = `playerToken=${playerToken}`;
      this.history.pushState(null, `${gameHref}/${gameId}?${queryStr}`);
    }
  },

  onRegisterError: function (gameHref, gameId) {
    var game = this.props.route.game;
    var pageGameId = this.refs.gameId.getValue();

    if (gameHref === game.href && gameId === pageGameId) {
      this.setState({ registering: false });
      this.removeRegisterListeners();
    }
  },

  removeRegisterListeners: function () {
    GamesStore.removeListener(GamesEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
    GamesStore.removeListener(GamesEvents.REGISTER_ERROR, this.onRegisterError);
  },

  handleGameIdSubmit: function (e) {
    e.preventDefault();
    var game = this.props.route.game;
    var gameId = this.refs.gameId.getValue();

    switch (this.state.joinMode) {
      case JoinModes.WATCH:
        this.history.pushState(null, `${game.href}/${gameId}`);
        break;

      case JoinModes.REGISTER_AND_PLAY:
        GamesActions.register(game.href, gameId);
        GamesStore.on(GamesEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
        GamesStore.on(GamesEvents.REGISTER_ERROR, this.onRegisterError);
        this.setState({ registering: true });
        break;

      case JoinModes.PLAY:
        let queryStr = `playerToken=${this.refs.playerToken.getValue()}`;
        this.history.pushState(null, `${game.href}/${gameId}?${queryStr}`);
        break;
    }
  },

  render: function () {
    var game = this.props.route.game;
    var { joinMode, registering } = this.state;

    var setJoinMode = joinMode => () => { this.setState({ joinMode }); };

    return (
        <div>
          <Row>
            <Col lg={12}>
              <PageHeader>{game.name}</PageHeader>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <h4>Watch or play a game!</h4>
              <form onSubmit={this.handleGameIdSubmit}>
                <Input type="text" label="Game ID" ref="gameId" defaultValue="0" />

                <Input label="I want to:">
                  <Input name="action" type="radio" label="watch the game as a spectator"
                         disabled={registering}
                         checked={joinMode === JoinModes.WATCH}
                         onChange={setJoinMode(JoinModes.WATCH)} />

                  <Input name="action" type="radio" label="enter the game as a new player"
                         disabled={registering}
                         checked={joinMode === JoinModes.REGISTER_AND_PLAY}
                         onChange={setJoinMode(JoinModes.REGISTER_AND_PLAY)} />

                  <Input>
                    <div className="radio">
                      <label>
                        <input name="action" type="radio"
                               label="play the game as the player with token"
                               disabled={registering}
                               checked={joinMode === JoinModes.PLAY}
                               onChange={setJoinMode(JoinModes.PLAY)} />
                        <span>play the game as the player with token</span>
                        <Input type="text" ref="playerToken" bsSize="small"
                               groupClassName="player-token-form-group"
                               disabled={registering || joinMode !== JoinModes.PLAY}
                               placeholder="playerToken" />
                      </label>
                    </div>
                  </Input>
                </Input>

                <Button type="submit">Start!</Button>
              </form>
            </Col>
          </Row>
          {this.props.children}
        </div>
    );
  }
});

export default GameIndex;
