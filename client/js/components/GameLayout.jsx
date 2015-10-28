import React from "react";
import { Row, Col, PageHeader } from "react-bootstrap";

const GameLayout = ({ route, children }) => (
  <div className="flex">
    <Row>
      <Col lg={12}>
        <PageHeader>{route.game.name}</PageHeader>
      </Col>
    </Row>
    {children}
  </div>
);

export default GameLayout;
