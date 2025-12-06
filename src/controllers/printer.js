const ReceiptPrinterEncoder = require('@point-of-sale/receipt-printer-encoder');
const SystemReceiptPrinter = require('@point-of-sale/system-receipt-printer');
const { createCanvas, loadImage } = require('canvas');
const { request, response } = require('express');
const path = require('path');

const printTicket = async( req = request, res = response ) => {

    const { printer, establishment } = req.ticket;

    try {
        // 1. Obtener impresora 
        const receiptPrinter = new SystemReceiptPrinter({ name: printer.name });

        const imagePath = path.join(__dirname, '..', '..', 'assets', 'images', 'sultan-icon.png');
        const image = await loadImage(imagePath);
        const imageWidth = 30*8;
        const imageHeight = 25*8;

        const encoder = new ReceiptPrinterEncoder({
            language: 'esc-pos',
            columns: 48,
            feedBeforeCut: 4,
            createCanvas: createCanvas
        });

        // 4. Generar datos del ticket
        const data = encoder
            .initialize()
            .codepage('auto')

            // Imagen
            .align('center')
            // .image(image, imageWidth, imageHeight)

            // Información del negocio
            .font('A')
            .bold(true)
            .size(2, 2)
            .line(establishment.name)
            .size(1, 1)
            .bold(false)

            // Info Obligatoria del negocio
            .line('NIT: xxx.xxx.xxx-x')

            // Información adicional Recomendada
            .line('CEL/WhatsApp: 310-636-6850')
            .line('Cali, Valle del Cauca')
            .newline()

            // Detalles del ticket
            // .table(
            //     [
            //         { width: 18, align: 'left' },
            //         { width: 4,  align: 'left' },
            //         { width: 10,  align: 'right' },
            //         { width: 10,  align: 'right' }
            //     ],
            //     [
            //         [
            //             (encoder) => encoder.bold(true).text('Producto').bold(false),
            //             (encoder) => encoder.bold(true).text('CT').bold(false),
            //             (encoder) => encoder.bold(true).text('Unit').bold(false),
            //             (encoder) => encoder.bold(true).text('Total').bold(false)
            //         ],
            //         [
            //             (encoder) => encoder.rule({ style: 'double' }),
            //             (encoder) => encoder.rule({ style: 'double' }),
            //             (encoder) => encoder.rule({ style: 'double' }),
            //             (encoder) => encoder.rule({ style: 'double' })
            //         ],
            //         [ (encoder) => encoder.bold(false).text('Media de aguardiente amarillo de manzanares').align('left'), 'x2', '$20.000','$40.000' ],
            //         [
            //             (encoder) => encoder.rule(),
            //             (encoder) => encoder.rule(),
            //             (encoder) => encoder.rule(),
            //             (encoder) => encoder.rule()
            //         ],
            //         [ (encoder) => encoder.bold(false).text('Media de aguardiente amarillo de manzanares').align('center'), 'x1', '$18.000','$18.000' ],
            //         [
            //             (encoder) => encoder.rule(),
            //             (encoder) => encoder.rule(),
            //             (encoder) => encoder.rule(),
            //             (encoder) => encoder.rule()
            //         ],
            //         [ (encoder) => encoder.bold(false).text('Media de aguardiente amarillo de manzanares').align('center'), 'x3', '$44.000','$132.000' ]
            //     ]
            // )
            // .newline()
            // .size(1,2)
            // .align('center')
            // .line('Luis Alejandro Gómez Castaño')
            // .line('12/10/2024 01:44 PM')
            // .size(2,2)
            // .line('¡Gracias x su Compra!')
            // .barcode('3130ds3', 'code128')
            // .qrcode('https://nielsleenheer.com')
            // .size(1,2)
            // .line('Desarrollador: sisinpos.com')
            .cut()
            .encode();

        console.log(`📄 Datos generados: ${data.length} bytes`);

        // 5. Imprimir directamente (SystemReceiptPrinter maneja la conexión internamente)
        console.log('🖨️  Enviando a imprimir...');
        
        await new Promise((resolve, reject) => {
            let resolved = false;

            // Listener para cuando termine de imprimir
            const handlePrinted = () => {
                if (!resolved) {
                    console.log('✓ Impresión completada');
                    resolved = true;
                    resolve({ success: true });
                }
            };

            // Listener para errores
            const handleError = (error) => {
                if (!resolved) {
                    console.error('✗ Error durante impresión:', error);
                    resolved = true;
                    reject(new Error(`Error de impresora: ${error.message || error}`));
                }
            };

            // Registrar listeners
            receiptPrinter.addEventListener('printed', handlePrinted);
            receiptPrinter.addEventListener('error', handleError);

            // Intentar imprimir inmediatamente
            try {
                receiptPrinter.print(data);
                console.log('✓ Comando de impresión enviado');
                
                // Si no hay evento 'printed', resolver después de un delay
                setTimeout(() => {
                    if (!resolved) {
                        console.log('⚠️  No se recibió confirmación, asumiendo éxito');
                        resolved = true;
                        resolve({ success: true, assumed: true });
                    }
                }, 2000);
                
            } catch (printError) {
                console.error('✗ Error al enviar comando:', printError);
                resolved = true;
                reject(printError);
            }
        });

        return res.json({
            ok: true,
            msg: 'Ticket impreso correctamente',
            printer: defaultPrinter.name,
            bytes: data.length
        });

    } catch (error) {
        console.error('✗ Error al imprimir ticket:', error);
        console.error('✗ Stack trace:', error.stack);
        
        return res.status(500).json({
            ok: false,
            msg: 'Error al imprimir el ticket',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

module.exports = {
    printTicket
};