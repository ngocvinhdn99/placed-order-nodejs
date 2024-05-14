const productRoutes = require("./product");
const skuRoutes = require("./sku");
const voucherRoutes = require("./voucher");
const deliveryRoutes = require("./delivery");
const shippingAddressRoutes = require("./shipping-address");
const userRoutes = require("./user");
const cartRoutes = require("./cart");
const checkoutRoutes = require("./checkout");
const orderRoutes = require("./order");
const warehouseRoutes = require("./warehouse");

module.exports = {
  productRoutes,
  skuRoutes,
  voucherRoutes,
  deliveryRoutes,
  shippingAddressRoutes,
  userRoutes,
  cartRoutes,
  checkoutRoutes,
  orderRoutes,
  warehouseRoutes,
};
