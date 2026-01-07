const express = require('express');
const cors = require('cors');
const config = require('./config');

class Server {
    constructor() {
        this.app = express();
        this.port = config.port;
        
        // Configurar middlewares
        this.startMiddlewares();

        // Configurar rutas
        this.startRoutes();
    }

    startMiddlewares() {
        // CORS
        this.app.use(cors());
        
        // Lectura y parseo del body
        this.app.use( express.json({limit: '20mb'}) );
    }

    startRoutes() {
        this.app.use('/api/printer', require('../routes/printer.routes'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('═══════════════════════════════════════');
            console.log('🚀 Sisinpos Ticket Backend');
            console.log('═══════════════════════════════════════');
            console.log(`📡 Server: http://localhost:${this.port}`);
            console.log(`📋 Environment: ${config.env}`);
            console.log(`🖨️  Printer: ${config.printer.name || 'Default system printer'}`);
            console.log('═══════════════════════════════════════');
        });
    }
}

module.exports = Server;