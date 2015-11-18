import _ from "underscore";

import CompetitionInstance from "./competition_instance";
import Registry from "./registry";

class CompetitionRegistry extends Registry {
  constructor(Competition, gameEngine) {
    super((id, params) => new CompetitionInstance(id, new Competition(params), gameEngine));
  }

  getAllCompetitionsInfo() {
    return _(this.instances).map(comp => comp.getInfo());
  }
}

export default CompetitionRegistry;
