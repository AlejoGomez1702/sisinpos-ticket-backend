/**
 * Servicio para manejo de impresión de recibos ESC/POS
 */

const ReceiptPrinterEncoder = require('@point-of-sale/receipt-printer-encoder');
const SystemReceiptPrinter = require('@point-of-sale/system-receipt-printer');
const config = require('../config/config');

class PrinterService {
  
  /**
   * Listar impresoras disponibles en el sistema
   * @returns {Promise<Array>} Lista de impresoras
   */
  async listPrinters() {
    try {
      const printers = SystemReceiptPrinter.getPrinters();
      return printers;
    } catch (error) {
      console.error('Error al listar impresoras:', error);
      throw new Error(`No se pudieron listar las impresoras: ${error.message}`);
    }
  }

  /**
   * Generar datos ESC/POS para un recibo
   * @param {string} content - Contenido del recibo
   * @returns {Uint8Array} Datos codificados para la impresora
   */
  encodeReceipt(content) {
    const encoder = new ReceiptPrinterEncoder({
      language: config.printer.language
    });

    const result = encoder
      .initialize()
      .codepage('auto')
      .text(content)
      .newline()
      .newline()
      .cut()
      .encode();

    return result;
  }

  /**
   * Imprimir un recibo
   * @param {string} content - Contenido del recibo
   * @param {string} printerName - Nombre de la impresora (opcional)
   * @returns {Promise<Object>} Resultado de la impresión
   */
  async printReceipt(content, printerName = null) {
    return new Promise((resolve, reject) => {
      try {
        const encodedData = this.encodeReceipt(content);
        
        // Configurar la impresora
        const printerConfig = printerName ? { name: printerName } : {};
        const printer = new SystemReceiptPrinter(printerConfig);
        
        // Manejar eventos de conexión
        printer.addEventListener('connected', () => {
          console.log(`✓ Conectado a la impresora: ${printerName || 'default'}`);
          
          // Enviar datos a imprimir
          printer.print(encodedData);
          
          // Desconectar después de imprimir
          setTimeout(() => {
            printer.disconnect();
          }, 500);
        });
        
        printer.addEventListener('disconnected', () => {
          console.log(`✓ Desconectado de la impresora`);
          resolve({
            printed: true,
            bytes: encodedData.length,
            printer: printerName || 'default'
          });
        });
        
        printer.addEventListener('error', (error) => {
          console.error('Error en la impresora:', error);
          reject(new Error(`Error al imprimir: ${error.message || error}`));
        });
        
        // Conectar a la impresora
        printer.connect();
        
      } catch (error) {
        reject(new Error(`Error al imprimir: ${error.message}`));
      }
    });
  }

  /**
   * Imprimir un recibo de prueba
   * @param {string} printerName - Nombre de la impresora (opcional)
   * @returns {Promise<Object>} Resultado de la impresión
   */
  async printTestReceipt(printerName = null) {
    return new Promise((resolve, reject) => {
      try {
        const encoder = new ReceiptPrinterEncoder({
          language: config.printer.language
        });

        const testContent = encoder
          .initialize()
          .codepage('auto')
          .align('center')
          .bold(true)
          .line('RECIBO DE PRUEBA')
          .bold(false)
          .line('═══════════════════════════')
          .newline()
          .align('left')
          .line('Sisinpos Ticket Backend')
          .line(`Fecha: ${new Date().toLocaleString('es-ES')}`)
          .newline()
          .line('Esta es una impresión de prueba')
          .line('para verificar la conexión con')
          .line('la impresora ESC/POS.')
          .newline()
          .align('center')
          .line('═══════════════════════════')
          .qrcode('https://github.com/NielsLeenheer/ReceiptPrinterEncoder')
          .newline()
          .text('Powered by ReceiptPrinterEncoder')
          .newline()
          .newline()
          .newline()
          .cut()
          .encode();

        // Configurar la impresora
        const printerConfig = printerName ? { name: printerName } : {};
        const printer = new SystemReceiptPrinter(printerConfig);
        
        // Manejar eventos
        printer.addEventListener('connected', () => {
          console.log(`✓ Conectado a la impresora: ${printerName || 'default'}`);
          printer.print(testContent);
          
          setTimeout(() => {
            printer.disconnect();
          }, 500);
        });
        
        printer.addEventListener('disconnected', () => {
          console.log(`✓ Recibo de prueba impreso correctamente`);
          resolve({
            printed: true,
            bytes: testContent.length,
            printer: printerName || 'default'
          });
        });
        
        printer.addEventListener('error', (error) => {
          console.error('Error al imprimir recibo de prueba:', error);
          reject(new Error(`Error al imprimir: ${error.message || error}`));
        });
        
        // Conectar
        printer.connect();
        
      } catch (error) {
        reject(new Error(`Error al generar recibo de prueba: ${error.message}`));
      }
    });
  }
}

module.exports = new PrinterService();
