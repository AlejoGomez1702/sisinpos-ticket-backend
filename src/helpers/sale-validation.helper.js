/**
 * Verifica que la venta tenga productos o una venta de tiempo (billar)
 * @param {Object} sale_data - Datos de la venta
 * @returns {Boolean}
 */
const hasProductsOrBilliardSale = (sale_data) => {
    const hasProducts = Array.isArray(sale_data?.products) && sale_data.products.length > 0;
    const hasBilliardSale = !!sale_data?.billiard_sale;
    return hasProducts || hasBilliardSale;
};

module.exports = {
    hasProductsOrBilliardSale
};
