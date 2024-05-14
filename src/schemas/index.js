const productSchema = require("./product");
const skuSchema = require("./sku");
const voucherSchema = require("./voucher");
const deliverySchema = require("./delivery");
const shippingAddressSchema = require("./shipping-address");
const userSchema = require("./user");
const { cartSchema, cartItemSchema } = require("./cart");
const checkoutSchema = require("./checkout");
const orderSchema = require("./order");
const { warehouseSchema, warehouseItemSchema } = require("./warehouse");

module.exports = {
  productSchema,
  skuSchema,
  voucherSchema,
  deliverySchema,
  shippingAddressSchema,
  userSchema,
  cartSchema,
  cartItemSchema,
  checkoutSchema,
  orderSchema,
  warehouseSchema,
};
