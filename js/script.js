// Основной JavaScript для всех страниц
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация хранилища данных
    initStorage();
    
    // Общие функции для всех страниц
    if (document.getElementById('products-count')) {
        animateCounters();
    }
    
    setupModals();
    setupFilters();
    
    // Загрузка данных для текущей страницы
    loadPageData();
    
    // Назначение обработчиков для всех кнопок
    setupAllButtons();
});

// Инициализация хранилища
function initStorage() {
    if (!localStorage.getItem('warehouseData')) {
        const initialData = {
            products: [],
            inventories: [],
            suppliers: [],
            orders: [],
            nextProductId: 1001,
            nextInventoryId: 1,
            nextSupplierId: 1,
            nextOrderId: 1001
        };
        localStorage.setItem('warehouseData', JSON.stringify(initialData));
    }
}

// Назначение обработчиков для всех кнопок
function setupAllButtons() {
    // Кнопка "Начать работу" на главной
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            window.location.href = 'products.html';
        });
    }
    
    // Кнопки пагинации
    document.querySelectorAll('.btn-pagination').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Пагинация: Переход на страницу ' + this.textContent);
            document.querySelectorAll('.btn-pagination').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Кнопки "Подробнее" в инвентаризации
    document.querySelectorAll('.card-actions .btn-secondary').forEach(btn => {
        if (btn.getAttribute('data-id')) {
            btn.addEventListener('click', function() {
                const inventoryId = this.getAttribute('data-id');
                alert('Просмотр деталей инвентаризации #' + inventoryId);
            });
        }
    });
    
    // Кнопки "Отчет" в инвентаризации
    document.querySelectorAll('.card-actions .btn-secondary:not([data-id])').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Генерация отчета по инвентаризации');
        });
    });
    
    // Кнопки "Просмотр" в заказах
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            alert('Просмотр деталей заказа #' + orderId);
        });
    });
}

// Загрузка данных для текущей страницы
function loadPageData() {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    
    // Загрузка товаров
    if (document.getElementById('products-table-body')) {
        renderProducts(data.products);
    }
    
    // Загрузка инвентаризаций
    if (document.getElementById('current-inventories')) {
        renderInventories(data.inventories);
        renderInventoryHistory(data.inventories);
    }
    
    // Загрузка поставщиков
    if (document.getElementById('suppliers-list')) {
        renderSuppliers(data.suppliers);
        renderOrders(data.orders, data.suppliers);
    }
    
    // Обновление счетчиков на главной
    if (document.getElementById('products-count')) {
        updateCounters(data);
    }
}

// Обновление счетчиков на главной странице
function updateCounters(data) {
    document.getElementById('products-count').textContent = data.products.length;
    document.getElementById('suppliers-count').textContent = data.suppliers.length;
}

// ========== ТОВАРЫ ==========
function renderProducts(products) {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>${product.unit}</td>
            <td>${product.price.toLocaleString('ru-RU')} ₽</td>
            <td>
                <button class="btn btn-action btn-edit" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-action btn-delete" data-id="${product.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Обработчики для кнопок редактирования и удаления
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
}

function addProduct(product) {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    product.id = data.nextProductId++;
    data.products.push(product);
    localStorage.setItem('warehouseData', JSON.stringify(data));
    renderProducts(data.products);
    updateCounters(data);
}

function editProduct(productId) {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    const product = data.products.find(p => p.id === productId);
    
    if (!product) return;
    
    const modal = document.getElementById('add-product-modal');
    const form = document.getElementById('product-form');
    
    // Заполняем форму данными товара
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-quantity').value = product.quantity;
    document.getElementById('product-unit').value = product.unit;
    document.getElementById('product-price').value = product.price;
    
    // Изменяем заголовок и обработчик формы
    modal.querySelector('h2').textContent = 'Редактировать товар';
    
    // Удаляем старый обработчик, если есть
    const oldForm = form.cloneNode(true);
    form.parentNode.replaceChild(oldForm, form);
    
    oldForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Обновляем данные товара
        product.name = document.getElementById('product-name').value;
        product.category = document.getElementById('product-category').value;
        product.quantity = parseInt(document.getElementById('product-quantity').value);
        product.unit = document.getElementById('product-unit').value;
        product.price = parseFloat(document.getElementById('product-price').value);
        
        localStorage.setItem('warehouseData', JSON.stringify(data));
        renderProducts(data.products);
        modal.style.display = 'none';
        
        // Восстанавливаем исходную форму
        const newForm = oldForm.cloneNode(true);
        oldForm.parentNode.replaceChild(newForm, oldForm);
        setupProductForm(newForm);
    });
    
    modal.style.display = 'flex';
}

