import React from "react";
import { History } from "react-router";
import { Nav, NavItem } from "react-bootstrap";

const Tabs = [
  { key: "games", path: "games", label: "Games" },
  { key: "competitions", path: "competitions", label: "Competitions" }
];

const GameTabsNav = React.createClass({
  mixins: [History],

  onTabClick: function (tabDef) {
    return e => {
      e.preventDefault();
      if (tabDef.key !== this.props.activeKey)
        this.history.pushState(null, `${this.props.gameHref}/${tabDef.path}`);
    };
  },

  render: function () {
    let navItems = Tabs.map(tabDef =>
        <NavItem key={tabDef.key} eventKey={tabDef.key} onClick={this.onTabClick(tabDef)}>
          {tabDef.label}
        </NavItem>
    );
    return (
        <Nav bsStyle="tabs" activeKey={this.props.activeKey}>
          {navItems}
        </Nav>
    );
  }
});

export default GameTabsNav;
