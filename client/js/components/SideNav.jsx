import React from "react";
import { Link } from "react-router";

let SideNav = React.createClass({

  propTypes: {
    games: React.PropTypes.array.isRequired
  },

  render: function () {
    let gameLinks = this.props.games.map(game =>
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
  }
});

export default SideNav;
