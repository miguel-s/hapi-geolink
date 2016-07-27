'use strict';

module.exports = function pagination(length, index) {
  const num = Math.ceil(length / 99);

  const previous = `
    <li class="pagination-previous ${index === 1 ? 'disabled' : ''}">
      ${index === 1
        ? 'Previous <span class="show-for-sr">page</span>'
        : '<a href="#" aria-label="Previous page">Previous <span class="show-for-sr">page</span></a>'}
    </li>`;
  const next = `
    <li class="pagination-next ${index === num ? 'disabled' : ''}">
      ${index === num
        ? 'Next <span class="show-for-sr">page</span>'
        : '<a href="#" aria-label="Next page">Next <span class="show-for-sr">page</span></a>'}
    </li>`;
  let pages = '';
  if (num <= 8) {
    for (let i = 1; i <= num; i++) {
      if (i === index) pages += `<li class="current"><span class="show-for-sr">You're on page</span> ${i}</li>`;
      else pages += `<li><a href="#" aria-label="Page ${i}">${i}</a></li>`;
    }
  } else {
    if (index < 4) {
      for (let i = 1; i < 4; i++) {
        if (i === index) pages += `<li class="current"><span class="show-for-sr">You're on page</span> ${i}</li>`;
        else pages += `<li><a href="#" aria-label="Page ${i}">${i}</a></li>`;
      }
      if (index === 3) pages += '<li><a href="#" aria-label="Page 4">4</a></li>';
      pages += '<li class="ellipsis" aria-hidden="true"></li>';
      pages += `<li><a href="#" aria-label="Page ${num}">${num}</a></li>`;
    } else if (index > num - 3) {
      pages += '<li><a href="#" aria-label="Page 1">1</a></li>';
      pages += '<li class="ellipsis" aria-hidden="true"></li>';
      if (index === num - 2) pages += `<li><a href="#" aria-label="Page ${num - 3}">${num - 3}</a></li>`;
      for (let i = num - 2; i <= num; i++) {
        if (i === index) pages += `<li class="current"><span class="show-for-sr">You're on page</span> ${i}</li>`;
        else pages += `<li><a href="#" aria-label="Page ${i}">${i}</a></li>`;
      }
    } else {
      pages += '<li><a href="#" aria-label="Page 1">1</a></li>';
      pages += '<li class="ellipsis" aria-hidden="true"></li>';
      for (let i = index - 1; i <= index + 1; i++) {
        if (i === index) pages += `<li class="current"><span class="show-for-sr">You're on page</span> ${i}</li>`;
        else pages += `<li><a href="#" aria-label="Page ${i}">${i}</a></li>`;
      }
      pages += '<li class="ellipsis" aria-hidden="true"></li>';
      pages += `<li><a href="#" aria-label="Page ${num}">${num}</a></li>`;
    }
  }

  return `
    <ul class="pagination text-center" role="navigation" aria-label="Pagination">
      ${previous}
      ${pages}
      ${next}
    </ul>`;
};
