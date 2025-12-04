/**
 * Configuración de la aplicación Express
 */

const express = require('express');
const cors = require('cors');
const printerRoutes = require('./routes/printer.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging simple de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/printer', printerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Error interno del servidor' 
  });
});

module.exports = app;
