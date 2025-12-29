/* =========================
   GLOBAL STATE
========================= */
let currentPage = 'home';
let inventory = [];
let editingInventoryId = null;
let currentDesignerCategory = 'color';
let selectedNailIndex = null;

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
  loadInventoryFromStorage();
  updateHomeStats();
  renderInventory();
  renderDesignerInventory();
});

/* =========================
   LOCAL STORAGE
========================= */
function saveInventoryToStorage() {
  localStorage.setItem('nailInventory', JSON.stringify(inventory));
}

function loadInventoryFromStorage() {
  const data = localStorage.getItem('nailInventory');
  if (data) inventory = JSON.parse(data);
}

/* =========================
   PAGE NAVIGATION
========================= */
function showPage(page) {
  document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');

  const pageMap = {
    home: 'homePage',
    designer: 'designerPage',
    inventory: 'inventoryPage',
    gallery: 'galleryPage',
    export: 'exportPage'
  };

  const pageId = pageMap[page];
  if (pageId) document.getElementById(pageId).style.display = 'block';
  currentPage = page;

  if (page === 'inventory') renderInventory();
  if (page === 'designer') renderDesignerInventory();
}

/* =========================
   INVENTORY CRUD
========================= */
function saveInventoryItem() {
  const category = document.getElementById('invCategory').value;
  const type = document.getElementById('invType').value.trim();
  const color = document.getElementById('invColor').value.trim();
  const finish = document.getElementById('invFinish').value;
  const image = document.getElementById('invImage').value.trim();

  if (!category || !type) {
    alert('Category and product name are required.');
    return;
  }

  if (editingInventoryId !== null) {
    const item = inventory.find(i => i.id === editingInventoryId);
    Object.assign(item, { category, type, color, finish, image });
  } else {
    inventory.push({
      id: crypto.randomUUID(),
      category,
      type,
      color,
      finish,
      image
    });
  }

  saveInventoryToStorage();
  resetInventoryForm();
  renderInventory();
  renderDesignerInventory();
  updateHomeStats();
}

function deleteInventoryItem(id) {
  if (!confirm('Delete this product?')) return;
  inventory = inventory.filter(i => i.id !== id);
  saveInventoryToStorage();
  renderInventory();
  renderDesignerInventory();
  updateHomeStats();
}

function editInventoryItem(id) {
  const item = inventory.find(i => i.id === id);
  if (!item) return;

  document.getElementById('invCategory').value = item.category;
  document.getElementById('invType').value = item.type;
  document.getElementById('invColor').value = item.color;
  document.getElementById('invFinish').value = item.finish;
  document.getElementById('invImage').value = item.image;

  document.getElementById('inventoryFormTitle').innerText = 'Edit Product';
  editingInventoryId = id;

  showPage('inventory');
}

function resetInventoryForm() {
  ['invCategory', 'invType', 'invColor', 'invFinish', 'invImage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  editingInventoryId = null;
  document.getElementById('inventoryFormTitle').innerText = 'Add Product';
}

/* =========================
   RENDER INVENTORY
========================= */
function renderInventory() {
  const list = document.getElementById('inventoryList');
  if (!list) return;
  list.innerHTML = '';

  inventory.forEach(item => {
    list.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 p-3">
          ${item.image ? `<img src="${item.image}" class="img-fluid mb-2 rounded">` : ''}
          <strong>${item.type}</strong>
          <div class="text-muted text-capitalize">${item.category}</div>
          <div>${item.color || ''} ${item.finish || ''}</div>

          <div class="mt-2 d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary"
              onclick="editInventoryItem('${item.id}')">Edit</button>
            <button class="btn btn-sm btn-outline-danger"
              onclick="deleteInventoryItem('${item.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  });
}

/* =========================
   DESIGNER INVENTORY
========================= */
function renderDesignerInventory() {
  const container = document.getElementById('designerInventory');
  if (!container) return;

  container.innerHTML = '';

  inventory
    .filter(item => item.category === currentDesignerCategory)
    .forEach(item => {
      container.innerHTML += `
        <div class="col-md-3">
          <div class="card p-2 h-100 designer-item"
               onclick="applyInventoryToSelectedNail('${item.id}')">
            ${item.image ? `<img src="${item.image}" class="img-fluid rounded mb-2">` : ''}
            <strong>${item.type}</strong>
            <small class="text-muted">
              ${item.color || ''} ${item.finish || ''}
            </small>
          </div>
        </div>
      `;
    });
}

/* =========================
   DESIGNER NAIL LOGIC
========================= */
function selectNail(index) {
  selectedNailIndex = index;
}

function applyInventoryToSelectedNail(id) {
  if (selectedNailIndex === null) {
    alert('Select a nail first.');
    return;
  }

  const item = inventory.find(i => i.id === id);
  if (!item) return;

  alert(`Applying ${item.type} (${item.color || 'N/A'}) to nail ${selectedNailIndex}`);
}

function setDesignerCategory(category, evt) {
  currentDesignerCategory = category;

  document.querySelectorAll('#designerInvTabs .nav-link').forEach(btn => btn.classList.remove('active'));
  if (evt) evt.target.classList.add('active');

  renderDesignerInventory();
}

function renderNails() {
  const container = document.querySelector('#nailCanvas .fingers');
  container.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const div = document.createElement('div');
    div.className = 'finger-container';
    div.onclick = () => selectNail(i);
    div.innerHTML = `
      <svg class="nail-shape" width="55" height="90">
        <path d="M5,10 L50,10 L50,80 Q50,88 27.5,88 Q5,88 5,80 Z"
              fill="#f5c6cf" stroke="#d8a5b2" stroke-width="2"/>
      </svg>
    `;
    container.appendChild(div);
  }
}

// Call it when designer page loads
document.addEventListener('DOMContentLoaded', () => {
  renderNails();
});


/* =========================
   HOME STATS
========================= */
function updateHomeStats() {
  const counts = {
    color: inventory.filter(i => i.category === 'color').length,
    layer: inventory.filter(i => i.category === 'layer').length,
    accessory: inventory.filter(i => i.category === 'accessory').length,
    design: inventory.filter(i => i.category === 'design').length
  };

  document.getElementById('homeStatColors').innerText = counts.color;
  document.getElementById('homeStatLayers').innerText = counts.layer;
  document.getElementById('homeStatAccessories').innerText = counts.accessory;
  document.getElementById('homeStatDesigns').innerText = counts.design;
}
