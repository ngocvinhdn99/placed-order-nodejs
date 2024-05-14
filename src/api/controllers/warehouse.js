const { collectionConst } = require("../../config");
const { warehouseSchema } = require("../../schemas");
const { warehouseItemSchema } = require("../../schemas/warehouse");
const { helper } = require("../../utils");
const { ObjectId } = require("mongodb");

exports.getAll = async (req, res) => {
  const db = req.app.locals.db;

  try {
    const warehouses = await db
      .collection(collectionConst.warehouses)
      .aggregate([
        {
          $unwind: {
            path: "$items",
            preserveNullAndEmptyArrays: true, // Giữ lại các document ngay cả khi mảng trống
          },
        },
        {
          $lookup: {
            from: collectionConst.skus,
            localField: "items.skuId",
            foreignField: "_id",
            as: "items.sku",
          },
        },
        {
          $unwind: {
            path: "$items.sku",
            preserveNullAndEmptyArrays: true, // Giữ lại các document ngay cả khi không có SKU nào được tìm thấy
          },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            address: { $first: "$address" },
            regionCode: { $first: "$regionCode" },
            items: {
              $push: {
                // Chỉ thêm vào mảng nếu cả sku và quantity đều hợp lệ
                $cond: {
                  if: {
                    $and: [
                      "$items.sku", // Kiểm tra xem có thông tin sku
                      { $gt: ["$items.quantity", 0] } // Kiểm tra xem quantity có lớn hơn 0 không
                    ]
                  },
                  then: {
                    quantity: "$items.quantity",
                    sku: "$items.sku"
                  },
                  else: "$$REMOVE" // Loại bỏ phần tử này khỏi mảng nếu không thỏa mãn điều kiện
                }
              },
            },
          },
        },
        {
          $project: {
            name: 1,
            address: 1,
            regionCode: 1,
            items: 1  // Luôn trả về trường items
          }
        }
      ])
      .toArray();

    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createData = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { value: payload, error } = warehouseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const doc = {
      ...payload,
      items:
        payload.items?.map((i) => ({
          ...i,
          skuId: new ObjectId(i.skuId),
        })) || [],
    };

    const isUnvalidSkuItems = await helper.checkUnValidSku(req, res, doc);
    if (isUnvalidSkuItems) return;

    const warehouse = await db
      .collection(collectionConst.warehouses)
      .insertOne(doc);
    res.status(201).json({ _id: warehouse.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addItems = async (req, res) => {
  const db = req.app.locals.db;
  const { warehouseId } = req.query;

  if (!warehouseId) {
    return res.status(400).json({ message: "Vui lòng cung cấp warehouseId" });
  }

  try {
    const validWarehouse = await db
      .collection(collectionConst.warehouses)
      .findOne({
        _id: new ObjectId(warehouseId || ""),
      });

    if (!validWarehouse) {
      return res
        .status(400)
        .json({ message: `Warehouse ${warehouseId} không tìm thấy` });
    }

    const { value: payload, error } = warehouseItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const isUnvalidSkuItems = await helper.checkUnValidSku(req, res, payload);
    if (isUnvalidSkuItems) return;

    const newItems =
      helper.handleUpdateWhItems(payload, validWarehouse.items) || [];

    const updatedCartItem = await db
      .collection(collectionConst.warehouses)
      .findOneAndUpdate(
        { _id: new ObjectId(warehouseId) },
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
