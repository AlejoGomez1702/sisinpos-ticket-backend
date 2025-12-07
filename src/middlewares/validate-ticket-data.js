
const validateTicketData = ( req, res, next ) => {
    
    const {
        establishment_name,
        establishment_nit,
        establishment_phone,
        establishment_email,
        establishment_address,
        waiter_name
    } = req.body;

    req.ticket.establishment = {
        name: establishment_name,
        nit: establishment_nit || 'xxx.xxx.xxx-x',
        phone: establishment_phone || '3xx-xxx-xxxx',
        email: establishment_email || null,
        address: establishment_address || 'Colombia'
    };

    // Datos del ticket
    const now = new Date();
    const date = now.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    req.ticket.metadata = {
        date: date,
        time: time,
        waiter: waiter_name || null
    };

    next();
};

module.exports = {
    validateTicketData
};