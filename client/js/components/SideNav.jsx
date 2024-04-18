import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const SideNav = ({ games }) => {
  let gameLinks = games.map(game =>
    <li key={game.href}>
      <Link to={game.href}><i className="fa fa-gamepad fa-fw" /> {game.name}</Link>
    </li>
  );

  return (
    <div className="navbar-default sidebar" role="navigation">
      <div className="sidebar-nav navbar-collapse">
        <ul className="nav" id="side-menu">
          <li className="sidebar-search">
            <div className="input-group custom-search-form">
              <input type="text" className="form-control" placeholder="Search..." />
              <span className="input-group-btn">
                <button className="btn btn-default" type="button">
                  <i className="fa fa-search" />
                </button>
              </span>
            </div>
          </li>
          {gameLinks}
        </ul>
      </div>
    </div>
  );
};

SideNav.propTypes = {
  games: PropTypes.array.isRequired
};

export default SideNav;
