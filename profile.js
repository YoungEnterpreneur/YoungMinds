// Avatar Preview Handler
document.getElementById("avatarUpload")?.addEventListener("change", function(event) {
  const preview = document.getElementById("avatarPreview");
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = "No Image";
  }
});

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// === Supabase Config ===
const SUPABASE_URL = "https://olrfkzswyaanwmxomynr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmZrenN3eWFhbndteG9teW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTkzNzksImV4cCI6MjA3MTUzNTM3OX0.5nqRbdybZ8qguJbK60GBi1FtWyvuiIbaVxc3t0AQO4Q"; // replace with your anon key (client-side ok)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Elements
const upload = document.getElementById("uploadPfp");
const profileImg = document.getElementById("profileImage");

// === Get current user session ===
let currentUser = null;
async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  if (!user) {
    alert("Not logged in!");
    window.location.href = "login.html";
    return;
  }
  loadProfile(user.id);
}

// === Load profile ===
async function loadProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)  // <-- changed here
    .single();

  if (error) {
    console.error("Load error:", error.message);
    return;
  }

  // Fill inputs (using IDs from your HTML)
  document.getElementById("fullName").value = data.name || "";
  document.getElementById("eMail").value = data.email || "";
  document.getElementById("phone").value = data.phone_number || "";
  document.getElementById("school").value = data.school || "";
  document.getElementById("Street").value = data.street || "";
  document.getElementById("ciTy").value = data.city || "";
  document.getElementById("sTate").value = data.state || "";
  document.getElementById("zIp").value = data.zip || "";
  document.getElementById("age").value = data.age || "";
  document.getElementById("gender").value = data.gender || "";

  // Update left-side info under avatar
const userNameElem = document.querySelector(".user-name");
const userEmailElem = document.querySelector(".user-email");

if (userNameElem) userNameElem.textContent = data.name || "Your Name";
if (userEmailElem) userEmailElem.textContent = data.email || currentUser.email;

  if (data.avatar_url) {
    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.avatar_url);
    profileImg.src = publicUrl.publicUrl;
  }
}

// === Save profile ===
async function saveProfile() {
  if (!currentUser) return;

  const updates = {
    user_id: currentUser.id, // <-- changed here
    name: document.getElementById("fullName").value,
    email: document.getElementById("eMail").value,
    phone_number: document.getElementById("phone").value,
    school: document.getElementById("school").value,
    street: document.getElementById("Street").value,
    city: document.getElementById("ciTy").value,
    state: document.getElementById("sTate").value,
    zip: document.getElementById("zIp").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    updated_at: new Date()
  };

  const { error } = await supabase.from("profiles").upsert(updates);
  if (error) {
    alert("Save failed: " + error.message);
  } else {
    // ✅ Toast
    const toast = document.createElement("div");
    toast.innerText = "Profile saved successfully!";
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.padding = "14px 22px";
    toast.style.borderRadius = "14px";
    toast.style.background = "rgba(255,255,255,0.15)";
    toast.style.backdropFilter = "blur(8px)";
    toast.style.color = "#fff";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 0 12px rgba(255,255,255,0.6)";
    toast.style.zIndex = "9999";
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.5s";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  }
}

// === Avatar upload ===
upload?.addEventListener("change", async () => {
  const file = upload.files[0];
  if (!file || !currentUser) return;

  const fileName = `${currentUser.id}-${Date.now()}.${file.name.split(".").pop()}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    alert("Upload failed: " + uploadError.message);
    return;
  }

  // Save URL in profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: fileName })
    .eq("user_id", currentUser.id); // <-- changed here

  if (updateError) {
    alert("Avatar save failed: " + updateError.message);
    return;
  }

  const { data: publicUrl } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);
  profileImg.src = publicUrl.publicUrl;
});

// === Attach saveProfile to the Update button ===
const updateBtn = document.querySelector(".btn.btn-upload");
updateBtn?.addEventListener("click", saveProfile);

// Init
getUser();
