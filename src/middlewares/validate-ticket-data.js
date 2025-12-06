
const validateTicketData = ( req, res, next ) => {
    
    const {
        establishment_name,
        establishment_nit,
        establishment_phone,
        establishment_email,
        establishment_address
    } = req.body;

    req.ticket.establishment = {
        name: establishment_name,
        nit: establishment_nit || 'xxx.xxx.xxx-x',
        phone: establishment_phone || '3xx-xxx-xxxx',
        email: establishment_email || null,
        address: establishment_address || 'Colombia'
    };

    next();
};

module.exports = {
    validateTicketData
};