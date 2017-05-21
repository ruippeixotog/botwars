import React from "react";
import PropTypes from "prop-types";

class PageNotFound extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired
  };

  render() {
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
}

export default PageNotFound;
