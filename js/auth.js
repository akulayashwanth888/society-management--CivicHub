function login() {
  fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.token) {
      alert(data.message);
      return;
    }

    localStorage.setItem("token", data.token);

    if (getRole() === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "resident.html";
    }
  });
}
