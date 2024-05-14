const { collectionConst } = require("../config");
const { ObjectId } = require("mongodb");

exports.checkUnValidSkuItem = async (req, res, items) => {
  const db = req.app.locals.db;
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const validSku = await db.collection(collectionConst.skus).findOne({
        _id:
          typeof item.skuId === "string"
            ? new ObjectId(item.skuId || "")
            : item.skuId,
      });
      if (!validSku) {
        return res
          .status(400)
          .json({ message: `Sku ${item.skuId} không tìm thấy` });
      }
      const skuQuantity = await this.getQuantityByWarehouseAndSku(
        req,
        res,
        item.warehouseId,
        item.skuId
      );
      if (skuQuantity < item.quantity) {
        return res.status(400).json({
          message: `Số lượng sku ${item.skuId} không đủ ở kho ${item.warehouseId}`,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getOrderShipFee = async (payload) => {
  const { shippingAddressId, deliveryId, cartId } = payload;

  const validShippingAddress = await db
    .collection(collectionConst.shippingAddress)
    .findOne({
      _id: new ObjectId(shippingAddressId || ""),
    });

  const validCart = await db.collection(collectionConst.carts).findOne({
    _id: new ObjectId(cartId || ""),
  });
  const validWarehouse = await db
    .collection(collectionConst.warehouses)
    .findOne({
      _id: validCart.warehouseId,
    });

  const regionDistance = Math.abs(
    validShippingAddress.regionCode - validWarehouse.regionCode
  );

  const validDelivery = await db.collection(collectionConst.delivery).findOne({
    _id: new ObjectId(deliveryId || ""),
  });

  const result = validDelivery.regionPrices.find(
    (i) => i.regionDistance === regionDistance
  )?.price;

  return result || 0;
};

exports.getSkuPrices = async (res, payload) => {
  try {
    const { cartId } = payload;

    const selectedCart = await db.collection(collectionConst.carts).findOne({
      _id: new ObjectId(cartId),
    });
    if (!selectedCart) {
      return res.status(400).json({ message: "Cart item không tìm thấy" });
    }

    let total = 0;

    for (const item of selectedCart.items) {
      const sku = await db.collection(collectionConst.skus).findOne({
        _id: item.skuId || "",
      });

      total += sku.price * item.quantity;
    }

    return total;
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getVoucherDiscount = async (payload) => {
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

exports.getOrderPriceTotal = async (res, payload) => {
  const shipFee = await this.getOrderShipFee(payload);
  const skuPrices = await this.getSkuPrices(res, payload);
  const voucherDiscount = await this.getVoucherDiscount(payload);

  return shipFee + skuPrices - voucherDiscount;
};

exports.checkUnValidSku = async (req, res, items) => {
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
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.handleUpdateWhItems = (curItems, newItems, res) => {
  const objResult = {};
  [...curItems, ...newItems].forEach((i) =>
    objResult[i.skuId]
      ? (objResult[i.skuId] += i.quantity)
      : (objResult[i.skuId] = i.quantity)
  );

  const result = Object.keys(objResult).map((key) => ({
    skuId: new ObjectId(key || ""),
    quantity: objResult[key],
  }));

  return result;
};

exports.getTotalQuantityBySkuId = async (req, res, skuId) => {
  const db = req.app.locals.db;

  try {
    const pipeline = [
      {
        $unwind: "$items", // Giải nén mảng items để xử lý từng item
      },
      {
        $match: {
          "items.skuId": skuId, // Lọc các item có skuId phù hợp
        },
      },
      {
        $group: {
          _id: null, // Nhóm tất cả các kết quả lại với nhau
          totalQuantity: { $sum: "$items.quantity" }, // Tính tổng số lượng
        },
      },
    ];

    const results = await db
      .collection(collectionConst.warehouses)
      .aggregate(pipeline)
      .toArray();
    return results.length > 0 ? results[0].totalQuantity : 0;
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getQuantityByWarehouseAndSku = async (req, res, warehouseId, skuId) => {
  const db = req.app.locals.db;

  try {
    const pipeline = [
      {
        $match: {
          _id:
            typeof warehouseId === "string"
              ? new ObjectId(warehouseId)
              : warehouseId,
        },
      }, // Lọc kho theo ID
      { $unwind: "$items" }, // Phẳng hóa mảng items
      {
        $match: {
          "items.skuId":
            typeof skuId === "string" ? new ObjectId(skuId) : skuId,
        },
      }, // Tìm items có skuId khớp
      { $project: { quantity: "$items.quantity" } }, // Chọn trường quantity
    ];

    const result = await db
      .collection(collectionConst.warehouses)
      .aggregate(pipeline)
      .toArray();

    return result.length > 0 ? result[0].quantity : 0;
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.changeQuantitySkuInWarehouseAfterPlaceOrder = async (
  req,
  res,
  cartId
) => {
  const db = req.app.locals.db;

  try {
    const validCart = await db.collection(collectionConst.carts).findOne({
      _id: new ObjectId(cartId || ""),
    });
    const validWarehouse = await db
      .collection(collectionConst.warehouses)
      .findOne({
        _id: validCart.warehouseId,
      });

    const newItems = validWarehouse.items.map((itemA) => {
      const matchingItemB = validCart.items.find(
        (itemB) => itemB.skuId.toHexString() === itemA.skuId.toHexString()
      );
      const updatedQuantity =
        itemA.quantity - (matchingItemB ? matchingItemB.quantity : 0);
      return { skuId: itemA.skuId, quantity: updatedQuantity };
    });

    await db.collection(collectionConst.warehouses).findOneAndUpdate(
      { _id: validCart.warehouseId },
      {
        $set: { items: newItems },
      },
      { returnDocument: "after" }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changeQuantityVoucherAfterPlaceOrder = async (req, res, voucherIds) => {
  const db = req.app.locals.db;

  try {
    for (const voucherId of voucherIds) {
      const voucher = await db.collection(collectionConst.vouchers).findOne({
        _id: new ObjectId(voucherId || ""),
      });

      await db.collection(collectionConst.vouchers).findOneAndUpdate(
        { _id: new ObjectId(voucher._id) },
        {
          $set: { quantity: voucher.quantity - 1 },
        },
        { returnDocument: "after" }
      );
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.isValidDateISO8601 = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
  return regex.test(dateString);
};

// const a = [
//   {
//     skuId: "6624eb716aab5aeed8a544ea",
//     quantity: 3,
//   },
//   {
//     skuId: "6624eb716aab5aeed8a544eb",
//     quantity: 3,
//   },
//   {
//     skuId: "6624eb716aab5aeed8a544ec",
//     quantity: 3,
//   },
// ];

// const b = [
//   {
//     skuId: "6624eb716aab5aeed8a544ed",
//     quantity: 3,
//   },
//   {
//     skuId: "6624eb716aab5aeed8a544ea",
//     quantity: 4,
//   },
//   {
//     skuId: "6624eb716aab5aeed8a544ec",
//     quantity: 3,
//   },
// ];
