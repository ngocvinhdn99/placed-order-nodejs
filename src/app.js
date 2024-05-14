const express = require("express");
const bodyParser = require("body-parser");
const {
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
} = require("./api/routes");

const app = express();

app.use(bodyParser.json());
app.use("/products", productRoutes);
app.use("/skus", skuRoutes);
app.use("/vouchers", voucherRoutes);
app.use("/deliveries", deliveryRoutes);
app.use("/shipping-address", shippingAddressRoutes);
app.use("/users", userRoutes);
app.use("/carts", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/order", orderRoutes);
app.use("/warehouses", warehouseRoutes);

module.exports = app;
