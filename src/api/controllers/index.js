const productController = require("./product");
const skuController = require("./sku");
const voucherController = require("./voucher");
const deliveryController = require("./delivery");
const shippingAddressController = require("./shipping-address");
const userController = require("./user");
const cartController = require("./cart");
const checkoutController = require("./checkout");
const orderController = require("./order");
const warehouseController = require("./warehouse");

module.exports = {
  productController,
  skuController,
  voucherController,
  deliveryController,
  shippingAddressController,
  userController,
  cartController,
  checkoutController,
  orderController,
  warehouseController
};
