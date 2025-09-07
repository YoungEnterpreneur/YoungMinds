import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 Initialize Supabase
const supabaseUrl = "https://olrfkzswyaanwmxomynr.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmZrenN3eWFhbndteG9teW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTkzNzksImV4cCI6MjA3MTUzNTM3OX0.5nqRbdybZ8qguJbK60GBi1FtWyvuiIbaVxc3t0AQO4Q";
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 Helper: truncate long descriptions
function truncate(text, length = 120) {
  return text && text.length > length ? text.substring(0, length) + "..." : text;
}

async function fetchIdeas() {
  const container = document.getElementById("ideas");
  container.innerHTML = `<p style="color:white;">Loading ideas...</p>`;

  // 🔹 Fetch projects
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, description, images")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching projects:", error.message);
    container.innerHTML = `<p style="color:red;">Error loading ideas.</p>`;
    return;
  }

  container.innerHTML = ""; // clear loading

  projects.forEach((project) => {
    const imageUrl = (project.images && project.images.length > 0)
      ? project.images[0]
      : "assets/default.jpg";

    const card = document.createElement("div");
    card.className = "idea-card fade-up";
    card.innerHTML = `
      <a href="idea.html?id=${project.id}" class="idea-link">
        <img src="${imageUrl}" alt="${project.title}">
        <div class="idea-content">
          <h3>${project.title ?? "Untitled Idea"}</h3>
          <p>${truncate(project.description)}</p>
        </div>
      </a>
    `;

    container.appendChild(card);
  });
}

fetchIdeas();
