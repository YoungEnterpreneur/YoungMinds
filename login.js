import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://olrfkzswyaanwmxomynr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmZrenN3eWFhbndteG9teW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTkzNzksImV4cCI6MjA3MTUzNTM3OX0.5nqRbdybZ8qguJbK60GBi1FtWyvuiIbaVxc3t0AQO4Q";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function showPopup(message) {
  let popup = document.getElementById("login-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "login-popup";
    popup.style.position = "fixed";
    popup.style.bottom = "20px";
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.background = "#333";
    popup.style.color = "#fff";
    popup.style.padding = "10px 20px";
    popup.style.borderRadius = "8px";
    popup.style.zIndex = 10000;
    popup.style.transition = "0.3s all ease";
    document.body.appendChild(popup);
  }
  popup.textContent = message;
  popup.style.opacity = 1;
  setTimeout(() => (popup.style.opacity = 0), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showPopup("⚠️ Login failed: " + error.message);
      return;
    }

    // ✅ Login successful
    showPopup("✅ Login successful!");

    const user = data.user;

    // 🔍 Check if this user already has details saved
    const { data: details, error: detailsError } = await supabase
      .from("profiles") // ⬅️ replace with your table name
      .select("*")
      .eq("user_id", user.id) // ⬅️ replace "user_id" with your FK column
      .single();

    if (detailsError && detailsError.code !== "PGRST116") {
      // Any error except "no rows found"
      console.error(detailsError);
      showPopup("⚠️ Error checking details, try again.");
      return;
    }

    // ✅ Decide where to go
    setTimeout(() => {
      if (details) {
        // Already filled → go to gallery
        window.location.href = "gallery.html";
      } else {
        // No details → go to details page
        window.location.href = "details.html";
      }
    }, 400);
  });
});
