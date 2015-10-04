import React from "react";

const alertLevelClasses = Object.freeze({
  error: ["alert-error", "fa-times-circle"],
  warn: ["alert-warning", "fa-exclamation-circle"],
  info: ["alert-info", "fa-info-circle"]
});

var Alert = React.createClass({

  propTypes: {
    level: React.PropTypes.string.isRequired
  },

  render: function () {
    var [divClass, iconClass] = alertLevelClasses[this.props.level];
    return (
        <div className={`alert ${divClass}`} role="alert">
          <i className={`fa ${iconClass} fa-fw`} />
          {this.props.children}
        </div>
    );
  }
});

export default Alert;
