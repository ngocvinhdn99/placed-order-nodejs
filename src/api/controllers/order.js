const { orderSchema } = require("../../schemas");
const { collectionConst } = require("../../config");
const { ObjectId } = require("mongodb");
const { helper, format } = require("../../utils");

const handleCheckUnValidIds = async (payload, res) => {
  try {
    const { shippingAddressId, deliveryId, voucherIds } = payload;

    const validShippingAddress = await db
      .collection(collectionConst.shippingAddress)
      .findOne({
        _id: new ObjectId(shippingAddressId || ""),
      });
    const validDelivery = await db
      .collection(collectionConst.delivery)
      .findOne({
        _id: new ObjectId(deliveryId || ""),
      });

    if (!validShippingAddress || !validDelivery) {
      const title =
        (!validShippingAddress && `Shipping address ${shippingAddressId}`) ||
        (!validDelivery && `Delivery ${deliveryId}`) ||
        "";

      return res.status(400).json({ message: `${title} không tìm thấy` });
    }

    if (validDelivery.status !== "active") {
      return res
        .status(400)
        .json({ message: `Delivery ${validDelivery._id} không hoạt động` });
    }

    for (let i = 0; i < voucherIds.length; i++) {
      const voucherId = voucherIds[i];

      const validVoucher = await db
        .collection(collectionConst.vouchers)
        .findOne({
          _id: new ObjectId(voucherId || ""),
        });
      if (!validVoucher) {
        return res
          .status(400)
          .json({ message: `Voucher ${voucherId} không tìm thấy` });
      }
      if (validVoucher.quantity < 1) {
        return res
          .status(400)
          .json({ message: `Voucher ${validVoucher._id} đã hết` });
      }

      if (new Date() > validVoucher.expireAt) {
        return res.status(400).json({
          message: `Voucher ${validVoucher._id} đã hết hạn sử dụng`,
        });
      }

      const skuPrices = await helper.getSkuPrices(res, payload);
      if (skuPrices < validVoucher.minOrderValue) {
        return res.status(400).json({
          message: `Voucher ${
            validVoucher._id
          } chỉ áp dụng cho đơn hàng tối thiểu ${format.currency(
            validVoucher.minOrderValue
          )}, vui lòng đặt thêm sản phẩm`,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.placeOrder = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { value: payload, error } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const isUnValidIds = await handleCheckUnValidIds(payload, res);
    if (isUnValidIds) return;

    const selectedCart = await db.collection(collectionConst.carts).findOne({
      _id: new ObjectId(req.body.cartId),
    });
    if (!selectedCart) {
      return res.status(400).json({ message: "Cart item không tìm thấy" });
    }

    const skuListInCart = selectedCart.items.map((i) => ({
      ...i,
      warehouseId: selectedCart.warehouseId,
    }));

    const isUnValidSkuItem = await helper.checkUnValidSkuItem(
      req,
      res,
      skuListInCart
    );
    if (isUnValidSkuItem) return;

    const priceTotal = await helper.getOrderPriceTotal(res, payload);
    const shippingAddress = await db
      .collection(collectionConst.shippingAddress)
      .findOne({
        _id: new ObjectId(payload.shippingAddressId || ""),
      });

    const doc = {
      shippingAddressId: new ObjectId(payload.shippingAddressId),
      deliveryId: new ObjectId(payload.deliveryId),
      voucherIds: payload.voucherIds.map((id) => new ObjectId(id)),
      note: payload.note,
      userId: shippingAddress.userId,
      warehouseId: new ObjectId(selectedCart.warehouseId || ""),
      items: selectedCart.items.map((item) => ({
        ...item,
        skuId: new ObjectId(item.skuId),
      })),
      priceTotal,
      status: "pending",
    };

    // console.log("doc", doc);
    // return;

    // res.status(201).json({ mesasge: 'Bạn có thể đặt đơn hàng này' });
    const order = await db.collection(collectionConst.orders).insertOne(doc);
    // update logic
    await helper.changeQuantitySkuInWarehouseAfterPlaceOrder(
      req,
      res,
      payload.cartId
    );
    await helper.changeQuantityVoucherAfterPlaceOrder(
      req,
      res,
      payload.voucherIds
    );
    await db.collection(collectionConst.carts).deleteOne({
      _id: new ObjectId(payload.cartId),
    });
    res.status(201).json({ _id: order.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sessions = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { value: payload, error } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const isUnValidIds = await handleCheckUnValidIds(payload, res);
    if (isUnValidIds) return;

    const selectedCart = await db.collection(collectionConst.carts).findOne({
      _id: new ObjectId(req.body.cartId),
    });
    if (!selectedCart) {
      return res.status(400).json({ message: "Cart item không tìm thấy" });
    }

    const skuListInCart = selectedCart.items.map((i) => ({
      ...i,
      warehouseId: selectedCart.warehouseId,
    }));

    const isUnValidSkuItem = await helper.checkUnValidSkuItem(
      req,
      res,
      skuListInCart
    );
    if (isUnValidSkuItem) return;

    const shipFee = await helper.getOrderShipFee(payload);
    const skuPrices = await helper.getSkuPrices(res, payload);
    const voucherDiscount = await helper.getVoucherDiscount(payload);

    const priceTotal = shipFee + skuPrices - voucherDiscount;

    res.status(201).json({
      data: {
        price: {
          shipFee,
          skuPrices,
          voucherDiscount,
          priceTotal,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  const db = req.app.locals.db;

  try {
    const orders = await db.collection(collectionConst.orders).find().toArray();

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
