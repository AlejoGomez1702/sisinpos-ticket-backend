const validateKitchenTicketData = (req, res, next) => {
    
    const { order_data, sale_data } = req.body;

    // [1] Preservar printer del middleware anterior y agregar información de la orden
    req.ticket = {
        ...req.ticket, // Mantener el printer que viene de validatePrinter
        orderType: order_data.order_type,
        tableName: order_data.table_name || null,
        customerName: order_data.customer_name || null,
        deliveryCost: order_data.delivery_cost || null
    };

    // [2] Productos de la orden
    req.ticket.products = sale_data.products.map(product => ({
        name: product.product_name,
        quantity: product.count,
        note: product.product_note || null
    }));

    // [3] Notas generales
    req.ticket.notes = sale_data.notes || null;
    next();
};

module.exports = {
    validateKitchenTicketData
};