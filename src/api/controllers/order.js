const { orderSchema } = require("../../schemas");
const { collectionConst } = require("../../config");
const { ObjectId } = require("mongodb");
const { helper, format } = require("../../utils");

const handleCheckUnValidIds = async (payload, res) => {
  try {
    const { shippingAddressId, paymentId, deliveryId, voucherIds } = payload;

    const validShippingAddress = await db
      .collection(collectionConst.shippingAddress)
      .findOne({
        _id: new ObjectId(shippingAddressId || ""),
      });
    const validPayment = await db.collection(collectionConst.payments).findOne({
      _id: new ObjectId(paymentId || ""),
    });
    const validDelivery = await db
      .collection(collectionConst.delivery)
      .findOne({
        _id: new ObjectId(deliveryId || ""),
      });

    if (!validShippingAddress || !validPayment || !validDelivery) {
      const title =
        (!validShippingAddress && `Shipping address ${shippingAddressId}`) ||
        (!validPayment && `Payment ${paymentId}`) ||
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
      if (validVoucher.quantityRemaining < 1) {
        return res
          .status(400)
          .json({ message: `Voucher ${validVoucher._id} đã hết` });
      }

      const validVoucherPayment = validVoucher.appliedPaymentMethodIds
        .map((id) => id.toHexString())
        .includes(validPayment._id.toHexString());

      if (!validVoucherPayment) {
        return res.status(400).json({
          message: `Voucher ${validVoucher._id} không áp dụng cho phương thức thanh toán payment ${validPayment._id}`,
        });
      }

      const skuPrices = await helper.getSkuPrices(payload);
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

    const isUnValidSkuItem = await helper.checkUnValidSkuItem(
      req,
      res,
      payload.items
    );
    if (isUnValidSkuItem) return;

    const priceTotal = await helper.getOrderPriceTotal(payload);
    const shippingAddress = await db
      .collection(collectionConst.shippingAddress)
      .findOne({
        _id: new ObjectId(payload.shippingAddressId || ""),
      });

    const doc = {
      ...payload,
      shippingAddressId: new ObjectId(payload.shippingAddressId),
      paymentId: new ObjectId(payload.paymentId),
      deliveryId: new ObjectId(payload.deliveryId),
      voucherIds: payload.voucherIds.map((id) => new ObjectId(id)),
      userId: shippingAddress.userId,
      items: payload.items.map((item) => ({
        ...item,
        skuId: new ObjectId(item.skuId),
      })),
      priceTotal,
      status: "pending",
    };

    console.log("doc", doc);
    return;

    // res.status(201).json({ mesasge: 'Bạn có thể đặt đơn hàng này' });
    const order = await db.collection(collectionConst.orders).insertOne(doc);
    await helper.changeQuantitySkuAfterPlaceOrder(payload.items);
    await helper.changeQuantityVoucherAfterPlaceOrder(payload.voucherIds);
    res.status(201).json({ _id: order.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
