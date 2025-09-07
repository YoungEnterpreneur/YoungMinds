import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// === Supabase Config ===
const SUPABASE_URL = "https://olrfkzswyaanwmxomynr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmZrenN3eWFhbndteG9teW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTkzNzksImV4cCI6MjA3MTUzNTM3OX0.5nqRbdybZ8qguJbK60GBi1FtWyvuiIbaVxc3t0AQO4Q";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// === DOM Elements ===
const form = document.getElementById("detailsForm");
const toast = document.getElementById("toast");
const pfpInput = document.getElementById("pfp");
const pfpPreview = document.getElementById("pfpPreview");
const logoutBtn = document.getElementById("logoutBtn");

// === Toast Message ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// === Load Profile and Check Session ===
async function loadProfileAndCheckSession() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    window.location.href = "login.html";
    return null;
  }

  const user = session.user;

  // Fetch existing profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch profile:", error);
  }

  if (profile) {
    document.getElementById("name").value = profile.name ?? "";
    document.getElementById("number").value = profile.phone_number ?? "";
    document.getElementById("age").value = profile.age ?? "";
    document.getElementById("gender").value = profile.gender ?? "";
    if (profile.avatar_url) {
      pfpPreview.innerHTML = `<img src="${profile.avatar_url}" alt="avatar" style="max-width:120px;border-radius:50%;">`;
    }
  }

  return user;
}

// === Avatar Preview ===
pfpInput.addEventListener("change", () => {
  const file = pfpInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      pfpPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Picture" style="max-width:200px;border-radius:50%;">`;
    };
    reader.readAsDataURL(file);
  } else {
    pfpPreview.innerHTML = `<span>No Image</span>`;
  }
});

// === Init ===
document.addEventListener("DOMContentLoaded", async () => {
  const user = await loadProfileAndCheckSession();
  if (!user) return; // redirected if no session

  // === Save/Continue Button ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Double-check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      showToast("⚠️ You must be logged in to save.");
      window.location.href = "login.html";
      return;
    }

    // Get form values
    const name = document.getElementById("name").value.trim();
    const phone_number = document.getElementById("number").value.trim();
    const age = document.getElementById("age").value.trim();
    const gender = document.getElementById("gender").value;

    if (!name || !phone_number || !age || !gender) {
      showToast("⚠️ Fill all details!");
      return;
    }

    try {
      // === Upload Avatar if New ===
      let avatarUrl = null;
      if (pfpInput.files[0]) {
        const file = pfpInput.files[0];
        const filePath = `${user.id}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = publicData.publicUrl;
      }

      // === Upsert into profiles table ===
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            name,
            phone_number,
            age: parseInt(age, 10),
            gender,
            ...(avatarUrl && { avatar_url: avatarUrl })
          },
          { onConflict: "user_id" }
        );

      if (upsertError) throw upsertError;

      // === Success → Redirect ===
      showToast("✅ Details saved!");
      setTimeout(() => {
        window.location.href = "profile.html";
      }, 1200);

    } catch (err) {
      console.error(err);
      showToast("⚠️ Failed to save details");
    }
  });

  // === Logout ===
  logoutBtn?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });
});
