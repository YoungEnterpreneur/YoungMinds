import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 Initialize Supabase
const supabaseUrl = "https://olrfkzswyaanwmxomynr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmZrenN3eWFhbndteG9teW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTkzNzksImV4cCI6MjA3MTUzNTM3OX0.5nqRbdybZ8qguJbK60GBi1FtWyvuiIbaVxc3t0AQO4Q";
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 Get project ID from URL
function getProjectId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 🔹 Change main image
window.changeImage = function(el) {
  document.getElementById("displayImg").src = el.src;
};

async function loadProject() {
  const projectId = getProjectId();
  if (!projectId) return;

  // 🔹 Fetch project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    console.error("❌ Error fetching project:", projectError);
    return;
  }

  // 🔹 Update project info
  document.querySelector(".idea-title").textContent = project.title ?? "Untitled Project";
  document.querySelector(".idea-description").textContent = project.description ?? "No description provided.";

  // 🔹 Update images
  const imageUrls = project.images?.length > 0 ? project.images : ["assets/default.jpg"];
  document.getElementById("displayImg").src = imageUrls[0];
  document.querySelector(".thumbnails").innerHTML = imageUrls
    .map(url => `<img src="${url}" onclick="changeImage(this)">`)
    .join("");

  // 🔹 Fetch profile by user_id (separately, no foreign key)
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", project.user_id)
    .single();

  if (userError || !user) {
    console.error("❌ Error fetching user profile:", userError);
    return;
  }

  // 🔹 Update user info in HTML
  document.querySelector(".author-name").textContent = user.name ?? "N/A";
  document.querySelector(".author-phone").textContent = user.phone_number ?? "N/A";
  document.querySelector(".author-age").textContent = user.age ?? "N/A";
  document.querySelector(".author-gender").textContent = user.gender ?? "N/A";
  document.querySelector(".author-school").textContent = user.school ?? "N/A";
  document.querySelector(".author-email").textContent = user.email ?? "N/A";
  document.querySelector(".author-img").src = user.profile_image_url ?? "assets/default-profile.jpg";
}

// 🔹 Load project on page load
loadProject();
