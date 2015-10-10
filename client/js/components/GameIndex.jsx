import React from "react";
import {History} from "react-router";
import {Row, Col, Input, Button, PageHeader} from "react-bootstrap";

var GameIndex = React.createClass({
  mixins: [History],

  propTypes: {
    children: React.PropTypes.element
  },

  handleGameIdSubmit: function(e) {
    e.preventDefault();
    var game = this.props.route.game;
    var nextGameId = this.refs.nextGameId.getValue();
    this.history.pushState(null, `${game.href}/${nextGameId}`);
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
            <Col lg={12}>
              <form className="form-inline" onSubmit={this.handleGameIdSubmit}>
                <Input type="text" label="Enter the ID of the game to start:" ref="nextGameId" />
                <Button>Go</Button>
              </form>
            </Col>
          </Row>
          {this.props.children}
        </div>
    );
  }
});

export default GameIndex;
