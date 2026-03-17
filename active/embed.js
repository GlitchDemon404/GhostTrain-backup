"use strict";

let urlParams = new URLSearchParams(window.location.search);
let destination = urlParams.get("url");

if (!destination) {
  alert("Error: No URL provided!");
  throw new Error("No URL provided");
}

try {
  destination = new URL(destination).toString();
} catch (err) {
  alert(`Your boat crashed!\nInvalid URL:\n${err}`);
  throw err;
}

registerSW()
  .then(() => {
    window.open(__uv$config.prefix + __uv$config.encodeUrl(destination), "_self");
  })
  .catch((err) => {
    alert(`Your boat crashed!\nAn error occurred:\n${err}`);
  });
