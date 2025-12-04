/**
 * Punto de entrada del servidor
 */

require('dotenv').config();
const app = require('./app');
const config = require('./config/config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('🚀 Sisinpos Ticket Backend');
  console.log('═══════════════════════════════════════');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📋 Environment: ${config.env}`);
  console.log(`🖨️  Printer: ${config.printer.name || 'Default system printer'}`);
  console.log('═══════════════════════════════════════');
});

// Manejo graceful de shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});