function deleteProduct(productId) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    data.products = data.products.filter(p => p.id !== productId);
    localStorage.setItem('warehouseData', JSON.stringify(data));
    renderProducts(data.products);
    updateCounters(data);
}

function setupProductForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newProduct = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            quantity: parseInt(document.getElementById('product-quantity').value),
            unit: document.getElementById('product-unit').value,
            price: parseFloat(document.getElementById('product-price').value)
        };
        
        addProduct(newProduct);
        this.reset();
        document.getElementById('add-product-modal').style.display = 'none';
    });
}

// ========== ИНВЕНТАРИЗАЦИЯ ==========
function renderInventories(inventories) {
    const container = document.getElementById('current-inventories');
    if (!container) return;
    
    container.innerHTML = '';
    
    inventories.filter(inv => inv.status !== "Завершена").forEach(inventory => {
        const card = document.createElement('div');
        card.className = 'inventory-card';
        
        let progress = '';
        if (inventory.status === "В процессе") {
            progress = `<p><strong>Товаров:</strong> ${inventory.completedItems}/${inventory.items}</p>`;
        } else {
            progress = `<p><strong>Товаров:</strong> ${inventory.items}</p>`;
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3>Инвентаризация #${inventory.id}</h3>
                <span class="status-badge status-${getStatusClass(inventory.status)}">${inventory.status}</span>
            </div>
            <div class="card-body">
                <p><strong>Дата начала:</strong> ${inventory.date}</p>
                <p><strong>Ответственный:</strong> ${inventory.responsible}</p>
                ${progress}
            </div>
            <div class="card-actions">
                ${inventory.status === "Запланирована" ? 
                    '<button class="btn btn-primary btn-sm" data-id="' + inventory.id + '">Начать</button>' : 
                    '<button class="btn btn-primary btn-sm" data-id="' + inventory.id + '">Продолжить</button>'}
                <button class="btn btn-secondary btn-sm" data-id="${inventory.id}">Подробнее</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Обработчики кнопок "Начать/Продолжить"
    document.querySelectorAll('.card-actions .btn-primary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const inventoryId = parseInt(e.currentTarget.getAttribute('data-id'));
            startInventory(inventoryId);
        });
    });
}

function renderInventoryHistory(inventories) {
    const tbody = document.getElementById('inventory-history');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    inventories.filter(inv => inv.status === "Завершена").forEach(inventory => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${inventory.id}</td>
            <td>${inventory.date}</td>
            <td>${inventory.responsible}</td>
            <td>${inventory.items}</td>
            <td>${inventory.discrepancies}</td>
            <td><span class="status-badge status-completed">Завершена</span></td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusClass(status) {
    const statusMap = {
        "Запланирована": "planned",
        "В процессе": "in-progress",
        "Завершена": "completed",
        "Доставлен": "delivered",
        "В пути": "in-transit",
        "Обработка": "processing"
    };
    return statusMap[status] || "";
}

function startInventory(inventoryId) {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    const inventory = data.inventories.find(inv => inv.id === inventoryId);
    
    if (inventory) {
        inventory.status = "В процессе";
        if (!inventory.completedItems) {
            inventory.completedItems = 0;
        }
        localStorage.setItem('warehouseData', JSON.stringify(data));
        renderInventories(data.inventories);
    }
}

function addInventory() {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    const newInventory = {
        id: data.nextInventoryId++,
        date: new Date().toLocaleDateString('ru-RU'),
        responsible: "Иванов И.И.",
        items: data.products.length,
        discrepancies: 0,
        status: "Запланирована",
        completedItems: 0
    };
    
    data.inventories.push(newInventory);
    localStorage.setItem('warehouseData', JSON.stringify(data));
    renderInventories(data.inventories);
    renderInventoryHistory(data.inventories);
}
// ========== ИНВЕНТАРИЗАЦИЯ ==========
function renderInventories(inventories) {
    const container = document.getElementById('current-inventories');
    if (!container) return;
    
    container.innerHTML = '';
    
    inventories.filter(inv => inv.status !== "Завершена").forEach(inventory => {
        const card = document.createElement('div');
        card.className = 'inventory-card';
        
        let progress = '';
        if (inventory.status === "В процессе") {
            progress = `<p><strong>Товаров:</strong> ${inventory.completedItems}/${inventory.items}</p>`;
        } else {
            progress = `<p><strong>Товаров:</strong> ${inventory.items}</p>`;
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3>Инвентаризация #${inventory.id}</h3>
                <span class="status-badge status-${getStatusClass(inventory.status)}">${inventory.status}</span>
            </div>
            <div class="card-body">
                <p><strong>Дата начала:</strong> ${inventory.date}</p>
                <p><strong>Ответственный:</strong> ${inventory.responsible}</p>
                ${progress}
            </div>
            <div class="card-actions">
                ${inventory.status === "Запланирована" ? 
                    '<button class="btn btn-primary btn-sm btn-start" data-id="' + inventory.id + '">Начать</button>' : 
                    '<button class="btn btn-primary btn-sm btn-continue" data-id="' + inventory.id + '">Продолжить</button>'}
                ${inventory.status === "В процессе" ? 
                    '<button class="btn btn-success btn-sm btn-complete" data-id="' + inventory.id + '">Завершить</button>' : ''}
                <button class="btn btn-secondary btn-sm btn-details" data-id="${inventory.id}">Подробнее</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Обработчики кнопок
    document.querySelectorAll('.btn-start').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const inventoryId = parseInt(e.currentTarget.getAttribute('data-id'));
            startInventory(inventoryId);
        });
    });
    
    document.querySelectorAll('.btn-continue').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const inventoryId = parseInt(e.currentTarget.getAttribute('data-id'));
            continueInventory(inventoryId);
        });
    });
    
    document.querySelectorAll('.btn-complete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const inventoryId = parseInt(e.currentTarget.getAttribute('data-id'));
            completeInventory(inventoryId);
        });
    });
    
    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const inventoryId = parseInt(e.currentTarget.getAttribute('data-id'));
            showInventoryDetails(inventoryId);
        });
    });
}

