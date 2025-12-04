/**
 * Script de prueba directa para impresora InfoPOS
 */

const ReceiptPrinterEncoder = require('@point-of-sale/receipt-printer-encoder');
const SystemReceiptPrinter = require('@point-of-sale/system-receipt-printer');

console.log('Iniciando prueba de impresora...\n');

// Listar impresoras disponibles
console.log('Impresoras disponibles:');
const printers = SystemReceiptPrinter.getPrinters();
printers.forEach((p, index) => {
  console.log(`${index + 1}. ${p.name} ${p.isDefault ? '(Default)' : ''}`);
});
console.log('');

// Crear encoder con configuración mínima
const encoder = new ReceiptPrinterEncoder({
  language: 'esc-pos'
});

// Generar comandos ESC/POS muy básicos
const data = encoder
  .initialize()
  .raw([0x1B, 0x40]) // ESC @ - Inicializar impresora
  .raw([0x1B, 0x61, 0x00]) // ESC a 0 - Alinear izquierda
  .text('HOLA MUNDO\n')
  .text('Prueba InfoPOS\n')
  .text('1234567890\n')
  .raw([0x0A, 0x0A, 0x0A]) // 3 saltos de línea
  .raw([0x1D, 0x56, 0x00]) // GS V 0 - Corte parcial
  .encode();

console.log('Datos generados:', data.length, 'bytes');
console.log('Primeros bytes:', Array.from(data.slice(0, 20)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
console.log('');

// Crear impresora (usa la impresora InfoPos)
const printer = new SystemReceiptPrinter({ name: 'InfoPos' });

printer.addEventListener('connected', () => {
  console.log('✓ Conectado a la impresora');
  console.log('Enviando datos...');
  
  printer.print(data);
  
  setTimeout(() => {
    printer.disconnect();
  }, 1000);
});

printer.addEventListener('disconnected', () => {
  console.log('✓ Desconectado');
  console.log('\n¿Se imprimió algo? Si no, intenta:');
  console.log('1. Verificar que la impresora esté encendida');
  console.log('2. Que tenga papel');
  console.log('3. Que sea compatible con ESC/POS');
  process.exit(0);
});

printer.addEventListener('error', (error) => {
  console.error('✗ Error:', error);
  process.exit(1);
});

console.log('Conectando a la impresora...');
printer.connect();
