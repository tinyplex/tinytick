(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.TinyTickReact = {})));
})(this, function (exports) {
  'use strict';

  const useTask = () => 0;

  exports.useTask = useTask;
});
