import React from "react";
import { Nav, NavItem } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Tabs = [
  { key: "games", path: "games", label: "Games" },
  { key: "competitions", path: "competitions", label: "Competitions" }
];

const GameTabsNav = props => {
  const navigate = useNavigate();
  return <GameTabsNavLegacy navigate={navigate} {...props} />;
};

class GameTabsNavLegacy extends React.Component {

  onTabClick = (tabDef) => {
    return e => {
      e.preventDefault();
      if (tabDef.key !== this.props.activeKey)
        this.props.navigate(`${this.props.gameHref}/${tabDef.path}`);
    };
  };

  render() {
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
}

export default GameTabsNav;
