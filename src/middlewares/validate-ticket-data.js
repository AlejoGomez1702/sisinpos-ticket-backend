
const validateTicketData = ( req, res, next ) => {
    
    const {
        establishment_name
    } = req.body;

    req.ticket.establishment = {
        name: establishment_name
    };

    next();
};

module.exports = {
    validateTicketData
};