const correctUser = "admin";
const correctPass = "1234";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if(user === correctUser && pass === correctPass) {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "../index.html";
  } else {
    errorMsg.textContent = "Ongeldige gebruikersnaam of wachtwoord.";
  }
});
