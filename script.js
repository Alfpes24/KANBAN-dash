document.addEventListener("DOMContentLoaded", function () {
  const webAppUrl = "https://script.google.com/macros/s/AKfycbzbSYMr6dXv47mCrhWrYqX8_tdwUNWDE64qCb5_xCAFTwXkY9j-OtW4lzi6NCL-LUxF/exec";

  const modal = document.getElementById('taskModal');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const closeModalBtn = document.querySelector('.close-btn');
  const cancelBtn = document.querySelector('.cancel-btn');
  const taskForm = document.getElementById('taskForm');

  let editingCard = null;

  document.getElementById("todayDate").textContent = new Date().toLocaleDateString("it-IT");

  addTaskBtn.onclick = () => {
    modal.style.display = 'flex';
    taskForm.reset();
    editingCard = null;
  };

  closeModalBtn.onclick = cancelBtn.onclick = () => {
    modal.style.display = 'none';
    editingCard = null;
  };

  taskForm.onsubmit = (e) => {
    e.preventDefault();

    const task = {
      titolo: document.getElementById('taskTitle').value,
      categoria: document.getElementById('taskCategory').value,
      scadenza: document.getElementById('taskDeadline').value,
      priorita: document.getElementById('taskPriority').value,
      stato: document.getElementById('taskStatus').value
    };

    const card = editingCard || document.createElement('div');
    card.className = `task-card ${task.stato}`;
    card.innerHTML = `
      <h3>${task.titolo}</h3>
      <p>${task.categoria}</p>
      <p>${task.scadenza}</p>
      <p>${task.priorita}</p>
      <button class="edit-btn">✏️</button>
      <button class="delete-btn">🗑</button>
    `;

    card.querySelector('.edit-btn').onclick = () => editTask(card);
    card.querySelector('.delete-btn').onclick = () => card.remove();

    const colonna = document.querySelector(`#${task.stato} .task-container`);
    if (!editingCard) {
      if (colonna) colonna.appendChild(card);
    } else {
      const currentColumn = editingCard.closest('.task-container');
      if (currentColumn && currentColumn !== colonna) {
        editingCard.remove();
        if (colonna) colonna.appendChild(card);
      }
      editingCard = null;
    }

    modal.style.display = 'none';
  };

  function editTask(card) {
    editingCard = card;
    const dati = card.querySelectorAll('p');
    document.getElementById('taskTitle').value = card.querySelector('h3').innerText;
    document.getElementById('taskCategory').value = dati[0].innerText;
    document.getElementById('taskDeadline').value = dati[1].innerText;
    document.getElementById('taskPriority').value = dati[2].innerText;
    document.getElementById('taskStatus').value = card.classList[1];
    modal.style.display = 'flex';
  }

  document.getElementById("export-btn").onclick = () => {
    const taskCards = document.querySelectorAll(".task-card");
    const tasks = [];

    taskCards.forEach(card => {
      const titolo = card.querySelector("h3")?.innerText || "";
      const paragrafi = card.querySelectorAll("p");
      const categoria = paragrafi[0]?.innerText || "";
      const scadenza = paragrafi[1]?.innerText || "";
      const priorita = paragrafi[2]?.innerText || "";
      const stato = card.closest(".kanban-column").dataset.status;
      const dataAttivita = new Date().toLocaleDateString("it-IT");

      tasks.push({ titolo, categoria, scadenza, priorita, stato, dataAttivita });
    });

    fetch(webAppUrl, {
      method: "POST",
      body: JSON.stringify(tasks)
    })
    .then(response => response.text())
    .then(text => alert("✅ Esportazione completata: " + text))
    .catch(error => alert("❌ Errore esportazione: " + error.message));
  };

  document.getElementById("import-btn").onclick = () => {
    fetch(webAppUrl)
      .then(response => response.json())
      .then(data => {
        document.querySelectorAll('.task-container').forEach(c => c.innerHTML = '');
        data.forEach(task => {
          const card = document.createElement("div");
          card.className = `task-card ${task.stato}`;
          card.innerHTML = `
            <h3>${task.titolo}</h3>
            <p>${task.categoria}</p>
            <p>${task.scadenza}</p>
            <p>${task.priorita}</p>
            <button class="edit-btn">✏️</button>
            <button class="delete-btn">🗑</button>
          `;
          card.querySelector('.edit-btn').onclick = () => editTask(card);
          card.querySelector('.delete-btn').onclick = () => card.remove();
          const colonna = document.querySelector(`[data-status='${task.stato}'] .task-container`);
          if (colonna) colonna.appendChild(card);
        });
        alert("📥 Importazione completata!");
      })
      .catch(err => alert("❌ Errore importazione: " + err.message));
  };
});
