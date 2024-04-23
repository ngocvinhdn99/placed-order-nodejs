const productRoutes = require("./product");
const skuRoutes = require("./sku");
const voucherRoutes = require("./voucher");
const paymentRoutes = require("./payment");
const deliveryRoutes = require("./delivery");
const shippingAddressRoutes = require("./shipping-address");
const userRoutes = require("./user");
const cartRoutes = require("./cart");
const checkoutRoutes = require("./checkout");
const orderRoutes = require("./order")

module.exports = {
  productRoutes,
  skuRoutes,
  voucherRoutes,
  paymentRoutes,
  deliveryRoutes,
  shippingAddressRoutes,
  userRoutes,
  cartRoutes,
  checkoutRoutes,
  orderRoutes
};
