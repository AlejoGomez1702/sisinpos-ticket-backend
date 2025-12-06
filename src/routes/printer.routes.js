const { Router } = require('express');
const { printTicket } = require('../controllers/printer');
const { validatePrinter } = require('../middlewares/validate-printer');

const router = Router();

router.post('/print-ticket', [
  validatePrinter
], printTicket);


module.exports = router;