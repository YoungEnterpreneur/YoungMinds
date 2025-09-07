import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://olrfkzswyaanwmxomynr.supabase.co";
const SUPABASE_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmZrenN3eWFhbndteG9teW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTkzNzksImV4cCI6MjA3MTUzNTM3OX0.5nqRbdybZ8qguJbK60GBi1FtWyvuiIbaVxc3t0AQO4Q";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔥 Reusable popup function
function showPopup(message) {
  let popup = document.getElementById("popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "popup";
    popup.className = "popup";
    document.body.appendChild(popup);
  }

  popup.innerText = message;
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
}

document
  .getElementById("signup-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    if (password !== confirmPassword) {
      showPopup("Passwords do not match!");
      return;
    }

    // Sign up user with username stored in user_metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      showPopup("Signup failed: " + error.message);
    } else {
      showPopup("Signup successful! Please confirm your email.");
      console.log("User ID:", data.user.id);
      console.log("Username:", data.user.user_metadata.username);

      // redirect after popup
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    }
  });

// ✅ Smooth transition toggle
function setupTransition() {
  const transition = document.getElementById("page-transition");

  document.getElementById("to-login").addEventListener("click", (e) => {
    e.preventDefault();

    transition.classList.remove("fade-out");
    transition.classList.add("active", "slide-left");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 600); // match CSS duration
  });
}

window.addEventListener("load", () => {
  const transition = document.getElementById("page-transition");
  // fade out overlay on load
  transition.classList.add("fade-out");
  setTimeout(() => {
    transition.classList.remove("active", "slide-left", "slide-right", "fade-out");
  }, 600);
});

setupTransition();


