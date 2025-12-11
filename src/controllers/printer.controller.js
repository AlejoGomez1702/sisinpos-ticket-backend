const SystemReceiptPrinter = require('@point-of-sale/system-receipt-printer');
const { request, response } = require('express');
const { sendToPrinter } = require('../helpers/printer.helper');
const { buildTicket } = require('../helpers/ticket-builder.helper');

const printTicket = async( req = request, res = response ) => {

    const { printer } = req.ticket;

    try {
        // [1] Inicializar impresora
        const receiptPrinter = new SystemReceiptPrinter({ name: printer.name });

        // [2] Construir ticket
        const data = buildTicket(req.ticket);

        console.log(`📄 Datos generados: ${data.length} bytes`);

        // [8] Imprimir ticket
        await sendToPrinter(receiptPrinter, data);

        return res.json({
            ok: true,
            msg: 'Ticket impreso correctamente',
            printer: printer.name,
            bytes: data.length
        });

    } catch (error) {
        console.error('✗ Error al imprimir ticket:', error);
        console.error('✗ Stack trace:', error.stack);
        
        return res.status(500).json({
            ok: false,
            msg: 'Error al imprimir el ticket',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

module.exports = {
    printTicket
};