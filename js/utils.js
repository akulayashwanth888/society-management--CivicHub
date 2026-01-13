const BASE_URL = "https://civichub-society-management-pro.onrender.com";

function getToken() {
  return localStorage.getItem("token");
}

function getRole() {
  const token = getToken();
  if (!token) return null;
  return JSON.parse(atob(token.split(".")[1])).role;
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
