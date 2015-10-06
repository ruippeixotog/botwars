import React from "react";
import {Link} from "react-router";

var HeaderNav = React.createClass({

  render: function () {
    return (
        <div>
          <div className="navbar-header">
            <Link to="/" className="navbar-brand">BotWars</Link>
          </div>

          <ul className="nav navbar-top-links navbar-right">
            <li className="dropdown">
              <Link className="dropdown-toggle" data-toggle="dropdown" to="">
                <i className="fa fa-envelope fa-fw" />  <i className="fa fa-caret-down" />
              </Link>
              <ul className="dropdown-menu dropdown-messages">
              </ul>
            </li>

            <li className="dropdown">
              <Link className="dropdown-toggle" data-toggle="dropdown" to="">
                <i className="fa fa-tasks fa-fw" />  <i className="fa fa-caret-down" />
              </Link>
              <ul className="dropdown-menu dropdown-tasks">
              </ul>
            </li>

            <li className="dropdown">
              <Link className="dropdown-toggle" data-toggle="dropdown" to="">
                <i className="fa fa-bell fa-fw" />  <i className="fa fa-caret-down" />
              </Link>
              <ul className="dropdown-menu dropdown-alerts">
              </ul>
            </li>

            <li className="dropdown">
              <Link className="dropdown-toggle" data-toggle="dropdown" to="">
                <i className="fa fa-user fa-fw" />  <i className="fa fa-caret-down" />
              </Link>
              <ul className="dropdown-menu dropdown-user">
              </ul>
            </li>
          </ul>
        </div>
    );
  }
});

export default HeaderNav;
