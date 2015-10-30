import { Dispatcher } from "flux";

let dispatcher = new Dispatcher();

dispatcher.dispatchNext = function (obj) {
  setTimeout(() => { dispatcher.dispatch(obj); });
};

export default dispatcher;
