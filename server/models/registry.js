import crypto from "crypto";

class Registry {
  constructor(instanceFactory, idLength = 8) {
    this.instanceFactory = instanceFactory;
    this.idLength = idLength;
    this.instances = {};
  }

  create(params, id) {
    id = id || crypto.randomBytes(this.idLength).toString("hex");
    this.instances[id] = this.instanceFactory(id, params || {});
    return this.instances[id] ? id : null;
  }
  
  restore(storedObject) {
    let id = storedObject.id;
    this.instances[id] = this.constructor.getInstanceClass().restore(storedObject);
    return this.instances[id] ? id : null;
  }

  get(id) {
    return this.instances[id];
  }

  static getInstanceClass() {
    throw new Error(this.constructor.name + ".getInstanceClass not implemented");
  }
}

export default Registry;
