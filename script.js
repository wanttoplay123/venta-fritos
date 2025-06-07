// Initial products data
const initialProducts = [
    { id: 1, name: 'Buñuelos', price: 2500, quantity: 0 },
    { id: 2, name: 'Deditos', price: 2500, quantity: 0 },
    { id: 3, name: 'Empanadas de maíz con carne', price: 2500, quantity: 0 },
    { id: 4, name: 'Empanadas con pollo', price: 3000, quantity: 0 },
    { id: 5, name: 'Empanadas Hawaiana', price: 3000, quantity: 0 },
    { id: 6, name: 'Empanadas trifásica', price: 3500, quantity: 0 },
    { id: 7, name: 'Arepa huevo', price: 3500, quantity: 0 },
    { id: 8, name: 'Quibes', price: 3500, quantity: 0 },
    { id: 9, name: 'Jugo', price: 1000, quantity: 0 },
    { id: 10, name: 'Cafe', price: 500, quantity: 0 }
];

// Application state
let products = [];
let editingProductId = null;

// DOM elements
const productsTableBody = document.getElementById('productsTableBody');
const addProductForm = document.getElementById('addProductForm');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const resetSalesBtn = document.getElementById('resetSalesBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmResetBtn = document.getElementById('confirmReset');
const cancelResetBtn = document.getElementById('cancelReset');

// Stats elements
const totalProductsEl = document.getElementById('totalProducts');
const totalItemsSoldEl = document.getElementById('totalItemsSold');
const totalRevenueEl = document.getElementById('totalRevenue');
const grandTotalEl = document.getElementById('grandTotal');
const totalItemsTextEl = document.getElementById('totalItemsText');

// Initialize application
function init() {
    loadProducts();
    renderProducts();
    updateStats();
    setupEventListeners();
}

// Load products from localStorage or use initial data
function loadProducts() {
    const savedProducts = localStorage.getItem('fritosProducts');
    if (savedProducts) {
        try {
            products = JSON.parse(savedProducts);
        } catch (error) {
            console.error('Error loading saved products:', error);
            products = [...initialProducts];
        }
    } else {
        products = [...initialProducts];
    }
}

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('fritosProducts', JSON.stringify(products));
}

// Setup event listeners
function setupEventListeners() {
    addProductForm.addEventListener('submit', handleAddProduct);
    resetSalesBtn.addEventListener('click', showResetConfirmation);
    confirmResetBtn.addEventListener('click', confirmResetSales);
    cancelResetBtn.addEventListener('click', hideResetConfirmation);
    
    // Close modal when clicking outside
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            hideResetConfirmation();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideResetConfirmation();
            cancelEdit();
        }
        // Quick add product with Ctrl+Enter
        if (e.ctrlKey && e.key === 'Enter') {
            if (productNameInput.value.trim() && productPriceInput.value.trim()) {
                handleAddProduct(new Event('submit'));
            }
        }
        // Focus on product name input with Ctrl+N
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            productNameInput.focus();
        }
    });
    
    // Add some visual feedback for interactions
    document.addEventListener('click', (e) => {
        if (e.target.matches('button')) {
            e.target.style.transform = 'scale(0.95)';
            setTimeout(() => {
                e.target.style.transform = '';
            }, 150);
        }
    });
}

// Handle add product form submission
function handleAddProduct(e) {
    e.preventDefault();
    
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    
    if (name && price > 0) {
        const newProduct = {
            id: Date.now(),
            name: name,
            price: price,
            quantity: 0
        };
        
        products.push(newProduct);
        saveProducts();
        renderProducts();
        updateStats();
        
        // Reset form
        productNameInput.value = '';
        productPriceInput.value = '';
        productNameInput.focus();
        
        // Add animation to new row
        setTimeout(() => {
            const newRow = document.querySelector(`[data-product-id="${newProduct.id}"]`);
            if (newRow) {
                newRow.classList.add('fade-in');
                smoothScrollTo(newRow);
            }
        }, 100);
    }
}

// Render products table
function renderProducts() {
    productsTableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = createProductRow(product);
        productsTableBody.appendChild(row);
    });
}

