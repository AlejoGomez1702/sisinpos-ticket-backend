const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Limpia la cola de impresión de una impresora específica en Windows
 * @param {string} printerName - Nombre de la impresora
 * @returns {Promise<{success: boolean, message: string}>}
 */
const clearPrintQueue = async (printerName) => {
    try {
        // Comando optimizado: usar -ErrorAction SilentlyContinue para ignorar si no hay jobs
        const command = `powershell -Command "Get-PrintJob -PrinterName '${printerName}' -ErrorAction SilentlyContinue | Remove-PrintJob -ErrorAction SilentlyContinue"`;
        
        await execPromise(command);
        
        console.log(`🧹 Cola limpiada: "${printerName}"`);
        return {
            success: true,
            message: `Cola de impresión limpiada correctamente`
        };
    } catch (error) {
        // Silenciar errores ya que usamos ErrorAction SilentlyContinue
        console.log(`✓ Cola verificada: "${printerName}"`);
        return {
            success: true,
            message: 'Cola verificada'
        };
    }
};

/**
 * Obtiene el número de trabajos pendientes en la cola
 * @param {string} printerName - Nombre de la impresora
 * @returns {Promise<number>}
 */
const getPendingJobs = async (printerName) => {
    try {
        const command = `powershell -Command "(Get-PrintJob -PrinterName '${printerName}').Count"`;
        const { stdout } = await execPromise(command);
        
        const count = parseInt(stdout.trim()) || 0;
        console.log(`📊 Trabajos pendientes en "${printerName}": ${count}`);
        
        return count;
    } catch (error) {
        console.warn(`⚠️  No se pudo obtener trabajos pendientes: ${error.message}`);
        return 0;
    }
};

module.exports = {
    clearPrintQueue,
    getPendingJobs
};
