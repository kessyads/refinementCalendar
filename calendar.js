// REFERÊNCIAS AOS ELEMENTOS DO DOM
const calendarEl = document.getElementById('calendar');
const overlay = document.getElementById('overlay');

// Elementos do Modal de Opções
const optionModal = document.getElementById('optionModal');
const cadastrarBtn = document.getElementById('cadastrarBtn');
const consultarBtn = document.getElementById('consultarBtn');
const optionCloseBtn = document.getElementById('optionCloseBtn');

// Elementos do Modal de Cadastro
const cadastroModal = document.getElementById('cadastroModal');
const selectedDateEl = document.getElementById('selectedDate');
const refinementNameEl = document.getElementById('refinementName');
const refinementTypeEl = document.getElementById('refinementType');
const participantsContainerEl = document.getElementById('participantsContainer');
const addParticipantBtn = document.getElementById('addParticipantBtn');
const sprintInfoEl = document.getElementById('sprintInfo');
const saveBtn = document.getElementById('saveBtn');
const cadastroCloseBtn = document.getElementById('cadastroCloseBtn');

// Elementos do Modal de Consulta
const consultaModal = document.getElementById('consultaModal');
const consultaDateEl = document.getElementById('consultaDate');
const consultaContentEl = document.getElementById('consultaContent');
const consultaCloseBtn = document.getElementById('consultaCloseBtn');

// Recupera os refinamentos do localStorage (cada data armazenará um array)
const refinements = JSON.parse(localStorage.getItem('refinements')) || {};
let currentDate = '';

// FUNÇÃO PARA CALCULAR O NÚMERO DA SPRINT
const getSprintNumber = (date) => {
  const startSprint104 = new Date('2024-12-30');
  let diffDays = 0;
  let current = new Date(startSprint104);
  
  while (current < date) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) diffDays++;
    current.setDate(current.getDate() + 1);
  }
  
  return 104 + Math.floor(diffDays / 10);
};

