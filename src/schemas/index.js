const productSchema = require("./product");
const skuSchema = require("./sku");
const voucherSchema = require("./voucher");
const paymentSchema = require("./payment");
const deliverySchema = require("./delivery");
const shippingAddressSchema = require("./shipping-address");
const userSchema = require("./user");
const cartSchema = require("./cart");
const checkoutSchema = require("./checkout");
const orderSchema = require("./order");

module.exports = {
  productSchema,
  skuSchema,
  voucherSchema,
  paymentSchema,
  deliverySchema,
  shippingAddressSchema,
  userSchema,
  cartSchema,
  checkoutSchema,
  orderSchema,
};
