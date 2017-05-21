import React from "react";

class DebugComp extends React.Component {
  render() {
    let { info, games } = this.props;
    return (
        <div>
          <pre>{JSON.stringify(info, null, 2)}</pre>
          <pre>{JSON.stringify(games, null, 2)}</pre>
        </div>
    );
  }
}

export default DebugComp;
