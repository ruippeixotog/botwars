import React from "react";
import {History} from "react-router";
import {Row, Col, Input, Button, PageHeader} from "react-bootstrap";

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

  getInitialState: function() {
    return {
      joinMode: JoinModes.WATCH
    };
  },

  handleGameIdSubmit: function(e) {
    e.preventDefault();
    var game = this.props.route.game;
    var nextGameId = this.refs.nextGameId.getValue();

    var playerToken = null, playerNumber = null;
    if(this.state.joinMode == JoinModes.PLAY) {
      playerNumber = this.refs.playerNumber.getValue();
      playerToken = this.refs.playerToken.getValue();
    }

    var query = this.state.joinMode == JoinModes.PLAY ?
        `?playerNumber=${playerNumber}&playerToken=${playerToken}` :
        "";

    this.history.pushState(null, `${game.href}/${nextGameId}${query}`);
  },

  render: function () {
    var game = this.props.route.game;

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
                <Input type="text" label="Game ID" ref="nextGameId" defaultValue="0" />

                <Input label="I want to:">
                  <Input name="action" type="radio" label="watch the game as a spectator"
                         checked={this.state.joinMode == JoinModes.WATCH}
                         onChange={() => this.setState({ joinMode: JoinModes.WATCH })} />

                  <Input name="action" type="radio" label="enter the game as a new player (TODO)"
                         disabled={true}
                         checked={this.state.joinMode == JoinModes.REGISTER_AND_PLAY}
                         onChange={() => this.setState({ joinMode: JoinModes.REGISTER_AND_PLAY })} />

                  <Input>
                    <div className="radio">
                      <label>
                        <input name="action" type="radio" label="play the game as the player with token"
                               checked={this.state.joinMode == JoinModes.PLAY}
                               onChange={() => this.setState({ joinMode: JoinModes.PLAY })} />
                        <span>play the game as player</span>
                        <Input type="text" ref="playerNumber" bsSize="small" groupClassName="player-token-form-group"
                               disabled={this.state.joinMode != JoinModes.PLAY} placeholder="playerNumber" />
                        <span>with token</span>
                        <Input type="text" ref="playerToken" bsSize="small" groupClassName="player-token-form-group"
                               disabled={this.state.joinMode != JoinModes.PLAY} placeholder="playerToken" />
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