function startInventory(inventoryId) {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    const inventory = data.inventories.find(inv => inv.id === inventoryId);
    
    if (inventory) {
        inventory.status = "В процессе";
        inventory.completedItems = 0;
        localStorage.setItem('warehouseData', JSON.stringify(data));
        renderInventories(data.inventories);
        renderInventoryHistory(data.inventories);
    }
}

function continueInventory(inventoryId) {
    // Здесь можно добавить логику для продолжения инвентаризации
    alert('Продолжение инвентаризации #' + inventoryId);
}

function completeInventory(inventoryId) {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    const inventory = data.inventories.find(inv => inv.id === inventoryId);
    
    if (inventory) {
        inventory.status = "Завершена";
        inventory.completedItems = inventory.items; // Все товары проверены
        inventory.discrepancies = Math.floor(Math.random() * 5); // Случайное количество расхождений для демонстрации
        localStorage.setItem('warehouseData', JSON.stringify(data));
        renderInventories(data.inventories);
        renderInventoryHistory(data.inventories);
    }
}

function showInventoryDetails(inventoryId) {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    const inventory = data.inventories.find(inv => inv.id === inventoryId);
    
    if (inventory) {
        alert(`Детали инвентаризации #${inventory.id}\n` +
              `Статус: ${inventory.status}\n` +
              `Дата: ${inventory.date}\n` +
              `Товаров: ${inventory.items}\n` +
              `Проверено: ${inventory.completedItems}\n` +
              `Расхождения: ${inventory.discrepancies || 0}`);
    }
}

function addInventory() {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    const newInventory = {
        id: data.nextInventoryId++,
        date: new Date().toLocaleDateString('ru-RU'),
        responsible: "Иванов И.И.",
        items: data.products.length,
        discrepancies: 0,
        status: "Запланирована",
        completedItems: 0
    };
    
    data.inventories.push(newInventory);
    localStorage.setItem('warehouseData', JSON.stringify(data));
    renderInventories(data.inventories);
    renderInventoryHistory(data.inventories);
}

