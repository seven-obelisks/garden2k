(function () {
  const form = document.getElementById('site-search-form');
  const input = document.getElementById('site-search-input');
  const results = document.getElementById('site-search-results');
  if (!form || !input || !results) return;

  let pages = [];

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlight(text, query) {
    const escaped = escapeHtml(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(' + escapedQuery + ')', 'ig');
    return escaped.replace(re, '<mark>$1</mark>');
  }

  function buildSnippet(content, query) {
    const lowerContent = content.toLowerCase();
    const index = lowerContent.indexOf(query.toLowerCase());

    if (index === -1) {
      return escapeHtml(content.slice(0, 160)) + (content.length > 160 ? '…' : '');
    }

    const radius = 80;
    const start = Math.max(0, index - radius);
    const end = Math.min(content.length, index + query.length + radius);

    let snippet = content.slice(start, end);
    if (start > 0) snippet = '…' + snippet;
    if (end < content.length) snippet = snippet + '…';

    return highlight(snippet, query);
  }

  function runSearch(query) {
    results.innerHTML = '';

    if (!query) {
      results.classList.remove('is-open');
      return;
    }

    const lowerQuery = query.toLowerCase();

    const matches = pages.filter((page) =>
      page.title.toLowerCase().includes(lowerQuery) ||
      page.content.toLowerCase().includes(lowerQuery)
    );

    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'home-search__empty';
      empty.textContent = 'No results found for "' + query + '".';
      results.appendChild(empty);
      results.classList.add('is-open');
      return;
    }

    matches.forEach((page) => {
      const item = document.createElement('article');
      item.className = 'home-search__result';

      const titleLink = document.createElement('a');
      titleLink.className = 'home-search__result-title';
      titleLink.href = page.url;
      titleLink.innerHTML = highlight(page.title, query);

      const snippetEl = document.createElement('p');
      snippetEl.className = 'home-search__result-snippet';
      snippetEl.innerHTML = buildSnippet(page.content, query);

      item.appendChild(titleLink);
      item.appendChild(snippetEl);
      results.appendChild(item);
    });

    results.classList.add('is-open');
  }

  fetch('/index.json')
    .then((res) => res.json())
    .then((data) => {
      pages = data;

      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get('q');

      if (initialQuery) {
        input.value = initialQuery;
        runSearch(initialQuery.trim());
      }
    })
    .catch(() => {});

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = input.value.trim();

    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url);

    runSearch(query);
  });
})();