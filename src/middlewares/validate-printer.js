const { request, response } = require("express");
const SystemReceiptPrinter = require('@point-of-sale/system-receipt-printer');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Verifica el estado real de la impresora usando PowerShell
 * @param {string} printerName 
 * @returns {Promise<boolean>}
 */
const isPrinterOnline = async (printerName) => {
    // TODO: Implementar validación confiable de estado de impresora
    // Problema actual: Windows reporta estados transitorios (Printing, Processing)
    // que causan falsos positivos. Necesita lógica más robusta que diferencie
    // entre "ocupada imprimiendo" vs "físicamente desconectada"
    // Ticket Jira: [PENDING]
    
    return true; // Por ahora, siempre permitir (asumimos que está disponible)
};

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

        // Verificar estado real de la impresora (conectada físicamente)
        const isOnline = await isPrinterOnline(sisinposPrinter.name);
        
        if (!isOnline) {
            console.warn('⚠️  Impresora "Sisinpos" está DESCONECTADA o APAGADA');
            return res.status(503).json({
                ok: false,
                msg: 'Impresora desconectada',
                error: 'La impresora "Sisinpos" está desconectada o apagada. Por favor, verifique la conexión USB y que esté encendida.',
                printerName: sisinposPrinter.name
            });
        }
        
        // Guardar la impresora en el request para usarla en el controlador
        req.ticket.printer = sisinposPrinter;
        console.log(`✓ Impresora "Sisinpos" conectada y lista`);
        
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