// ========== ПОСТАВЩИКИ ==========
function renderSuppliers(suppliers) {
    const container = document.getElementById('suppliers-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    suppliers.forEach(supplier => {
        const card = document.createElement('div');
        card.className = 'supplier-card';
        card.innerHTML = `
            <div class="supplier-avatar">
                <i class="fas fa-building"></i>
            </div>
            <div class="supplier-info">
                <h3>${supplier.name}</h3>
                <p><i class="fas fa-phone"></i> ${supplier.phone}</p>
                <p><i class="fas fa-envelope"></i> ${supplier.email}</p>
                <p><i class="fas fa-boxes"></i> ${supplier.categories.join(", ")}</p>
            </div>
            <div class="supplier-actions">
                <button class="btn btn-action btn-edit" data-id="${supplier.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-action btn-delete" data-id="${supplier.id}"><i class="fas fa-trash"></i></button>
                <button class="btn btn-action btn-orders" data-id="${supplier.id}"><i class="fas fa-list"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Обработчики кнопок
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const supplierId = parseInt(e.currentTarget.getAttribute('data-id'));
            editSupplier(supplierId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const supplierId = parseInt(e.currentTarget.getAttribute('data-id'));
            deleteSupplier(supplierId);
        });
    });
    
    document.querySelectorAll('.btn-orders').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const supplierId = parseInt(e.currentTarget.getAttribute('data-id'));
            alert('Просмотр заказов поставщика #' + supplierId);
        });
    });
}

function renderOrders(orders, suppliers) {
    const tbody = document.getElementById('orders-list');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const supplier = suppliers.find(s => s.id === order.supplierId);
        const supplierName = supplier ? supplier.name : "Неизвестный поставщик";
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${supplierName}</td>
            <td>${order.date}</td>
            <td>${order.amount.toLocaleString('ru-RU')} ₽</td>
            <td><span class="status-badge status-${getStatusClass(order.status)}">${order.status}</span></td>
            <td>
                <button class="btn btn-action btn-view" data-id="${order.id}"><i class="fas fa-eye"></i></button>
                <button class="btn btn-action btn-delete" data-id="${order.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Обработчики кнопок удаления заказов
    document.querySelectorAll('#orders-list .btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-id'));
            deleteOrder(orderId);
        });
    });
}

function addSupplier(supplier) {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    supplier.id = data.nextSupplierId++;
    data.suppliers.push(supplier);
    localStorage.setItem('warehouseData', JSON.stringify(data));
    renderSuppliers(data.suppliers);
    updateCounters(data);
}

function editSupplier(supplierId) {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    const supplier = data.suppliers.find(s => s.id === supplierId);
    
    if (!supplier) return;
    
    const modal = document.getElementById('add-supplier-modal');
    const form = document.getElementById('supplier-form');
    
    // Заполняем форму данными поставщика
    document.getElementById('supplier-name').value = supplier.name;
    document.getElementById('supplier-contact').value = supplier.contact;
    document.getElementById('supplier-phone').value = supplier.phone;
    document.getElementById('supplier-email').value = supplier.email;
    document.getElementById('supplier-address').value = supplier.address;
    
    // Выбираем категории
    const categorySelect = document.getElementById('supplier-categories');
    Array.from(categorySelect.options).forEach(option => {
        option.selected = supplier.categories.includes(option.value);
    });
    
    // Изменяем заголовок и обработчик формы
    modal.querySelector('h2').textContent = 'Редактировать поставщика';
    
    // Удаляем старый обработчик, если есть
    const oldForm = form.cloneNode(true);
    form.parentNode.replaceChild(oldForm, form);
    
    oldForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Обновляем данные поставщика
        supplier.name = document.getElementById('supplier-name').value;
        supplier.contact = document.getElementById('supplier-contact').value;
        supplier.phone = document.getElementById('supplier-phone').value;
        supplier.email = document.getElementById('supplier-email').value;
        supplier.address = document.getElementById('supplier-address').value;
        
        // Обновляем категории
        supplier.categories = Array.from(document.getElementById('supplier-categories').selectedOptions)
            .map(option => option.value);
        
        localStorage.setItem('warehouseData', JSON.stringify(data));
        renderSuppliers(data.suppliers);
        modal.style.display = 'none';
        
        // Восстанавливаем исходную форму
        const newForm = oldForm.cloneNode(true);
        oldForm.parentNode.replaceChild(newForm, oldForm);
        setupSupplierForm(newForm);
    });
    
    modal.style.display = 'flex';
}

function deleteSupplier(supplierId) {
    if (!confirm('Вы уверены, что хотите удалить этого поставщика? Все связанные заказы также будут удалены.')) return;
    
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    
    // Удаляем поставщика
    data.suppliers = data.suppliers.filter(s => s.id !== supplierId);
    
    // Удаляем связанные заказы
    data.orders = data.orders.filter(o => o.supplierId !== supplierId);
    
    localStorage.setItem('warehouseData', JSON.stringify(data));
    renderSuppliers(data.suppliers);
    renderOrders(data.orders, data.suppliers);
    updateCounters(data);
}

function deleteOrder(orderId) {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return;
    
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    data.orders = data.orders.filter(o => o.id !== orderId);
    localStorage.setItem('warehouseData', JSON.stringify(data));
    renderOrders(data.orders, data.suppliers);
}

function setupSupplierForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const categories = Array.from(document.getElementById('supplier-categories').selectedOptions)
            .map(option => option.value);
        
        const newSupplier = {
            name: document.getElementById('supplier-name').value,
            contact: document.getElementById('supplier-contact').value,
            phone: document.getElementById('supplier-phone').value,
            email: document.getElementById('supplier-email').value,
            categories: categories,
            address: document.getElementById('supplier-address').value
        };
        
        addSupplier(newSupplier);
        this.reset();
        document.getElementById('add-supplier-modal').style.display = 'none';
    });
}

// ========== ОБЩИЕ ФУНКЦИИ ==========
function animateCounters() {
    const data = JSON.parse(localStorage.getItem('warehouseData'));
    updateCounters(data);
    
    const productsCount = document.getElementById('products-count');
    const suppliersCount = document.getElementById('suppliers-count');
    
    animateCounter(productsCount, 0, data.products.length, 1500);
    animateCounter(suppliersCount, 0, data.suppliers.length, 1500);
}

function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
    element.classList.add('count-up');
}

function setupModals() {
    // Модальное окно добавления товара
    const addProductBtn = document.getElementById('add-product-btn');
    const addProductModal = document.getElementById('add-product-modal');
    
    if (addProductBtn && addProductModal) {
        addProductBtn.addEventListener('click', () => {
            addProductModal.querySelector('h2').textContent = 'Добавить новый товар';
            addProductModal.style.display = 'flex';
        });
        
        const form = document.getElementById('product-form');
        setupProductForm(form);
    }
    
    // Модальное окно добавления поставщика
    const addSupplierBtn = document.getElementById('add-supplier-btn');
    const addSupplierModal = document.getElementById('add-supplier-modal');
    
    if (addSupplierBtn && addSupplierModal) {
        addSupplierBtn.addEventListener('click', () => {
            addSupplierModal.querySelector('h2').textContent = 'Добавить нового поставщика';
            addSupplierModal.style.display = 'flex';
        });
        
        const form = document.getElementById('supplier-form');
        setupSupplierForm(form);
    }
    
    // Кнопка "Новая инвентаризация"
    const newInventoryBtn = document.getElementById('new-inventory-btn');
    if (newInventoryBtn) {
        newInventoryBtn.addEventListener('click', addInventory);
    }
    
    // Закрытие модальных окон
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
            
            // Восстанавливаем исходные формы
            if (modal.id === 'add-product-modal') {
                const form = document.getElementById('product-form');
                const newForm = form.cloneNode(true);
                form.parentNode.replaceChild(newForm, form);
                setupProductForm(newForm);
            }
            
            if (modal.id === 'add-supplier-modal') {
                const form = document.getElementById('supplier-form');
                const newForm = form.cloneNode(true);
                form.parentNode.replaceChild(newForm, form);
                setupSupplierForm(newForm);
            }
        });
    });
    
    // Закрытие при клике вне модального окна
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                
                // Восстанавливаем исходные формы
                if (modal.id === 'add-product-modal') {
                    const form = document.getElementById('product-form');
                    const newForm = form.cloneNode(true);
                    form.parentNode.replaceChild(newForm, form);
                    setupProductForm(newForm);
                }
                
                if (modal.id === 'add-supplier-modal') {
                    const form = document.getElementById('supplier-form');
                    const newForm = form.cloneNode(true);
                    form.parentNode.replaceChild(newForm, form);
                    setupSupplierForm(newForm);
                }
            }
        });
    });
}

function setupFilters() {
    // Фильтр статусов на странице инвентаризации
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const status = this.value;
            const cards = document.querySelectorAll('.inventory-card');
            
            cards.forEach(card => {
                const cardStatus = card.querySelector('.status-badge').textContent;
                if (status === 'Все статусы' || cardStatus === status) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Поиск на странице товаров
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.products-table tbody tr');
            
            rows.forEach(row => {
                const productName = row.cells[1].textContent.toLowerCase();
                if (productName.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}