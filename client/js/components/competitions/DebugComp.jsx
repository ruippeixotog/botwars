import React from "react";

let DebugComp = React.createClass({

  render: function () {
    let { info, games } = this.props;
    return (
        <div>
          <pre>{JSON.stringify(info, null, 2)}</pre>
          <pre>{JSON.stringify(games, null, 2)}</pre>
        </div>
    );
  }
});

export default DebugComp;
