const { Router } = require('express');
const { check } = require('express-validator');
const { validatePrinter } = require('../middlewares/validate-printer');
const { validateFields } = require('../middlewares/validate-fields');
const { validateTicketData } = require('../middlewares/validate-ticket-data');
const { printTicket } = require('../controllers/printer.controller');


const router = Router();

router.post('/print-ticket', [
  validatePrinter,
  check('establishment_name', 'El nombre del negocio es incorrecto').trim().isString().not().isEmpty().isLength({ max: 30 }),
  check('establishment_nit').optional().trim().isString().isLength({ max: 20 }),
  check('establishment_phone').optional().trim().isString().isLength({ max: 15 }),
  check('establishment_email').optional().trim().isEmail().withMessage('El email no es válido'),
  check('establishment_address').optional().trim().isString().isLength({ max: 60 }),
  validateFields,
  validateTicketData
], printTicket);


module.exports = router;