const { collectionConst } = require("../../config");
const { cartSchema } = require("../../schemas");
const { ObjectId } = require("mongodb");
const { helper } = require("../../utils");

exports.getAll = async (req, res) => {
  const db = req.app.locals.db;

  const pipeline = [
    {
      $lookup: {
        from: collectionConst.skus,
        localField: "skuId",
        foreignField: "_id",
        as: "sku",
      },
    },
    { $unwind: "$sku" },
    {
      $lookup: {
        from: collectionConst.products,
        localField: "sku.productId",
        foreignField: "_id",
        as: "sku.product",
      },
    },
    { $unwind: "$sku.product" },
    {
      $project: {
        skuId: 0,
        "sku.productId": 0,
      },
    },
  ];

  try {
    const cart = await db
      .collection(collectionConst.carts)
      .aggregate(pipeline)
      .toArray();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createData = async (req, res) => {
  const db = req.app.locals.db;
  const payload = req.body;
  try {
    const validSku = await db.collection(collectionConst.skus).findOne({
      _id: new ObjectId(payload.skuId || ""),
    });
    if (!validSku) {
      return res.status(400).json({ message: "Sku không tìm thấy" });
    }

    const isUnValid = await helper.checkUnValidSkuItem(req, res, [payload]);
    if (isUnValid) return;

    const cartItem = await db
      .collection(collectionConst.carts)
      .findOne({ skuId: new ObjectId(payload.skuId) });
    if (cartItem) {
      const updatedQuantity = cartItem.quantity + payload.quantity;
      if (updatedQuantity > validSku.quantityRemaining) {
        return res
          .status(400)
          .json({ message: `Số lượng sku ${payload.skuId} không đủ` });
      }

      const updatedCartItem = await db
        .collection(collectionConst.carts)
        .findOneAndUpdate(
          { skuId: new ObjectId(payload.skuId) },
          {
            $set: { quantity: updatedQuantity },
          },
          { returnDocument: "after" }
        );

      if (!updatedCartItem) {
        return res.status(404).json({ message: "Unable to update item" });
      }

      return res.json(updatedCartItem);
    }

    const { value, error } = cartSchema.validate(payload);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const doc = {
      ...value,
      skuId: new ObjectId(value.skuId) || "",
    };

    const cart = await db.collection(collectionConst.carts).insertOne(doc);
    res.status(201).json({ _id: cart.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
