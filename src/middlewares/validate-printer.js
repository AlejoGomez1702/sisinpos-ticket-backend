const { request, response } = require("express");
const SystemReceiptPrinter = require('@point-of-sale/system-receipt-printer');

const validatePrinter = async (req = request, res = response, next) => {
    try {
        req.ticket = {};
        // Obtener lista de impresoras disponibles
        const printers = SystemReceiptPrinter.getPrinters();
        
        // Buscar la impresora "Sisinpos"
        const sisinposPrinter = printers.find(p => p.name === 'Sisinpos');
        
        if (!sisinposPrinter) {
            console.error('❌ Impresora "Sisinpos" no encontrada');
            console.log('📋 Impresoras disponibles:', printers.map(p => p.name));
            
            return res.status(500).json({
                ok: false,
                msg: 'Impresora "Sisinpos" no configurada',
                error: 'Por favor, configure una impresora con el nombre "Sisinpos" en su sistema operativo',
                availablePrinters: printers.map(p => p.name)
            });
        }
        
        // Guardar la impresora en el request para usarla en el controlador
        req.ticket.printer = sisinposPrinter;
        console.log(`✓ Impresora "Sisinpos" encontrada y lista`);
        
        next();
        
    } catch (error) {
        console.error('❌ Error al buscar impresora:', error);
        
        return res.status(500).json({
            ok: false,
            msg: 'Error al buscar impresora',
            error: error.message
        });
    }
}

module.exports = {
    validatePrinter
};