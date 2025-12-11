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

        // Verificar que la impresora esté realmente disponible (no solo encolada)
        // Esto ayuda a detectar si está desconectada del USB
        const testPrinter = new SystemReceiptPrinter({ name: sisinposPrinter.name });
        
        // Intentar obtener estado de la impresora con un timeout corto
        const printerAvailable = await new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(false);
            }, 1000); // 1 segundo de timeout

            try {
                // Verificar si podemos acceder a la impresora
                const printerInfo = SystemReceiptPrinter.getPrinters().find(p => p.name === sisinposPrinter.name);
                clearTimeout(timeout);
                resolve(!!printerInfo);
            } catch (error) {
                clearTimeout(timeout);
                resolve(false);
            }
        });

        if (!printerAvailable) {
            console.warn('⚠️  Impresora "Sisinpos" encontrada pero puede estar desconectada');
            return res.status(503).json({
                ok: false,
                msg: 'Impresora no disponible',
                error: 'La impresora "Sisinpos" está configurada pero parece estar desconectada. Por favor, verifique la conexión USB.',
                suggestion: 'Reconecte la impresora y espere unos segundos antes de intentar nuevamente'
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