const COVER_URL = "https://cdn.jsdelivr.net/gh/freebuisness/covers@main";
const HTML_URL = "https://cdn.jsdelivr.net/gh/freebuisness/html@main";
const ZONES_URLS = [
"https://cdn.jsdelivr.net/gh/freebuisness/assets@main/zones.json",
"https://cdn.jsdelivr.net/gh/freebuisness/assets@latest/zones.json",
"https://cdn.jsdelivr.net/gh/freebuisness/assets@master/zones.json",
"https://cdn.jsdelivr.net/gh/freebuisness/assets/zones.json"
];
const POP_URL = "https://data.jsdelivr.com/v1/stats/packages/gh/freebuisness/html@main/files?period=year";
const gameGrid = document.getElementById("games");
const searchInput = document.getElementById("search");
const gameContainer = document.getElementById("gameContainer");
const gameContent = document.getElementById("gameContent");
const gameTitleEl = document.getElementById("game-title");
let allGames = [];
let popularityMap = {};

fetch(POP_URL)
.then(r => r.json())
.then(data => {
data.forEach(file => {
const idMatch = file.name.match(/\/(\d+)\.html$/);
if (idMatch) popularityMap[parseInt(idMatch[1])] = file.hits?.total || 0;
});
})
.catch(() => console.warn("Popularity stats unavailable"));

async function loadZones() {
// Try to get latest SHA for cache busting
let zonesURL = ZONES_URLS[Math.floor(Math.random() * ZONES_URLS.length)];
try {
const shaResponse = await fetch("https://api.github.com/repos/freebuisness/assets/commits?t=" + Date.now());
if (shaResponse.status === 200) {
const shaJson = await shaResponse.json();
const sha = shaJson[0]['sha'];
if (sha) zonesURL = `https://cdn.jsdelivr.net/gh/freebuisness/assets@${sha}/zones.json`;
}
} catch (e) {}

const response = await fetch(zonesURL + "?t=" + Date.now());
const data = await response.json();
return data;
}
const CUSTOM_GAMES = [
{
id: 99999,
name: "Balatro",
cover: "balatroT.avif",
        url: "https://cdn.jsdelivr.net/gh/sea-bean-unblocked/ghost-assets-for-games@main/balatro/index.html",
        url: "balatro.html",
popularity: 999999
},
{
id: 89999,
name: "Inscryption",
cover: "inscryption.png",
        url: "inscryption.html",
popularity: 999999
}
];
loadZones()
.then(data => {
allGames = data.map(g => ({
...g,
cover: g.cover.replace("{COVER_URL}", COVER_URL).replace("{HTML_URL}", HTML_URL),
url: g.url.replace("{HTML_URL}", HTML_URL).replace("{COVER_URL}", COVER_URL),
popularity: popularityMap[g.id] || 0
}));
allGames = [...CUSTOM_GAMES, ...allGames];
allGames.sort((a, b) => b.popularity - a.popularity);
render(allGames);
})
.catch(err => {
gameGrid.textContent = "Failed to load games: " + err;
});

function render(games) {
gameGrid.innerHTML = "";
if (!games.length) {
gameGrid.innerHTML = `
       <div style="grid-column:1/-1;text-align:center;padding:100px;opacity:.3">
           <p>No games found</p>
       </div>`;
return;
}
games.forEach(game => {
const card = document.createElement("div");
card.className = "game-card";
card.innerHTML = `
       <div class="card-icon">
           <img data-src="${game.cover}" alt="${game.name}">
       </div>
       <h3>${game.name}</h3>
       <div class="card-info">
           <span>${game.name}.dat</span>
       </div>`;
card.onclick = () => openGame(game);
gameGrid.appendChild(card);
});
lazyLoadImages();
enableImageHoverTracking();
}

function lazyLoadImages() {
const images = document.querySelectorAll("img[data-src]");
const observer = new IntersectionObserver(entries => {
entries.forEach(entry => {
if (!entry.isIntersecting) return;
const img = entry.target;
img.src = img.dataset.src;
img.removeAttribute("data-src");
observer.unobserve(img);
});
}, { rootMargin: "100px" });
images.forEach(img => observer.observe(img));
}

function enableImageHoverTracking() {
document.querySelectorAll(".card-icon").forEach(icon => {
const img = icon.querySelector("img");
if (!img) return;
icon.addEventListener("mousemove", e => {
const rect = icon.getBoundingClientRect();
const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
img.style.transform = `scale(1.18) translate(${x}px, ${y}px)`;
});
icon.addEventListener("mouseleave", () => {
img.style.transform = "scale(1)";
});
});
}

searchInput.addEventListener("input", e => {
const q = e.target.value.toLowerCase();
render(allGames.filter(g => g.name.toLowerCase().includes(q)));
});

async function openGame(game) {
gameTitleEl.textContent = `${game.name}.dat`;
gameContainer.style.display = "flex";
document.body.style.overflow = "hidden";
gameContent.innerHTML = "";
const iframe = document.createElement("iframe");
iframe.allowFullscreen = true;
iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
gameContent.appendChild(iframe);
let html = await fetch(game.url + "?t=" + Date.now()).then(r => r.text());
const base = game.url.substring(0, game.url.lastIndexOf("/") + 1);
if (!html.match(/<base/i)) {
html = html.replace("<head>", `<head><base href="${base}">`);
}
iframe.contentWindow.document.open();
iframe.contentWindow.document.write(html);
iframe.contentWindow.document.close();
document.title = `${game.name} - Ghost Train`;
}

window.closeGame = () => {
gameContainer.style.display = "none";
document.body.style.overflow = "";
gameContent.innerHTML = "";
};

window.toggleFullscreen = () => {
if (!document.fullscreenElement) gameContent.requestFullscreen();
else document.exitFullscreen();
};
