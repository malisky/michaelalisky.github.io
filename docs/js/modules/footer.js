document.addEventListener('DOMContentLoaded', () => {
  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div class="icon-group">
      <a href="https://github.com/malisky" target="_blank" aria-label="GitHub">
        <img src="/images/github-icon.svg" alt="GitHub" />
      </a>
      <a href="https://www.linkedin.com/in/michaelalisky" target="_blank" aria-label="LinkedIn">
        <img src="/images/linkedin-icon.svg" alt="LinkedIn" />
      </a>
      <a href="https://scholar.google.com/citations?user=b4EtdL4AAAAJ&hl=en" target="_blank" aria-label="Google Scholar">
        <img src="/images/scholar-icon.svg" alt="Google Scholar" />
      </a>
    </div>
  `;
  document.body.appendChild(footer);
});
