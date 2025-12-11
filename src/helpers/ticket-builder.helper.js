const ReceiptPrinterEncoder = require('@point-of-sale/receipt-printer-encoder');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

/**
 * Construye la sección del encabezado del establecimiento
 * @param {Object} encoder - Instancia del encoder
 * @param {Object} establishment - Información del establecimiento
 * @returns {Object} encoder actualizado
 */
const buildEstablishmentSection = (encoder, establishment) => {
    let ticketEncoder = encoder
        .align('center')
        .font('A')
        .bold(true)
        .size(2, 2)
        .line(establishment.name)
        .size(1, 1)
        .bold(false)
        .line(`NIT: ${establishment.nit}`)
        .line(`CEL/WhatsApp: ${establishment.phone}`);
    
    // Solo agregar email si existe
    if (establishment.email) {
        ticketEncoder = ticketEncoder.line(establishment.email);
    }
    
    return ticketEncoder.line(establishment.address);
};

/**
 * Construye la sección de metadatos (fecha, usuario, artículos)
 * @param {Object} encoder - Instancia del encoder
 * @param {Object} metadata - Metadatos del ticket
 * @returns {Object} encoder actualizado
 */
const buildMetadataSection = (encoder, metadata) => {
    let ticketEncoder = encoder
        .align('left')
        .rule()
        .line(`${metadata.date} - ${metadata.time}`)
        .line(`Atendido por: ${metadata.waiter}`)
        .line(`Artículos entregados: ${metadata.totalArticles}`);
    
    // Solo mostrar observaciones si existen
    if (metadata.observations) {
        ticketEncoder = ticketEncoder.line(`Observaciones: ${metadata.observations}`);
    }
    
    return ticketEncoder.newline();
};

/**
 * Construye el encabezado de la tabla de productos
 * @param {Object} encoder - Instancia del encoder
 * @returns {Object} encoder actualizado
 */
const buildProductsTableHeader = (encoder) => {
    return encoder
        .align('left')
        .table(
            [
                { width: 22, align: 'left' },
                { width: 3,  align: 'center' },
                { width: 11,  align: 'right' },
                { width: 12,  align: 'right' }
            ],
            [
                [
                    (encoder) => encoder.bold(true).text('Producto').bold(false),
                    (encoder) => encoder.bold(true).text('CT').bold(false),
                    (encoder) => encoder.bold(true).text('Unit').bold(false),
                    (encoder) => encoder.bold(true).text('Total').bold(false)
                ],
                [
                    (encoder) => encoder.rule(),
                    (encoder) => encoder.rule(),
                    (encoder) => encoder.rule(),
                    (encoder) => encoder.rule()
                ]
            ]
        );
};

/**
 * Construye la sección de productos
 * @param {Object} encoder - Instancia del encoder
 * @param {Array} products - Lista de productos
 * @returns {Object} encoder actualizado
 */
const buildProductsSection = (encoder, products) => {
    let ticketEncoder = encoder;
    
    products.forEach(product => {
        // Formatear valores
        const quantity = `x${product.quantity}`;
        const unitPrice = `$${product.unitPrice.toLocaleString('es-CO')}`;
        const total = `$${product.total.toLocaleString('es-CO')}`;

        // Tabla con información del producto
        ticketEncoder = ticketEncoder
            .table(
                [
                    { width: 22, align: 'left' },
                    { width: 3,  align: 'center' },
                    { width: 11,  align: 'right' },
                    { width: 12,  align: 'right' }
                ],
                [
                    [ product.name, quantity, unitPrice, total ]
                ]
            );

        // Solo mostrar nota si existe
        if (product.note) {
            ticketEncoder = ticketEncoder
                .font('B')
                .line(`> ${product.note}`)
                .font('A');
        }

        ticketEncoder = ticketEncoder.newline();
    });
    
    return ticketEncoder;
};

/**
 * Construye la sección del total
 * @param {Object} encoder - Instancia del encoder
 * @param {Number} total - Total de la venta
 * @returns {Object} encoder actualizado
 */
const buildTotalSection = (encoder, total) => {
    const formattedTotal = `$${total.toLocaleString('es-CO')}`;
    
    return encoder
        .rule()
        .align('right')
        .bold(true)
        .size(2, 2)
        .line(`TOTAL: ${formattedTotal}`)
        .size(1, 1)
        .bold(false)
        .newline();
};

/**
 * Construye la sección del footer (agradecimiento y créditos)
 * @param {Object} encoder - Instancia del encoder
 * @returns {Object} encoder actualizado
 */
const buildFooterSection = (encoder) => {
    return encoder
        .align('center')
        .size(1, 2)
        .line('¡Gracias por su compra!')
        .size(1, 1)
        .newline()
        .qrcode('https://drive.google.com/file/d/1eYZ00-DQhBOzc60ecx4m5XN7uR7IMRY2/view?usp=sharing', { size: 4 })
        .newline()
        .align('center')
        .font('A')
        .bold(true)
        .line('Desarrollado por: sisinpos.com')
        .bold(false);
};

/**
 * Construye el ticket completo
 * @param {Object} ticketData - Datos del ticket desde req.ticket
 * @returns {Uint8Array} Datos codificados del ticket
 */
const buildTicket = (ticketData) => {
    const encoder = new ReceiptPrinterEncoder({
        language: 'esc-pos',
        columns: 48,
        feedBeforeCut: 4,
        createCanvas: createCanvas
    });

    let ticketEncoder = encoder
        .initialize()
        .codepage('auto');

    // [1] Imagen (comentada por ahora)
    // const imagePath = path.join(__dirname, '..', '..', 'assets', 'images', 'sultan-icon.png');
    // const image = await loadImage(imagePath);
    // ticketEncoder = ticketEncoder.align('center').image(image, 240, 200);

    // [2] Información del establecimiento
    ticketEncoder = buildEstablishmentSection(ticketEncoder, ticketData.establishment);

    // [3] Metadatos (fecha, usuario, artículos)
    ticketEncoder = buildMetadataSection(ticketEncoder, ticketData.metadata);

    // [4] Encabezado de tabla de productos
    ticketEncoder = buildProductsTableHeader(ticketEncoder);

    // [5] Lista de productos
    ticketEncoder = buildProductsSection(ticketEncoder, ticketData.products);

    // [6] Total
    ticketEncoder = buildTotalSection(ticketEncoder, ticketData.total);

    // [7] Footer (agradecimiento y créditos)
    ticketEncoder = buildFooterSection(ticketEncoder);

    // [8] Finalizar y codificar
    return ticketEncoder.cut().encode();
};

module.exports = {
    buildTicket,
    buildEstablishmentSection,
    buildMetadataSection,
    buildProductsTableHeader,
    buildProductsSection,
    buildTotalSection,
    buildFooterSection
};
