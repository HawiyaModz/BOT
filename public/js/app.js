function toggleMenu(){document.getElementById("nav").classList.toggle("show")}
function toggleTheme(){
  document.documentElement.classList.toggle("light");
  localStorage.setItem("theme", document.documentElement.classList.contains("light") ? "light" : "dark");
}
if(localStorage.getItem("theme")==="light") document.documentElement.classList.add("light");