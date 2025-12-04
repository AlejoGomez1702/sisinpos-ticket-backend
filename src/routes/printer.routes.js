/**
 * Rutas para operaciones de impresión
 */

const express = require('express');
const router = express.Router();
const printerService = require('../services/printer.service');

/**
 * GET /api/printer/list
 * Listar impresoras disponibles en el sistema
 */
router.get('/list', async (req, res, next) => {
  try {
    const printers = await printerService.listPrinters();
    res.json({ success: true, printers });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/printer/print
 * Imprimir un recibo
 * Body: { content: string, printerName?: string }
 */
router.post('/print', async (req, res, next) => {
  try {
    const { content, printerName } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'El campo "content" es requerido' 
      });
    }

    const result = await printerService.printReceipt(content, printerName);
    res.json({ success: true, message: 'Recibo enviado a imprimir', result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/printer/test
 * Imprimir un recibo de prueba
 * Body: { printerName?: string } - opcional
 */
router.post('/test', async (req, res, next) => {
  try {
    const { printerName } = req.body || {};
    const result = await printerService.printTestReceipt(printerName);
    res.json({ success: true, message: 'Recibo de prueba enviado', result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
