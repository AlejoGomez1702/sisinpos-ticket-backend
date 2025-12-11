const SystemReceiptPrinter = require('@point-of-sale/system-receipt-printer');
const { request, response } = require('express');
const { sendToPrinter } = require('../helpers/printer.helper');
const { buildTicket } = require('../helpers/ticket-builder.helper');
const { clearPrintQueue } = require('../helpers/printer-queue.helper');

// Semáforo simple para evitar impresiones concurrentes
let printLock = Promise.resolve();

const printTicket = async( req = request, res = response ) => {

    const { printer } = req.ticket;

    try {
        // [1] Construir ticket (no requiere lock)
        const data = buildTicket(req.ticket);
        console.log(`📄 Datos generados: ${data.length} bytes`);

        // [2] Esperar turno y ejecutar impresión de forma secuencial
        await (printLock = printLock.then(async () => {
            // [2.1] Inicializar impresora
            const receiptPrinter = new SystemReceiptPrinter({ name: printer.name });

            // [2.2] Imprimir ticket
            await sendToPrinter(receiptPrinter, data);

            // [2.3] Limpiar cola en background (sin await) para prevenir acumulación futura
            clearPrintQueue(printer.name).catch(err => 
                console.warn('Error limpiando cola:', err.message)
            );
        }).catch((error) => {
            console.error('Error en semáforo de impresión:', error.message);
            throw error; // Re-lanzar para que el catch externo lo capture
        }));

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