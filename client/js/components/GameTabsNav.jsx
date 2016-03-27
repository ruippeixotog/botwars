import React from "react";
import { Nav, NavItem } from "react-bootstrap";

const Tabs = [
  { key: "games", path: "games", label: "Games" },
  { key: "competitions", path: "competitions", label: "Competitions" }
];

const GameTabsNav = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  onTabClick: function (tabDef) {
    return e => {
      e.preventDefault();
      if (tabDef.key !== this.props.activeKey)
        this.context.router.push(`${this.props.gameHref}/${tabDef.path}`);
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
