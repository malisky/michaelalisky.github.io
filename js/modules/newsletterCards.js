function initNewsletterCards() {
  const container = document.getElementById("newsletter-list");
  if (!container) return;

  fetch("/newsletter/newsletters.json")
    .then(res => res.json())
    .then(entries => {
      entries.forEach(item => {
        const card = document.createElement("a");
        card.className = "card";
        card.href = item.link;

        card.innerHTML = `
          <img src="${item.image}" alt="${item.title}" />
          <div class="card-text">
            <h3>${item.title}</h3>
            <p>${new Date(item.date).toDateString()}</p>
            <p>${item.location_name}</p>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch(err => console.error("Failed to load newsletter cards:", err));
}
