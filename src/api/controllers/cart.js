const { collectionConst } = require("../../config");
const { cartSchema } = require("../../schemas");
const { ObjectId } = require("mongodb");
const { helper } = require("../../utils");
const { cartItemSchema } = require("../../schemas/cart");

exports.getAll = async (req, res) => {
  const db = req.app.locals.db;

  try {
    const pipeline = [
      {
        $lookup: {
          from: collectionConst.warehouses,
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $unwind: "$warehouse",
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: collectionConst.skus,
          localField: "items.skuId",
          foreignField: "_id",
          as: "sku",
        },
      },
      {
        $unwind: "$sku",
      },
      {
        $group: {
          _id: "$_id",
          warehouse: { $first: "$warehouse" },
          items: {
            $push: { sku: "$sku", quantity: "$items.quantity" },
          },
        },
      },
      {
        $project: {
          _id: 1,
          warehouse: {
            _id: 1,
            name: 1, // chỉnh sửa hoặc thêm các trường bạn muốn giữ
            address: 1,
            regionCode: 1,
            // Đảm bảo không trả về `items`
          },
          items: 1,
        },
      },
    ];

    const carts = await db
      .collection(collectionConst.carts)
      .aggregate(pipeline)
      .toArray();
    res.json(carts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createData = async (req, res) => {
  const db = req.app.locals.db;
  const { warehouseId, skuId, quantity } = req.body;
  try {
    const validSku = await db.collection(collectionConst.skus).findOne({
      _id: new ObjectId(skuId || ""),
    });

    if (!validSku) {
      return res.status(400).json({ message: "Sku không tìm thấy" });
    }

    const isUnValid = await helper.checkUnValidSkuItem(req, res, [
      { skuId, quantity, warehouseId },
    ]);
    if (isUnValid) return;

    const cartItem = await db
      .collection(collectionConst.carts)
      .findOne({ warehouseId: new ObjectId(warehouseId) });
    if (cartItem) {
      let newItems = [];
      const skuIdInItems = cartItem.items.find(
        (i) => i.skuId.toHexString() === skuId
      );

      if (!skuIdInItems) {
        newItems = [
          ...cartItem.items,
          { skuId: new ObjectId(skuId), quantity },
        ];
      } else {
        const updatedQuantity = skuIdInItems.quantity + quantity;
        const skuCurQuantity = await helper.getQuantityByWarehouseAndSku(
          req,
          res,
          warehouseId,
          skuId
        );

        if (updatedQuantity > skuCurQuantity) {
          return res.status(400).json({
            message: `Số lượng sku ${skuId} không đủ ở kho ${warehouseId}`,
          });
        }

        newItems = cartItem.items.map((i) =>
          i.skuId.toHexString() === skuId
            ? { ...i, quantity: updatedQuantity }
            : i
        );
      }

      const updatedCartItem = await db
        .collection(collectionConst.carts)
        .findOneAndUpdate(
          { warehouseId: new ObjectId(warehouseId) },
          {
            $set: { items: newItems },
          },
          { returnDocument: "after" }
        );

      if (!updatedCartItem) {
        return res.status(404).json({ message: "Unable to update item" });
      }

      return res.json(updatedCartItem);
    }

    const { value, error } = cartSchema.validate({
      warehouseId,
      skuId,
      quantity,
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const doc = {
      warehouseId: new ObjectId(warehouseId),
      items: [
        {
          skuId: new ObjectId(skuId),
          quantity,
        },
      ],
    };

    const cart = await db.collection(collectionConst.carts).insertOne(doc);
    res.status(201).json({ _id: cart.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateItems = async (req, res) => {
  const db = req.app.locals.db;
  const { cartId } = req.params;

  if (!cartId) {
    return res.status(400).json({ message: "Vui lòng cung cấp cartId" });
  }

  try {
    const validCart = await db.collection(collectionConst.carts).findOne({
      _id: new ObjectId(cartId || ""),
    });

    if (!validCart) {
      return res.status(400).json({ message: `Cart ${cartId} không tìm thấy` });
    }

    const {
      value: { items },
      error,
    } = cartItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const newItems = items.map((i) => ({
      ...i,
      skuId: new ObjectId(i.skuId),
    }));

    const isUnValid = await helper.checkUnValidSkuItem(
      req,
      res,
      newItems.map((i) => ({
        ...i,
        warehouseId: validCart.warehouseId,
      }))
    );
    if (isUnValid) return;

    const updatedCartItem = await db
      .collection(collectionConst.carts)
      .findOneAndUpdate(
        { _id: new ObjectId(cartId) },
        {
          $set: { items: newItems },
        },
        { returnDocument: "after" }
      );

    if (!updatedCartItem) {
      return res
        .status(201)
        .status(404)
        .json({ message: "Unable to update item" });
    }

    return res.json(updatedCartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  const db = req.app.locals.db;

  try {
    const item = await db.collection(collectionConst.carts).deleteOne({
      _id: new ObjectId(req.params.cartId),
    });
    item.deletedCount > 0
      ? res
          .status(201)
          .json({ message: `Đã xóa giỏ hàng với id ${req.params.cartId}` })
      : res.status(400).json({
          message: `Không tìm thấy giỏ hàng với id ${req.params.cartId}`,
        });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
