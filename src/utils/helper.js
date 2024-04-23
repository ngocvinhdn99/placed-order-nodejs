const { collectionConst } = require("../config");
const { ObjectId } = require("mongodb");

exports.checkUnValidSkuItem = async (req, res, items) => {
  const db = req.app.locals.db;
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const validSku = await db.collection(collectionConst.skus).findOne({
        _id: new ObjectId(item.skuId || ""),
      });
      if (!validSku) {
        return res
          .status(400)
          .json({ message: `Sku ${item.skuId} không tìm thấy` });
      }
      if (validSku.quantityRemaining < item.quantity) {
        return res
          .status(400)
          .json({ message: `Số lượng sku ${item.skuId} không đủ` });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getOrderShipFee = async (payload) => {
  const { shippingAddressId, deliveryId } = payload;

  const validShippingAddress = await db
    .collection(collectionConst.shippingAddress)
    .findOne({
      _id: new ObjectId(shippingAddressId || ""),
    });

  const validDelivery = await db.collection(collectionConst.delivery).findOne({
    _id: new ObjectId(deliveryId || ""),
  });

  const result = validDelivery.regionPrices.find(
    (i) => i.regionCode === validShippingAddress.regionCode
  )?.price;

  return result || 0;
};

exports.getSkuPrices = async (payload) => {
  const { items } = payload;

  let total = 0;

  for (const item of items) {
    const sku = await db.collection(collectionConst.skus).findOne({
      _id: new ObjectId(item.skuId || ""),
    });

    total += sku.price * item.quantity;
  }

  return total;
};

const getVoucherDiscount = async (payload) => {
  const { voucherIds } = payload;

  let total = 0;

  for (const voucherId of voucherIds) {
    const voucher = await db.collection(collectionConst.vouchers).findOne({
      _id: new ObjectId(voucherId || ""),
    });

    total += voucher.value;
  }

  return total;
};

exports.getOrderPriceTotal = async (payload) => {
  const shipFee = await getOrderShipFee(payload);
  const skuPrices = await this.getSkuPrices(payload);
  const voucherDiscount = await getVoucherDiscount(payload);

  return shipFee + skuPrices - voucherDiscount;
};

exports.changeQuantitySkuAfterPlaceOrder = async (items) => {
  for (const item of items) {
    const sku = await db.collection(collectionConst.skus).findOne({
      _id: new ObjectId(item.skuId || ""),
    });

    await db.collection(collectionConst.skus).findOneAndUpdate(
      { _id: new ObjectId(sku._id) },
      {
        $set: { quantityRemaining: sku.quantityRemaining - item.quantity },
      },
      { returnDocument: "after" }
    );
  }
};

exports.changeQuantityVoucherAfterPlaceOrder = async (voucherIds) => {
  for (const voucherId of voucherIds) {
    const voucher = await db.collection(collectionConst.vouchers).findOne({
      _id: new ObjectId(voucherId || ""),
    });

    await db.collection(collectionConst.vouchers).findOneAndUpdate(
      { _id: new ObjectId(voucher._id) },
      {
        $set: { quantityRemaining: voucher.quantityRemaining - 1 },
      },
      { returnDocument: "after" }
    );
  }
};
