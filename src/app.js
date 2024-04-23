const express = require("express");
const bodyParser = require("body-parser");
const {
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
} = require("./api/routes");

const app = express();

app.use(bodyParser.json());
app.use("/products", productRoutes);
app.use("/skus", skuRoutes);
app.use("/vouchers", voucherRoutes);
app.use("/payments", paymentRoutes);
app.use("/deliveries", deliveryRoutes);
app.use("/shipping-address", shippingAddressRoutes);
app.use("/users", userRoutes);
app.use("/carts", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/order", orderRoutes);

module.exports = app;
