/* ==========================================================================
   APP STATE & INITIAL DATA
   ========================================================================== */

// Safe solid SVG placeholders encoded for local use (CORS safe, no internet required)
const DEFAULT_PRODUCTS = [
    {
        id: "prod-1",
        name: "Mochila Voyager Tech",
        description: "Mochila impermeable con compartimento acolchado para laptop de 16 pulgadas y puerto de carga USB.",
        price: 45000,
        category: "Accesorios",
        image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nIzYzNjZmMScvPjx0ZXh0IHg9JzUwJScgeT0nNTUlJyBmaWxsPSd3aGl0ZScgZm9udC1mYW1pbHk9J3NhbnMtc2VyaWYnIGZvbnQtc2l6ZT0nMTEnIGZvbnQtd2VpZ2h0PSdib2xkJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJz5Nb2NoaWxhPC90ZXh0Pjwvc3ZnPg=="
    },
    {
        id: "prod-2",
        name: "Audífonos ANC Studio Pro",
        description: "Audífonos inalámbricos de diadema con cancelación activa de ruido híbrida y autonomía de 40 horas.",
        price: 75000,
        category: "Electrónica",
        image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nIzEwYjk4MScvPjx0ZXh0IHg9JzUwJScgeT0nNTUlJyBmaWxsPSd3aGl0ZScgZm9udC1mYW1pbHk9J3NhbnMtc2VyaWYnIGZvbnQtc2l6ZT0nMTEnIGZvbnQtd2VpZ2h0PSdib2xkJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJz5BdWRpZm9ub3M8L3RleHQ+PC9zdmc+"
    },
    {
        id: "prod-3",
        name: "Reloj Cronógrafo Stellar",
        description: "Reloj de pulsera con movimiento de cuarzo japonés, correa de cuero genuino y resistencia al agua.",
        price: 92000,
        category: "Accesorios",
        image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI2Y1OWUwYicvPjx0ZXh0IHg9JzUwJScgeT0nNTUlJyBmaWxsPSd3aGl0ZScgZm9udC1mYW1pbHk9J3NhbnMtc2VyaWYnIGZvbnQtc2l6ZT0nMTEnIGZvbnQtd2VpZ2h0PSdib2xkJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJz5SZWxvajwvdGV4dD48L3N2Zz4="
    }
];

let products = [];
let tempProductImageBase64 = "";

// ==========================================================================
// DOM ELEMENTS CACHE
// ==========================================================================
const DOM = {
    // Form Inputs
    productForm: document.getElementById('productForm'),
    productName: document.getElementById('productName'),
    productPrice: document.getElementById('productPrice'),
    productCategory: document.getElementById('productCategory'),
    productDesc: document.getElementById('productDesc'),
    productImage: document.getElementById('productImage'),
    imageFileName: document.getElementById('imageFileName'),
    imagePreviewContainer: document.getElementById('imagePreviewContainer'),
    imagePreview: document.getElementById('imagePreview'),
    
    // Catalog Views
    productsCount: document.getElementById('productsCount'),
    productsGrid: document.getElementById('productsGrid'),
    downloadPdfBtn: document.getElementById('downloadPdfBtn'),
    
    // PDF elements
    pdfTemplate: document.getElementById('pdfTemplate'),
    pdfDate: document.getElementById('pdfDate'),
    pdfProductsList: document.getElementById('pdfProductsList')
};

// ==========================================================================
// PERSISTENCE & UTILITIES
// ==========================================================================

const loadStoreData = () => {
    try {
        const storedProducts = localStorage.getItem('ultra_offline_products');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
        } else {
            products = DEFAULT_PRODUCTS;
            localStorage.setItem('ultra_offline_products', JSON.stringify(products));
        }
    } catch (e) {
        console.error("Localstorage load error.", e);
        products = DEFAULT_PRODUCTS;
    }
};

const saveProducts = () => {
    localStorage.setItem('ultra_offline_products', JSON.stringify(products));
    renderCatalog();
};

// Costa Rican Colón Formatter (₡)
const formatPrice = (price) => {
    return `₡${Number(price).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Canvas local file compressor to avoid storage limit issues
const handleImageCompression = (file, maxWidth, maxHeight, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Output as compressed JPEG
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            callback(compressedBase64);
        };
    };
};

// ==========================================================================
// RENDERING
// ==========================================================================

const renderCatalog = () => {
    DOM.productsCount.innerText = `${products.length} productos`;

    if (products.length === 0) {
        DOM.productsGrid.innerHTML = `
            <div class="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 12H16c-.5 0-.9-.4-1-.9L13.4 6.6c-.1-.5-.6-.9-1.1-.9H11c-.5 0-.9.4-1.1.9L8.4 11.1c-.1.5-.5.9-1 .9H2.5"></path><path d="M22 13v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6"></path></svg>
                <h3>El catálogo está vacío</h3>
                <p>Usa el formulario lateral para añadir productos.</p>
            </div>
        `;
        return;
    }

    DOM.productsGrid.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="card-img-holder">
                ${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted);"><i class="fa-solid fa-image" style="font-size:2rem"></i></div>`}
                <span class="card-category">${p.category}</span>
            </div>
            <div class="card-body">
                <h4 class="card-title" title="${p.name}">${p.name}</h4>
                <p class="card-desc">${p.description}</p>
                <div class="card-footer">
                    <span class="card-price">${formatPrice(p.price)}</span>
                    <button class="btn-delete" data-id="${p.id}" title="Eliminar Producto">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Attach delete handlers
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            deleteProduct(id);
        });
    });
};