// CRIA O CALENDÁRIO E MARCA OS DIAS COM REFINAMENTOS (BOLINHA)
const createCalendar = () => {
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  calendarEl.innerHTML = '';
  
  months.forEach((month, monthIndex) => {
    const monthTitle = document.createElement('h3');
    monthTitle.textContent = month;
    monthTitle.style.gridColumn = 'span 7';
    calendarEl.appendChild(monthTitle);
    
    const headers = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    headers.forEach(header => {
      const headerEl = document.createElement('div');
      headerEl.classList.add('header');
      headerEl.textContent = header;
      calendarEl.appendChild(headerEl);
    });
    
    const firstDay = new Date(2025, monthIndex, 1).getDay();
    const daysInMonth = new Date(2025, monthIndex + 1, 0).getDate();
    
    // Células vazias antes do início do mês
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      calendarEl.appendChild(emptyCell);
    }
    
    // Criação dos dias
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement('div');
      dayEl.classList.add('day');
      const dateKey = `${2025}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dayEl.textContent = `${day}`;
      
      // Se houver refinamentos cadastrados para a data, adiciona a bolinha azul marinho
      if (refinements[dateKey] && refinements[dateKey].length > 0) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dayEl.appendChild(dot);
      }
      
      // Ao clicar, abre o modal de opções para a data
      dayEl.addEventListener('click', () => openOptionModal(dateKey));
      calendarEl.appendChild(dayEl);
    }
  });
};

// CRIA UM CAMPO DE PARTICIPANTE
const createParticipantField = (name = '') => {
  const input = document.createElement('input');
  input.type = 'text';
  input.classList.add('participant-input');
  input.placeholder = 'Nome do participante';
  input.value = name;
  participantsContainerEl.appendChild(input);
};

// --- LÓGICA DOS MODAIS ---

// Abre o modal de opções
const openOptionModal = (dateKey) => {
  currentDate = dateKey;
  overlay.classList.add('active');
  optionModal.classList.add('active');
};

// Fecha TODOS os modais
const closeAllModals = () => {
  optionModal.classList.remove('active');
  cadastroModal.classList.remove('active');
  consultaModal.classList.remove('active');
  overlay.classList.remove('active');
};

// Eventos dos botões do modal de opções
cadastrarBtn.addEventListener('click', () => {
  optionModal.classList.remove('active');
  openCadastroModal(currentDate);
});
consultarBtn.addEventListener('click', () => {
  optionModal.classList.remove('active');
  openConsultaModal(currentDate);
});
optionCloseBtn.addEventListener('click', closeAllModals);

// Abre o modal de cadastro para incluir um novo refinamento
const openCadastroModal = (dateKey) => {
  currentDate = dateKey;
  const dateObj = new Date(dateKey);
  const sprintNumber = getSprintNumber(dateObj);
  
  selectedDateEl.textContent = `Data selecionada: ${dateKey}`;
  sprintInfoEl.textContent = `Sprint: ${sprintNumber}`;
  participantsContainerEl.innerHTML = '';
  
  // Inicia com campos em branco para um novo refinamento
  refinementNameEl.value = '';
  refinementTypeEl.value = 'técnico';
  createParticipantField();
  // Campo adicional para novo participante
  createParticipantField();
  
  cadastroModal.classList.add('active');
};

// Evento para adicionar participante via botão (registrado apenas uma vez)
addParticipantBtn.addEventListener('click', () => {
  createParticipantField();
});

// Adiciona um novo campo automaticamente se o último for preenchido
participantsContainerEl.addEventListener('input', (e) => {
  if (e.target.classList.contains('participant-input')) {
    const inputs = [...participantsContainerEl.querySelectorAll('.participant-input')];
    if (inputs[inputs.length - 1].value.trim() !== '') {
      createParticipantField();
    }
  }
});

// EVENTO DO BOTÃO "SALVAR"
saveBtn.addEventListener('click', () => {
  console.log('Botão Salvar clicado');
  const name = refinementNameEl.value.trim();
  const type = refinementTypeEl.value;
  const participants = [...participantsContainerEl.querySelectorAll('.participant-input')]
    .map(input => input.value.trim())
    .filter(n => n !== '');
  
  if (name || participants.length > 0) {
    const refinementObj = { name, type, participants };
    // Se não houver nada salvo para a data, cria um array
    if (!refinements[currentDate]) {
      refinements[currentDate] = [];
    } else if (!Array.isArray(refinements[currentDate])) {
      // Se existir mas não for um array, converte-o em array
      refinements[currentDate] = [refinements[currentDate]];
    }
    // Adiciona o novo refinamento ao array
    refinements[currentDate].push(refinementObj);
  }
  
  localStorage.setItem('refinements', JSON.stringify(refinements));
  createCalendar();
  closeAllModals();
});


cadastroCloseBtn.addEventListener('click', closeAllModals);

const openConsultaModal = (dateKey) => {
  currentDate = dateKey;
  consultaDateEl.textContent = `Data: ${dateKey}`;
  consultaContentEl.innerHTML = '';
  
  if (refinements[dateKey] && refinements[dateKey].length > 0) {
    refinements[dateKey].forEach((ref, index) => {
      const container = document.createElement('div');
      container.style.border = "1px solid #ddd";
      container.style.padding = "10px";
      container.style.marginBottom = "10px";
      
      container.innerHTML = `<strong>Nome:</strong> ${ref.name || 'N/A'}<br>
          <strong>Tipo:</strong> ${ref.type}<br>
          <strong>Participantes:</strong> ${ref.participants && ref.participants.length ? ref.participants.join(', ') : 'Nenhum'}`;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Deletar';
      deleteBtn.classList.add('btn', 'btn-danger');
      deleteBtn.style.marginTop = "10px";
      deleteBtn.addEventListener('click', () => deleteRefinement(dateKey, index));
      
      container.appendChild(deleteBtn);
      consultaContentEl.appendChild(container);
    });
  } else {
    consultaContentEl.textContent = 'Nenhum refinamento cadastrado para esta data.';
  }
  
  consultaModal.classList.add('active');
};

const deleteRefinement = (dateKey, index) => {
  if (refinements[dateKey]) {
    refinements[dateKey].splice(index, 1);
    if (refinements[dateKey].length === 0) {
      delete refinements[dateKey];
    }
    localStorage.setItem('refinements', JSON.stringify(refinements));
    createCalendar();
    openConsultaModal(dateKey);
  }
};

// Botão para fechar o modal de consulta
consultaCloseBtn.addEventListener('click', closeAllModals);

// Fecha os modais se clicar no overlay
overlay.addEventListener('click', closeAllModals);

// Inicializa o calendário
createCalendar();
