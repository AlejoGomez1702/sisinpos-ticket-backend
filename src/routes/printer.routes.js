const { Router } = require('express');
const { check } = require('express-validator');
const { validatePrinter } = require('../middlewares/validate-printer');
const { validateFields } = require('../middlewares/validate-fields');
const { validateTicketData } = require('../middlewares/validate-ticket-data');

const { printTicket } = require('../controllers/printer');

const router = Router();

router.post('/print-ticket', [
  validatePrinter,
  check('establishment_name', 'El nombre del negocio es incorrecto').isString().not().isEmpty().isLength({ max: 30 }),
  validateFields,
  validateTicketData
], printTicket);


module.exports = router;