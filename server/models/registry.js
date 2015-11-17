import crypto from "crypto";

class Registry {
  constructor(instanceFactory, idLength = 8) {
    this.instanceFactory = instanceFactory;
    this.idLength = idLength;
    this.instances = {
      "0": instanceFactory("0", {})
    };
  }

  create(params) {
    let id = crypto.randomBytes(this.idLength).toString("hex");
    this.instances[id] = this.instanceFactory(id, params || {});
    return id;
  }

  get(id) {
    return this.instances[id];
  }
}

export default Registry;
