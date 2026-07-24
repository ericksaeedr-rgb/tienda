const STORAGE_KEY = 'catalogo-productos-v1';
const productForm = document.getElementById('productForm');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const productCategoryInput = document.getElementById('productCategory');
const productDescInput = document.getElementById('productDesc');
const productImageInput = document.getElementById('productImage');
const imageFileName = document.getElementById('imageFileName');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const productsGrid = document.getElementById('productsGrid');
const productsCount = document.getElementById('productsCount');
const pdfDate = document.getElementById('pdfDate');
const pdfProductsList = document.getElementById('pdfProductsList');
const pdfTemplate = document.getElementById('pdfTemplate');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

let products = loadProducts();
let currentImageDataUrl = '';

function loadProducts() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.warn('No se pudieron cargar los productos:', error);
        return [];
    }
}

function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function init() {
    productForm.addEventListener('submit', handleSubmit);
    productImageInput.addEventListener('change', handleImageSelection);
    downloadPdfBtn.addEventListener('click', exportCatalogToPdf);
    render();
}

function handleImageSelection(event) {
    const file = event.target.files[0];

    if (!file) {
        resetImagePreview();
        return;
    }

    imageFileName.textContent = file.name;

    const reader = new FileReader();
    reader.onload = function () {
        currentImageDataUrl = reader.result;
        imagePreview.src = reader.result;
        imagePreviewContainer.style.display = 'block';
    };

    reader.readAsDataURL(file);
}

function resetImagePreview() {
    currentImageDataUrl = '';
    imagePreview.removeAttribute('src');
    imagePreviewContainer.style.display = 'none';
    imageFileName.textContent = 'Sin archivo';
    productImageInput.value = '';
}

function handleSubmit(event) {
    event.preventDefault();

    const name = productNameInput.value.trim();
    const price = Number(productPriceInput.value);
    const category = productCategoryInput.value.trim();
    const description = productDescInput.value.trim();

    if (!name || !category || !description || !productPriceInput.value) {
        alert('Completa todos los campos del producto antes de guardar.');
        return;
    }

    if (!Number.isFinite(price) || price <= 0) {
        alert('El precio debe ser un número mayor a cero.');
        return;
    }

    const newProduct = {
        id: crypto.randomUUID ? crypto.randomUUID() : `product-${Date.now()}`,
        name,
        price,
        category,
        description,
        image: currentImageDataUrl
    };

    products.unshift(newProduct);
    saveProducts();
    render();
    productForm.reset();
    resetImagePreview();
}

function render() {
    updateCount();
    renderCatalog();
    renderPdfTemplate();
}

function updateCount() {
    const label = products.length === 1 ? 'producto' : 'productos';
    productsCount.textContent = `${products.length} ${label}`;
}

function renderCatalog() {
    if (!products.length) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 12H16c-.5 0-.9-.4-1-.9L13.4 6.6c-.1-.5-.6-.9-1.1-.9H11c-.5 0-.9.4-1.1.9L8.4 11.1c-.1.5-.9-.9-1 .9H2.5"></path><path d="M22 13v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6"></path></svg>
                <h3>El catálogo está vacío</h3>
                <p>Usa el formulario lateral para añadir productos.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map((product) => `
        <article class="product-card">
            <div class="card-img-holder">
                ${product.image ? `<img src="${product.image}" alt="${escapeHtml(product.name)}">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#94a3b8;">Sin imagen</div>'}
                <span class="card-category">${escapeHtml(product.category)}</span>
            </div>
            <div class="card-body">
                <h4 class="card-title">${escapeHtml(product.name)}</h4>
                <p class="card-desc">${escapeHtml(product.description)}</p>
                <div class="card-footer">
                    <span class="card-price">₡${formatPrice(product.price)}</span>
                    <button type="button" class="btn-delete" data-id="${product.id}" aria-label="Eliminar producto">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    productsGrid.querySelectorAll('.btn-delete').forEach((button) => {
        button.addEventListener('click', () => deleteProduct(button.getAttribute('data-id')));
    });
}

function deleteProduct(productId) {
    products = products.filter((product) => product.id !== productId);
    saveProducts();
    render();
}

function renderPdfTemplate() {
    const currentDate = new Date();
    pdfDate.textContent = currentDate.toLocaleDateString('es-CR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    if (!products.length) {
        pdfProductsList.innerHTML = '<p class="pdf-empty">No hay productos para mostrar.</p>';
        return;
    }

    pdfProductsList.innerHTML = products.map((product) => `
        <div class="pdf-row-item">
            ${product.image ? `<img class="pdf-row-img" src="${product.image}" alt="${escapeHtml(product.name)}">` : '<div class="pdf-row-img pdf-row-img-placeholder">Sin imagen</div>'}
            <div class="pdf-row-body">
                <div class="pdf-row-top">
                    <div style="min-width:0;">
                        <div class="pdf-row-name">${escapeHtml(product.name)}</div>
                        <div class="pdf-row-cat">${escapeHtml(product.category)}</div>
                    </div>
                    <div class="pdf-row-price">₡${formatPrice(product.price)}</div>
                </div>
                <div class="pdf-row-desc">${escapeHtml(product.description)}</div>
            </div>
        </div>
    `).join('');
}

function exportCatalogToPdf() {
    if (!products.length) {
        alert('Agrega al menos un producto para generar el PDF.');
        return;
    }

    renderPdfTemplate();
    showPdfPreview();

    if (window.html2pdf) {
        window.html2pdf()
            .set({
                margin: [0.2, 0.2, 0.2, 0.2],
                filename: `catalogo-${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            })
            .from(pdfTemplate)
            .save()
            .finally(() => {
                hidePdfPreview();
            });
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = function () {
        window.html2pdf()
            .set({
                margin: [0.2, 0.2, 0.2, 0.2],
                filename: `catalogo-${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            })
            .from(pdfTemplate)
            .save()
            .finally(() => {
                hidePdfPreview();
            });
    };
    script.onerror = function () {
        window.print();
        setTimeout(hidePdfPreview, 1200);
    };
    document.head.appendChild(script);
}

function showPdfPreview() {
    document.body.classList.add('pdf-export-active');
    pdfTemplate.style.display = 'block';
    pdfTemplate.style.position = 'relative';
    pdfTemplate.style.left = 'auto';
    pdfTemplate.style.margin = '0 auto';
}

function hidePdfPreview() {
    document.body.classList.remove('pdf-export-active');
    pdfTemplate.style.display = 'none';
}

function formatPrice(value) {
    return Number(value).toLocaleString('es-CR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

document.addEventListener('DOMContentLoaded', init);
