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

  get(id) {
    return this.instances[id];
  }
}

export default Registry;
