/**
 * Punto de entrada del servidor
 */

require('dotenv').config();
const Server = require('./config/server');

const server = new Server();
server.listen();
