/**
 * Test usando el método RAW de Windows para ESC/POS
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ReceiptPrinterEncoder = require('@point-of-sale/receipt-printer-encoder');

console.log('Test de impresión RAW para InfoPOS\n');

// Crear encoder
const encoder = new ReceiptPrinterEncoder({
  language: 'esc-pos'
});

// Generar comandos ESC/POS básicos
const data = encoder
  .initialize()
  .text('HOLA MUNDO\n')
  .text('Prueba InfoPOS\n')
  .text('1234567890\n')
  .newline()
  .newline()
  .cut('partial')
  .encode();

// Guardar en archivo temporal
const tempFile = path.join(process.cwd(), 'temp_print.prn');
fs.writeFileSync(tempFile, Buffer.from(data));

console.log(`Archivo temporal creado: ${tempFile}`);
console.log(`Tamaño: ${data.length} bytes\n`);

// Imprimir usando comando copy de Windows (modo RAW)
const command = `copy /B "${tempFile}" "\\\\localhost\\InfoPos"`;

console.log(`Ejecutando: ${command}\n`);

exec(command, (error, stdout, stderr) => {
  // Eliminar archivo temporal
  try {
    fs.unlinkSync(tempFile);
  } catch (e) {}

  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  if (stderr) {
    console.error('Stderr:', stderr);
  }
  
  console.log('Resultado:', stdout);
  console.log('\n✓ Comando ejecutado. Verifica la impresora.');
});
