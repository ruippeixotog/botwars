import React from "react";

const DebugComp = ({ info, games }) => (
  <div>
    <pre>{JSON.stringify(info, null, 2)}</pre>
    <pre>{JSON.stringify(games, null, 2)}</pre>
  </div>
);

export default DebugComp;
