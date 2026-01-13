const { Router } = require('express');
const { check } = require('express-validator');
const { validatePrinter } = require('../middlewares/validate-printer');
const { validateFields } = require('../middlewares/validate-fields');
const { validateTicketData } = require('../middlewares/validate-ticket-data');
const { printTicket, printKitchenTicket } = require('../controllers/printer.controller');
const { validateKitchenTicketData } = require('../middlewares/validate-kitchen-ticket-data');

const router = Router();

router.post('/print-ticket', [
  validatePrinter,
  check('establishment_name', 'El nombre del negocio es incorrecto').trim().isString().not().isEmpty().isLength({ max: 30 }),
  check('establishment_nit').optional().trim().isString().isLength({ max: 20 }),
  check('establishment_phone').optional().trim().isString().isLength({ max: 15 }),
  check('establishment_email').optional().trim().isEmail().withMessage('El email no es válido'),
  check('establishment_address').optional().trim().isString().isLength({ max: 60 }),
  check('waiter_name').trim().isString().not().isEmpty().isLength({ max: 50 }),
  check('sale_data', 'Los datos de la venta son obligatorios').exists(),
  check('sale_data.products', 'La lista de productos es obligatoria').exists().isArray({ min: 1 }),
  check('sale_data.notes').optional().trim().isString().isLength({ max: 200 }),
  check('sale_data.delivery_cost').optional().isNumeric().withMessage('El costo de domicilio debe ser un número'),
  validateFields,
  validateTicketData
], printTicket);

router.post('/print-kitchen-ticket', [
  validatePrinter,
  check('order_data', 'Los datos de la orden son obligatorios').exists(),
  check('order_data.order_type', 'El tipo de orden es obligatorio').exists().isIn(['TABLE', 'DELIVERY', 'FAST']),
  check('order_data.table_name').optional().isString().isLength({ max: 30 }),
  check('order_data.customer_name').optional().isString().isLength({ max: 50 }),
  check('order_data.delivery_cost').optional().isNumeric().withMessage('El costo de domicilio debe ser un número'),
  check('sale_data', 'Los datos de la venta son obligatorios').exists(),
  check('sale_data.products', 'La lista de productos es obligatoria').exists().isArray({ min: 1 }),
  check('sale_data.notes').optional().trim().isString().isLength({ max: 200 }),
  validateFields,
  validateKitchenTicketData
], printKitchenTicket);

module.exports = router;