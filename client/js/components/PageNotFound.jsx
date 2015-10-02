import React from "react";

var PageNotFound = React.createClass({

  propTypes: {
    location: React.PropTypes.object.isRequired
  },

  render: function () {
    var path = this.props.location.pathname;
    var message = `The requested game does not exist: ${path}`;
    return (
        <div className="centered-content">
          <div>
            <h3 className="h3">Page Not Found</h3>
            <p className="text-muted">{message}</p>
          </div>
        </div>
    );
  }
});

export default PageNotFound;
