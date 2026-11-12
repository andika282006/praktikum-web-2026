document.addEventListener("DOMContentLoaded", () => {
  const mhsForm = document.querySelector("#mhsForm");
  const mhsIdInput = document.querySelector("#mhsId");
  const nimInput = document.querySelector("#nim");
  const namaInput = document.querySelector("#nama");
  const jurusanInput = document.querySelector("#jurusan");
  const emailInput = document.querySelector("#email");
  const btnSubmit = document.querySelector("#btnSubmit");
  const btnCancel = document.querySelector("#btnCancel");
  const formTitle = document.querySelector("#formTitle");
  const mhsTableBody = document.querySelector("#mhsTableBody");
  const alertMessage = document.querySelector("#alertMessage");

  const state = {
    listMahasiswa: []
  };

  const showAlert = (text, type = "success") => {
    if (!alertMessage) return;

    alertMessage.textContent = text;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.style.display = "block";

    clearTimeout(showAlert.timeoutId);
    showAlert.timeoutId = setTimeout(() => {
      alertMessage.style.display = "none";
    }, 3000);
  };

  const resetForm = () => {
    if (!mhsForm || !mhsIdInput || !formTitle || !btnSubmit || !btnCancel) return;

    mhsForm.reset();
    mhsIdInput.value = "";
    formTitle.textContent = "Tambah Mahasiswa Baru";
    btnSubmit.textContent = "Simpan Mahasiswa";
    btnCancel.style.display = "none";
  };

  const renderTable = (data = []) => {
    if (!mhsTableBody) return;

    mhsTableBody.innerHTML = "";

    if (!data.length) {
      mhsTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:#64748b;'>Belum ada data mahasiswa tersimpan.</td></tr>";
      return;
    }

    data.forEach((mhs, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${mhs.nim}</td>
        <td>${mhs.nama}</td>
        <td>${mhs.jurusan}</td>
        <td>${mhs.email}</td>
        <td>
          <button class="btn-action btn-edit" data-id="${mhs.id}">Edit</button>
          <button class="btn-action btn-delete" data-id="${mhs.id}">Hapus</button>
        </td>
      `;
      mhsTableBody.appendChild(row);
    });
  };

  const loadMahasiswa = async () => {
    try {
      const response = await fetch("/api/mahasiswa");
      if (!response.ok) {
        throw new Error("Request gagal");
      }

      const data = await response.json();
      state.listMahasiswa = Array.isArray(data) ? data : [];
      renderTable(state.listMahasiswa);
    } catch (error) {
      showAlert("Gagal memuat data dari server backend", "error");
    }
  };

  const getFormData = () => ({
    nim: nimInput.value.trim(),
    nama: namaInput.value.trim(),
    jurusan: jurusanInput.value.trim(),
    email: emailInput.value.trim()
  });

  if (mhsForm) {
    mhsForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const payload = getFormData();
      const id = mhsIdInput.value;
      const isEdit = Boolean(id);
      const url = isEdit ? `/api/mahasiswa/${id}` : "/api/mahasiswa";
      const method = isEdit ? "PUT" : "POST";

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
          showAlert(result.message);
          resetForm();
          await loadMahasiswa();
          return;
        }

        showAlert("Terjadi kesalahan: " + result.message, "error");
      } catch (error) {
        showAlert("Gagal mengirim data ke server", "error");
      }
    });
  }

  if (mhsTableBody) {
    mhsTableBody.addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      const id = Number(button.dataset.id);
      if (!id) return;

      if (button.classList.contains("btn-edit")) {
        const targetMahasiswa = state.listMahasiswa.find((mhs) => mhs.id === id);
        if (!targetMahasiswa) return;

        mhsIdInput.value = targetMahasiswa.id;
        nimInput.value = targetMahasiswa.nim;
        namaInput.value = targetMahasiswa.nama;
        jurusanInput.value = targetMahasiswa.jurusan;
        emailInput.value = targetMahasiswa.email;

        formTitle.textContent = "Edit Data Mahasiswa";
        btnSubmit.textContent = "Perbarui Mahasiswa";
        btnCancel.style.display = "inline-block";
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (button.classList.contains("btn-delete")) {
        const confirmation = window.confirm("Apakah Anda yakin ingin menghapus data mahasiswa ini?");
        if (!confirmation) return;

        try {
          const response = await fetch(`/api/mahasiswa/${id}`, { method: "DELETE" });
          const result = await response.json();

          if (result.success) {
            showAlert(result.message);
            await loadMahasiswa();
            return;
          }

          showAlert("Gagal menghapus data dari server", "error");
        } catch (error) {
          showAlert("Gagal menghapus data dari server", "error");
        }
      }
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener("click", resetForm);
  }

  resetForm();
  loadMahasiswa();
});
