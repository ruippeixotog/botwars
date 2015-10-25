class Timer {

  start(code, delay) {
    if (!delay) return;

    this.timeoutObj = setTimeout(function () {
      this.timeoutObj = null;
      code();
    }, delay);

    this.timeoutObj.startTime = Date.now();
  }

  isRunning() {
    return this.timeoutObj ? true : false;
  }

  stop() {
    if (this.timeoutObj) {
      clearTimeout(this.timeoutObj);
      var t = Date.now() - this.timeoutObj.startTime;
      this.timeoutObj = null;
      return t;
    }
    return null;
  }
}

export default Timer;
