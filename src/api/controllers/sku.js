const { collectionConst } = require("../../config");
const { skuSchema } = require("../../schemas");
const { ObjectId } = require("mongodb");

exports.getAll = async (req, res) => {
  const db = req.app.locals.db;
  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ message: "Vui lòng cung cấp productId" });
  }
  const selectedProduct = await db
    .collection(collectionConst.products)
    .findOne({
      _id: new ObjectId(productId),
    });
  if (!selectedProduct) {
    return res.status(400).json({ message: "Product không tìm thấy" });
  }

  try {
    const pipeline = [
      { $match: { productId: new ObjectId(productId) } }, // Lọc các địa chỉ theo userId
      {
        $lookup: {
          from: collectionConst.products,
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ];

    const skus = await db
      .collection(collectionConst.skus)
      .aggregate(pipeline)
      .toArray();

    res.json(skus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createData = async (req, res) => {
  const db = req.app.locals.db;
  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ message: "Vui lòng cung cấp productId" });
  }

  try {
    const selectedProduct = await db
      .collection(collectionConst.products)
      .findOne({
        _id: new ObjectId(productId),
      });
    if (!selectedProduct) {
      return res.status(400).json({ message: "Product không tìm thấy" });
    }

    const { value, error } = skuSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const data = {
      ...value,
      productId: new ObjectId(productId),
    };

    const product = await db.collection(collectionConst.skus).insertOne(data);
    res.status(201).json({ _id: product.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
