// Toggle menu open/close
document.getElementById("logoButton").addEventListener("click", () => {
  document.getElementById("slideMenu").classList.add("open");
});

document.getElementById("closeMenu").addEventListener("click", () => {
  document.getElementById("slideMenu").classList.remove("open");
});

document.getElementById("goUTC").addEventListener("click", () => {
  const select = document.getElementById("utcSelect");
  const selected = select.value;
  if (selected) {
    window.location.href = `/pages/website/lmu/events/${selected}/`;
  }
});