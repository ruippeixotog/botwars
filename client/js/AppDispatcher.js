import { Dispatcher } from "flux";

var dispatcher = new Dispatcher();

dispatcher.dispatchNext = function (obj) {
  setTimeout(() => { dispatcher.dispatch(obj); });
};

export default dispatcher;
