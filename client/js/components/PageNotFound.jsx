import React from "react";

let PageNotFound = React.createClass({

  propTypes: {
    location: React.PropTypes.object.isRequired
  },

  render: function () {
    return (
        <div>
          <div className="row">
            <div className="col-lg-12">
              <h1 className="page-header">Page not found</h1>
            </div>
          </div>
          <img src="/img/404.png" width="300" height="300" />
        </div>
    );
  }
});

export default PageNotFound;
