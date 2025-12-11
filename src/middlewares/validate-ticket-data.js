
const validateTicketData = ( req, res, next ) => {
    
    const {
        establishment_name,
        establishment_nit,
        establishment_phone,
        establishment_email,
        establishment_address,
        waiter_name,
        sale_data
    } = req.body;

    // [1] Información del establecimiento
    req.ticket.establishment = {
        name: establishment_name,
        nit: establishment_nit || 'xxx.xxx.xxx-x',
        phone: establishment_phone || '3xx-xxx-xxxx',
        email: establishment_email || null,
        address: establishment_address || 'Colombia'
    };

    // [2] Metadatos del ticket (fecha, hora, usuario, observaciones)
    const now = new Date();
    const date = now.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // [3] Productos de la venta
    req.ticket.products = sale_data.products.map(product => ({
        name: product.product_name,
        quantity: product.count,
        unitPrice: product.sale_price,
        total: product.total_item_value,
        note: product.product_note || null
    }));

    // Calcular total de artículos entregados
    const totalArticles = sale_data.products.reduce((sum, product) => sum + product.count, 0);
    
    req.ticket.metadata = {
        date: date,
        time: time,
        waiter: waiter_name || null,
        observations: sale_data.notes || null,
        totalArticles: totalArticles
    };

    // [4] Total de la venta
    req.ticket.total = sale_data.total;

    next();
};

module.exports = {
    validateTicketData
};