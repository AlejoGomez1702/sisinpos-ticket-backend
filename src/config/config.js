/**
 * Configuración centralizada de la aplicación
 */

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  // Configuración de la impresora por defecto
  printer: {
    name: process.env.PRINTER_NAME || null, // null = usar impresora por defecto del sistema
    encoding: 'utf-8',
    language: 'esc-pos' // esc-pos, star-line, star-prnt
  }
};
