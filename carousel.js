import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 Initialize Supabase
const supabaseUrl = "https://olrfkzswyaanwmxomynr.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmZrenN3eWFhbndteG9teW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTkzNzksImV4cCI6MjA3MTUzNTM3OX0.5nqRbdybZ8qguJbK60GBi1FtWyvuiIbaVxc3t0AQO4Q";
const supabase = createClient(supabaseUrl, supabaseKey);

const carousel = document.getElementById("carousel");

async function loadCarouselData() {
  // Fetch 5 random projects
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, description, images, user_id")
    .limit(5)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    carousel.innerHTML = "<p style='color:white'>Failed to load ideas.</p>";
    return;
  }

  // Fetch names from profiles in parallel
  const itemsHtml = await Promise.all(projects.map(async (project) => {
    const imgUrl = project.images?.[0] || "assets/default.jpg";

    let userName = "Unknown";
    if (project.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", project.user_id)
        .single();
      if (profile?.name) userName = profile.name;
    }

    return `
      <div class="item">
        <img src="${imgUrl}" alt="${project.title}">
        <div class="name">${project.title ?? "Untitled Idea"}</div>
        <div class="occupation">By: ${userName}</div>
        <div class="testimonial">${project.description ?? ""}</div>
      </div>
    `;
  }));

  carousel.innerHTML = itemsHtml.join("");
}

// Load on script import
loadCarouselData();
