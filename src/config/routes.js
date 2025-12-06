const paths = {
    printer: '/api/printer',
}

const loadRoutes = (app) => {
    app.use(paths.printer, require('../routes/printer.routes'));
}

module.exports = {
    loadRoutes
};