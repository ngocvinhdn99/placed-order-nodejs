const productController = require("./product");
const skuController = require("./sku");
const voucherController = require("./voucher");
const paymentController = require("./payment");
const deliveryController = require("./delivery");
const shippingAddressController = require("./shipping-address");
const userController = require("./user");
const cartController = require("./cart");
const checkoutController = require("./checkout");
const orderController = require("./order");

module.exports = {
  productController,
  skuController,
  voucherController,
  paymentController,
  deliveryController,
  shippingAddressController,
  userController,
  cartController,
  checkoutController,
  orderController
};
