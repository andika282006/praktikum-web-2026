// File: main.js
// Logika Tugas Mandiri: Interactive Portfolio Tracker

let projects = [
  { id: 1, title: "Sistem Inventaris Keuangan", category: "Web App", budget: 2500000, completed: true },
  { id: 2, title: "Sistem Kasir Digital POS", category: "Desktop App", budget: 5000000, completed: true },
  { id: 3, title: "Landing Page Profil Perusahaan", category: "Web App", budget: 1500000, completed: false },
  { id: 4, title: "Aplikasi Presensi GPS Mobile", category: "Mobile App", budget: 4500000, completed: false }
];

let activeCategory = "Semua";
let searchQuery = "";

// Helper Format Currency
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

// Update Ringkasan Finansial & Statistik
const updateStats = () => {
  const totalProjects = projects.length;
  const totalBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);
  const completedCount = projects.filter(item => item.completed).length;

  document.getElementById("stat-total-projects").textContent = totalProjects;
  document.getElementById("stat-total-budget").textContent = formatRupiah(totalBudget);
  document.getElementById("stat-completed-projects").textContent = completedCount;
};

// Render Kartu Proyek
const renderProjects = () => {
  const container = document.getElementById("project-list");
  if (!container) return;

  // Fitur 2: Filter Terpadu (Live Search + Kategori)
  const filteredList = projects.filter(proj => {
    const matchCategory = activeCategory === "Semua" || proj.category === activeCategory;
    const matchSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filteredList.length === 0) {
    container.innerHTML = "<p style='text-align: center; color: #94a3b8; padding: 20px;'>Tidak ada proyek ditemukan.</p>";
    return;
  }

  const htmlString = filteredList.map(proj => {
    const badgeClass = proj.completed ? "badge-success" : "badge-pending";
    const statusText = proj.completed ? "Selesai" : "Dalam Pengerjaan";

    return `
      <div class="project-card">
        <div class="project-info">
          <span class="project-category">${proj.category}</span>
          <h4>${proj.title}</h4>
          <p class="project-budget">${formatRupiah(proj.budget)}</p>
        </div>
        <div class="card-actions">
          <span class="badge ${badgeClass}">${statusText}</span>
          <button class="btn-action btn-toggle" onclick="toggleStatus(${proj.id})">Ubah Status</button>
          <button class="btn-action btn-delete" onclick="deleteProject(${proj.id})">Hapus</button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = htmlString;
};

// Fitur 3: Aksi Interaktif (Toggle Status & Hapus)
window.toggleStatus = (id) => {
  projects = projects.map(proj => {
    if (proj.id === id) {
      return { ...proj, completed: !proj.completed };
    }
    return proj;
  });
  updateStats();
  renderProjects();
};

window.deleteProject = (id) => {
  projects = projects.filter(proj => proj.id !== id);
  updateStats();
  renderProjects();
};

// Initialization & Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  renderProjects();

  // Fitur 1: Form Input Proyek Dinamis
  const projectForm = document.getElementById("project-form");
  if (projectForm) {
    projectForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const titleInput = document.getElementById("input-title").value.trim();
      const categoryInput = document.getElementById("input-category").value;
      const budgetInput = Number(document.getElementById("input-budget").value);
      const completedInput = document.getElementById("input-completed").checked;

      // Validasi
      if (!titleInput || budgetInput <= 0) {
        alert("Judul tidak boleh kosong dan anggaran harus lebih besar dari 0!");
        return;
      }

      // Buat Objek Baru (ID unik Date.now())
      const newProject = {
        id: Date.now(),
        title: titleInput,
        category: categoryInput,
        budget: budgetInput,
        completed: completedInput
      };

      projects.push(newProject);
      updateStats();
      renderProjects();
      projectForm.reset();
    });
  }

  // Fitur 2: Live Search (event 'input')
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProjects();
    });
  }

  // Filter Kategori
  const filterButtons = document.querySelectorAll(".btn-filter");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterButtons.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      activeCategory = e.target.getAttribute("data-category");
      renderProjects();
    });
  });
});