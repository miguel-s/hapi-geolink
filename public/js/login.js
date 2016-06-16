'use strict';

(function iife() {
  var query = decodeURIComponent(window.location.search.substring(1));
  var indexNext = query.indexOf('next');
  var indexAmp = query.indexOf('&', indexNext);
  var next = indexAmp === -1 ? query.slice(indexNext + 5) : query.slice(indexNext + 5, indexAmp);
  document.querySelector('[name="next"]').value = next;
})();