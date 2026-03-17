"use strict";
let urlParams = new URLSearchParams(window.location.search);
let destination = urlParams.get("url");

if (!destination) {
  alert("Error: No URL provided!");
  throw new Error("No URL provided");
}
try {
  destination = decodeURIComponent(destination);
} catch (e) {
  console.warn("Already decoded or invalid encoding");
}
if (!destination.startsWith("http://") && !destination.startsWith("https://")) {
  destination = "https://" + destination;
}
try {
  destination = new URL(destination).toString();
} catch (err) {
  alert(`Your boat crashed!\nInvalid URL:\n${err}`);
  throw err;
}
const text = document.getElementById("loading-text");
if (text) text.innerText = "Launching Ghost Train...";
registerSW()
  .then(() => {
    const encoded = __uv$config.encodeUrl(destination);
    window.location.href = __uv$config.prefix + encoded;
  })
  .catch((err) => {
    alert(`Your boat crashed!\nAn error occurred:\n${err}`);
    console.error(err);
  });
