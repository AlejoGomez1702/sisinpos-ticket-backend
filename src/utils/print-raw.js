/**
 * Utilidades para impresión RAW en Windows
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Imprimir datos binarios directamente a una impresora de Windows
 * @param {Uint8Array|Buffer} data - Datos ESC/POS a imprimir
 * @param {string} printerName - Nombre de la impresora
 * @returns {Promise<Object>}
 */
function printRaw(data, printerName = 'InfoPos') {
  return new Promise((resolve, reject) => {
    // Crear archivo temporal
    const tempFile = path.join(process.cwd(), `print_${Date.now()}.prn`);
    
    try {
      // Escribir datos binarios al archivo
      fs.writeFileSync(tempFile, Buffer.from(data));
      
      // Usar comando copy de Windows en modo binario
      const command = `copy /B "${tempFile}" "\\\\localhost\\${printerName}"`;
      
      exec(command, (error, stdout, stderr) => {
        // Limpiar archivo temporal
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          console.warn('No se pudo eliminar archivo temporal:', e.message);
        }
        
        if (error) {
          reject(new Error(`Error al imprimir: ${error.message}`));
          return;
        }
        
        if (stderr) {
          console.warn('Stderr:', stderr);
        }
        
        resolve({
          success: true,
          output: stdout.trim(),
          bytes: data.length
        });
      });
      
    } catch (error) {
      // Limpiar en caso de error
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {}
      
      reject(new Error(`Error al preparar impresión: ${error.message}`));
    }
  });
}

module.exports = {
  printRaw
};
