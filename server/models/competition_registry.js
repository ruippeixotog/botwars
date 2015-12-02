import _ from "underscore";

import CompetitionInstance from "./competition_instance";
import Registry from "./registry";

class CompetitionRegistry extends Registry {
  constructor(compTypes, gameEngine) {
    super((id, { type, ...params }) => {
      let Competition = compTypes[type];
      return Competition ?
          new CompetitionInstance(id, new Competition(params), gameEngine) :
          null;
    });
  }

  getAllCompetitionsInfo() {
    return _(this.instances).map(comp => comp.getInfo());
  }
}

export default CompetitionRegistry;
