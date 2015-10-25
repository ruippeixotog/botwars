var deepcopy = function (obj) {
  if (obj == null || typeof obj != "object") return obj;
  var copy;

  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  if (obj instanceof Array) {
    copy = [];
    for (var i = 0; i < obj.length; i++) {
      copy[i] = deepcopy(obj[i]);
    }
    return copy;
  }

  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = deepcopy(obj[attr]);
      }
    }
    return copy;
  }

  throw new Error("Unable to copy object! Its type isn't supported.");
};

module.exports = deepcopy;
