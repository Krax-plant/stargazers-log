// script.js
// Based on GitHub Docs: https://docs.github.com/get-started/start-your-journey/creating-and-changing-your-code
// Fetch events.json and render a list of starred repositories

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('starredList');
  const statusEl = document.getElementById('status');

  if (!listEl) return;

  statusEl.textContent = 'Loading...';

  fetch('events.json', {cache: "no-store"})
    .then(res => {
      if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        listEl.innerHTML = '<li class="empty">No starred repositories found.</li>';
        statusEl.textContent = '';
        return;
      }

      // Sort by starred_at desc
      data.sort((a,b) => new Date(b.starred_at) - new Date(a.starred_at));

      listEl.innerHTML = data.map(renderRepo).join('');
      statusEl.textContent = `${data.length} repo(s)`;
    })
    .catch(err => {
      console.error(err);
      listEl.innerHTML = `<li class="empty">Unable to load starred repositories. (${escapeHtml(err.message)})</li>`;
      statusEl.textContent = 'Error';
    });
});

function renderRepo(repo){
  const starred = formatLocalDate(repo.starred_at);
  const stars = repo.stargazers_count != null ? repo.stargazers_count : '-';
  const lang = repo.language ? escapeHtml(repo.language) : '—';
  const desc = repo.description ? escapeHtml(repo.description) : '';
  const url = repo.html_url ? repo.html_url : '#';

  return `
    <li class="repo-card">
      <div class="repo-meta">
        <a class="repo-title" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(repo.repo)}
        </a>
        <p class="repo-desc">${desc}</p>
        <div class="repo-stats">
          <span class="badge">★ ${stars}</span>
          <span>Language: ${lang}</span>
          <span>Starred: ${starred}</span>
        </div>
      </div>
    </li>
  `;
}

function formatLocalDate(iso){
  if (!iso) return 'unknown';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString();
}

// Basic escaping to prevent injection if events.json is untrusted
function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str){
  return escapeHtml(str).replace(/"/g, '&quot;');
}