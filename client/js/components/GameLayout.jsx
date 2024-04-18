import React from "react";
import { Row, Col, PageHeader } from "react-bootstrap";
import { Outlet } from "react-router-dom";

const GameLayout = ({ game }) => (
  <div className="flex">
    <Row>
      <Col lg={12}>
        <PageHeader>{game.name}</PageHeader>
      </Col>
    </Row>
    <Outlet />
  </div>
);

export default GameLayout;
