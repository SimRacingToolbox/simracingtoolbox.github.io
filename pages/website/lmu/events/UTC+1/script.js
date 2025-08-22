// Toggle menu open/close
document.getElementById("logoButton").addEventListener("click", () => {
  document.getElementById("slideMenu").classList.add("open");
});

document.getElementById("closeMenu").addEventListener("click", () => {
  document.getElementById("slideMenu").classList.remove("open");
});