// Create product table row
function createProductRow(product) {
    const row = document.createElement('tr');
    row.setAttribute('data-product-id', product.id);
    
    const subtotal = product.price * product.quantity;
    
    row.innerHTML = `
        <td>
            <div class="product-name">${product.name}</div>
        </td>
        <td>
            ${editingProductId === product.id ? 
                `<div style="display: flex; align-items: center; gap: 10px;">
                    <input type="number" id="editPrice" value="${product.price}" min="0" step="100" 
                           style="width: 100px; padding: 8px; border: 2px solid #ff6b35; border-radius: 8px; font-weight: 600;">
                    <button onclick="saveEdit(${product.id})" class="btn-edit" style="padding: 8px;">
                        <i class="fas fa-check"></i>
                    </button>
                    <button onclick="cancelEdit()" class="btn-delete" style="padding: 8px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>` :
                `<div style="display: flex; align-items: center; gap: 10px;">
                    <span class="product-price">$${formatNumber(product.price)}</span>
                    <button onclick="startEdit(${product.id})" class="btn-edit" style="padding: 8px;">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>`
            }
        </td>
        <td>
            <div class="quantity-controls">
                <button onclick="actualizarVenta(${product.id}, -1)" class="btn-quantity minus">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="product-quantity">${product.quantity}</span>
                <button onclick="actualizarVenta(${product.id}, 1)" class="btn-quantity plus">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </td>
        <td>
            <span class="product-subtotal">$${formatNumber(subtotal)}</span>
        </td>
        <td>
            <div class="action-buttons">
                <button onclick="deleteProduct(${product.id})" class="btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Actualizar venta (incrementar o decrementar cantidad)
function actualizarVenta(productId, cambio) {
    const producto = products.find(p => p.id === productId);
    if (!producto) return;

    const nuevaCantidad = producto.quantity + cambio;
    if (nuevaCantidad < 0) return;

    producto.quantity = nuevaCantidad;
    saveProducts();
    renderProducts();
    updateStats();

    // Efecto visual
    const row = document.querySelector(`[data-product-id="${productId}"]`);
    if (row) {
        row.style.transform = 'scale(1.02)';
        row.style.background = cambio > 0 
            ? 'linear-gradient(135deg, rgba(67, 233, 123, 0.1), rgba(56, 249, 215, 0.1))' 
            : 'linear-gradient(135deg, rgba(255,200,100,0.1), rgba(255,150,50,0.1))';
        setTimeout(() => {
            row.style.transform = '';
            row.style.background = '';
        }, 300);
    }
}

// Delete product
function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        renderProducts();
        updateStats();
    }
}

// Start editing price
function startEdit(productId) {
    editingProductId = productId;
    renderProducts();
    
    // Focus on the edit input
    setTimeout(() => {
        const editInput = document.getElementById('editPrice');
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }, 100);
}

// Save edited price
function saveEdit(productId) {
    const editInput = document.getElementById('editPrice');
    const newPrice = parseFloat(editInput.value);
    
    if (newPrice > 0) {
        const product = products.find(p => p.id === productId);
        if (product) {
            product.price = newPrice;
            editingProductId = null;
            saveProducts();
            renderProducts();
            updateStats();
        }
    }
}

// Cancel editing
function cancelEdit() {
    editingProductId = null;
    renderProducts();
}

// Show reset confirmation modal
function showResetConfirmation() {
    confirmModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Hide reset confirmation modal
function hideResetConfirmation() {
    confirmModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Confirm reset sales
function confirmResetSales() {
    products.forEach(product => {
        product.quantity = 0;
    });
    
    saveProducts();
    renderProducts();
    updateStats();
    hideResetConfirmation();
    
    // Show success feedback
    resetSalesBtn.innerHTML = '<i class="fas fa-check"></i> ¡Reiniciado!';
    resetSalesBtn.style.background = 'linear-gradient(135deg, #43e97b, #38f9d7)';
    
    setTimeout(() => {
        resetSalesBtn.innerHTML = '<i class="fas fa-undo"></i> Reiniciar Ventas';
        resetSalesBtn.style.background = '';
    }, 2000);
}

// Update statistics
function updateStats() {
    const totalProducts = products.length;
    const totalItemsSold = products.reduce((sum, product) => sum + product.quantity, 0);
    const totalRevenue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    // Update stats
    totalProductsEl.textContent = totalProducts;
    totalItemsSoldEl.textContent = totalItemsSold;
    totalRevenueEl.textContent = `$${formatNumber(totalRevenue)}`;
    grandTotalEl.textContent = `$${formatNumber(totalRevenue)}`;
    
    totalItemsTextEl.textContent = `${totalItemsSold} items vendidos`;
}

// Smooth scroll to element
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });
}

// Format number with thousands separator
function formatNumber(num) {
    return num.toLocaleString('es-CO');
}

// Export functions for global access (needed for onclick handlers)
window.actualizarVenta = actualizarVenta;
window.deleteProduct = deleteProduct;
window.startEdit = startEdit;
window.saveEdit = saveEdit;
window.cancelEdit = cancelEdit;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);