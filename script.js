document.addEventListener("DOMContentLoaded", function () {
  const webAppUrl = "https://script.google.com/macros/s/AKfycbxU1X90G5mO3UtMHsKk0dZk3YFqi0S12_CKrW0MfKWF_ccan-3sdzG0MG8iFkSh8/exec";

  const modal = document.getElementById('taskModal');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const closeModalBtn = document.querySelector('.close-btn');
  const cancelBtn = document.querySelector('.cancel-btn');
  const taskForm = document.getElementById('taskForm');

  document.getElementById("todayDate").textContent = new Date().toLocaleDateString("it-IT");

  addTaskBtn.onclick = () => {
    modal.style.display = 'flex';
    taskForm.reset();
  };

  closeModalBtn.onclick = cancelBtn.onclick = () => {
    modal.style.display = 'none';
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

    const card = document.createElement('div');
    card.classList.add('task-card', task.stato);
    card.innerHTML = `
      <h3>${task.titolo}</h3>
      <p>${task.categoria}</p>
      <p>${task.scadenza}</p>
      <p>${task.priorita}</p>
    `;

    const colonna = document.querySelector(`#${task.stato} .task-container`);
    if (colonna) colonna.appendChild(card);
    modal.style.display = 'none';
  };

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
          card.classList.add("task-card", task.stato);
          card.innerHTML = `
            <h3>${task.titolo}</h3>
            <p>${task.categoria}</p>
            <p>${task.scadenza}</p>
            <p>${task.priorita}</p>
          `;
          const colonna = document.querySelector(`[data-status='${task.stato}'] .task-container`);
          if (colonna) colonna.appendChild(card);
        });
        alert("📥 Importazione completata!");
      })
      .catch(err => alert("❌ Errore importazione: " + err.message));
  };
});
