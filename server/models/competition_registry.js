import _ from "underscore";
import db from "../models/utils/database"
import CompetitionInstance from "./competition_instance";
import Registry from "./registry";

class CompetitionRegistry extends Registry {
  constructor(gameRegistry, compTypes) {
    super((id, { type, ...params }) => {
      let Competition = compTypes[type];
      return Competition ?
          new CompetitionInstance(id, new Competition(params), gameRegistry) :
          null;
    });
  }

  restoreAllStoredCompetitions(Game, gameRegistry) {
    let compRegistry = this;
    db.competitions.getAll(Game.name)
        .then(competitions =>
            competitions.forEach(competition => {
              competition.gameRegistry = gameRegistry;
              compRegistry.restore(competition);
            })
        );
  }

  getAllCompetitionsInfo() {
    return _(this.instances).map(comp => comp.getInfo());
  }

  static getInstanceClass() {
    return CompetitionInstance;
  }
}

export default CompetitionRegistry;