// ==========================================================================
// CORE CRUD ACTIONS
// ==========================================================================

const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const name = DOM.productName.value.trim();
    const price = parseFloat(DOM.productPrice.value);
    const category = DOM.productCategory.value.trim();
    const description = DOM.productDesc.value.trim();
    
    let imageSrc = tempProductImageBase64;
    
    // Default placeholder SVG if no image is uploaded (encoded to Base64 to prevent canvas issues)
    if (!imageSrc) {
        const randomColorHexs = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        const randColor = randomColorHexs[Math.floor(Math.random() * randomColorHexs.length)];
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${randColor}"/><text x="50%" y="55%" fill="white" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${category.substring(0, 10)}</text></svg>`;
        imageSrc = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    }
    
    const newProduct = {
        id: 'prod-' + Date.now(),
        name,
        price,
        category,
        description,
        image: imageSrc
    };
    
    products.push(newProduct);
    saveProducts();
    resetForm();
};

const deleteProduct = (id) => {
    if (confirm("¿Deseas eliminar este producto del catálogo?")) {
        products = products.filter(p => p.id !== id);
        saveProducts();
    }
};

const resetForm = () => {
    DOM.productForm.reset();
    DOM.imagePreviewContainer.style.display = "none";
    DOM.imageFileName.innerText = "Sin archivo";
    tempProductImageBase64 = "";
};

// ==========================================================================
// OFFLINE PDF GENERATOR
// ==========================================================================

const exportCatalogPdf = () => {
    // Check if local html2pdf library was loaded successfully
    if (typeof html2pdf === 'undefined') {
        alert("Error de conexión local: No se encontró la librería 'html2pdf.bundle.min.js' en la carpeta del proyecto. Por favor, verifica que el archivo descargado se encuentre junto a index.html.");
        return;
    }

    if (products.length === 0) {
        alert("El catálogo está vacío. Agrega productos antes de exportar.");
        return;
    }

    // Set Dynamic Date
    DOM.pdfDate.innerText = new Date().toLocaleDateString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Populate PDF List Elements
    DOM.pdfProductsList.innerHTML = products.map(p => {
        // If image exists, render it. If not, render a text-based safe placeholder "Sin Foto" to prevent blank pages or CORS SVG errors.
        const imageHtml = p.image 
            ? `<img src="${p.image}" class="pdf-row-img">` 
            : `<div class="pdf-row-img" style="display:flex;align-items:center;justify-content:center;background-color:#f1f5f9;color:#94a3b8;font-size:0.65rem;font-weight:bold;">Sin Foto</div>`;
            
        return `
            <div class="pdf-row-item">
                ${imageHtml}
                <div class="pdf-row-body">
                    <div class="pdf-row-top">
                        <h4 class="pdf-row-name">${p.name}</h4>
                        <span class="pdf-row-cat">${p.category}</span>
                    </div>
                    <p class="pdf-row-desc">${p.description}</p>
                    <span class="pdf-row-price">${formatPrice(p.price)}</span>
                </div>
            </div>
        `;
    }).join('');

    // Clone the PDF template element to avoid showing it on-screen and to prevent z-index/fixed bugs
    const originalPdfEl = DOM.pdfTemplate;
    const pdfClone = originalPdfEl.cloneNode(true);
    
    // Style the clone so it's fully visible/layouted by the browser but positioned off-screen
    pdfClone.style.display = "block";
    pdfClone.style.position = "absolute";
    pdfClone.style.left = "-9999px";
    pdfClone.style.top = "0";
    pdfClone.style.visibility = "visible";
    pdfClone.style.opacity = "1";
    
    // Append to body so html2pdf can access its styles and scroll boundaries
    document.body.appendChild(pdfClone);

    const opt = {
        margin:       10,
        filename:     'Catalogo-Productos-CR.pdf',
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Run compiler on the cloned element, and clean it up afterwards
    html2pdf().from(pdfClone).set(opt).save().then(() => {
        // Remove the clone from the DOM
        pdfClone.remove();
    }).catch(err => {
        console.error("PDF engine crash", err);
        pdfClone.remove();
        alert("Ocurrió un error inesperado al compilar el PDF de forma local.");
    });
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================

const init = () => {
    loadStoreData();
    renderCatalog();

    // Listeners
    DOM.productForm.addEventListener('submit', handleFormSubmit);
    DOM.downloadPdfBtn.addEventListener('click', exportCatalogPdf);

    DOM.productImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            DOM.imageFileName.innerText = file.name;
            // Compress image to save localstorage memory
            handleImageCompression(file, 400, 400, (base64) => {
                tempProductImageBase64 = base64;
                DOM.imagePreview.src = base64;
                DOM.imagePreviewContainer.style.display = "block";
            });
        }
    });

    // Handle file trigger button click
    document.querySelectorAll('.btn-upload-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.currentTarget.parentElement.querySelector('input[type="file"]');
            if (input) input.click();
        });
    });
};

window.addEventListener('DOMContentLoaded', init);
