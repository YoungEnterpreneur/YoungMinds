import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 Supabase details
const SUPABASE_URL = "https://olrfkzswyaanwmxomynr.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmZrenN3eWFhbndteG9teW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTkzNzksImV4cCI6MjA3MTUzNTM3OX0.5nqRbdybZ8qguJbK60GBi1FtWyvuiIbaVxc3t0AQO4Q";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("ideaForm");
const preview = document.getElementById("preview");
const fileInput = document.getElementById("image");
const projectsGrid = document.querySelector(".projects-grid");

let selectedFiles = [];

// ========== HELPER ==========
function truncate(text, length = 120) {
  return text && text.length > length ? text.substring(0, length) + "..." : text;
}

// ========== IMAGE PREVIEW ==========
fileInput.addEventListener("change", (e) => {
  selectedFiles = Array.from(e.target.files);
  preview.innerHTML = "";
  selectedFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = document.createElement("img");
      img.src = ev.target.result;
      img.alt = "Preview";
      img.style.maxWidth = "120px";
      img.style.margin = "5px";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

// ========== FORM SUBMIT ==========
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !description) {
    alert("⚠️ Please fill out all required fields.");
    return;
  }

  if (selectedFiles.length < 2) {
    alert("⚠️ Please upload at least 2 images.");
    return;
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("❌ You must be logged in to submit an idea.");
      return;
    }

    const uploadedUrls = [];

    for (const file of selectedFiles) {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("project")
        .getPublicUrl(fileName);

      uploadedUrls.push(publicData.publicUrl);
    }

    const { error } = await supabase.from("projects").insert([
      {
        user_id: user.id,
        title,
        description,
        images: uploadedUrls,
        views: 0,
      },
    ]);

    if (error) throw error;

    alert("✅ Project submitted successfully!");
    form.reset();
    preview.innerHTML = "";
    selectedFiles = [];
    await loadProjects();
  } catch (err) {
    console.error("Submission error:", err.message);
    alert("❌ Error submitting project: " + err.message);
  }
});

// ========== LOAD PROJECTS ==========
window.addEventListener("DOMContentLoaded", async () => {
  await loadProjects();
});

async function loadProjects() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      projectsGrid.innerHTML = `<p>Please log in to see your projects.</p>`;
      return;
    }

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    projectsGrid.innerHTML = "";

    if (!projects || projects.length === 0) {
      projectsGrid.innerHTML = `<p>No projects yet. Upload one!</p>`;
      return;
    }

    projects.forEach((project) => {
      const views = project.views ?? 0;
      const images = project.images || [];

      const card = document.createElement("div");
      card.classList.add("project-card");

      let sliderHTML = "";
      if (images.length > 0) {
        sliderHTML = `
          <div class="image-slider">
            ${images.length > 1 ? '<button class="slider-btn prev">◀</button>' : ''}
            <img src="${images[0]}" alt="Project Image" class="slider-img">
            ${images.length > 1 ? '<button class="slider-btn next">▶</button>' : ''}
          </div>
        `;
      } else {
        sliderHTML = `<img src="assets/placeholder.jpg" alt="Project Image">`;
      }

      card.innerHTML = `
        ${sliderHTML}
        <div class="project-info">
          <h3>${project.title}</h3>
          <p>${truncate(project.description)}</p>
          <span class="views">👁 ${views} views</span>
        </div>
      `;

      // ========== SLIDER FUNCTIONALITY ==========
      if (images.length > 1) {
        const sliderImg = card.querySelector(".slider-img");
        const prevBtn = card.querySelector(".prev");
        const nextBtn = card.querySelector(".next");
        let index = 0;
        let isAnimating = false;

        function changeImage(newIndex) {
          if (isAnimating) return;
          isAnimating = true;

          sliderImg.classList.add("fade-out");

          setTimeout(() => {
            index = (newIndex + images.length) % images.length;
            sliderImg.src = images[index];
            sliderImg.classList.remove("fade-out");
            sliderImg.classList.add("fade-in");

            setTimeout(() => {
              sliderImg.classList.remove("fade-in");
              isAnimating = false;
            }, 300);
          }, 300);
        }

        prevBtn.addEventListener("click", () => changeImage(index - 1));
        nextBtn.addEventListener("click", () => changeImage(index + 1));
      }

      projectsGrid.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading projects:", err.message);
    projectsGrid.innerHTML = `<p>⚠️ Error loading projects</p>`;
  }
}
