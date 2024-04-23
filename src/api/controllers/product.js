const { collectionConst } = require("../../config");
const { productSchema } = require("../../schemas");
const { ObjectId } = require("mongodb");

exports.getAll = async (req, res) => {
  const db = req.app.locals.db;

  try {
    const products = await db
      .collection(collectionConst.products)
      .aggregate([
        {
          $lookup: {
            from: collectionConst.skus,
            localField: "_id",
            foreignField: "productId",
            as: "skus",
          },
        },
      ])
      .toArray();

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  const db = req.app.locals.db;

  try {
    const pipeline = [
      {
        $match: { _id: new ObjectId(req.params.id) }, // Lọc sản phẩm theo ID
      },
      {
        $lookup: {
          from: collectionConst.skus,
          localField: "_id",
          foreignField: "productId",
          as: "skus",
        },
      },
    ];

    const products = await db
      .collection(collectionConst.products)
      .aggregate(pipeline)
      .toArray();

    if (products.length > 0) {
      res.json(products[0]); // Gửi về sản phẩm tìm thấy
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createData = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { value, error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await db
      .collection(collectionConst.products)
      .insertOne(value);
    res.status(201).json({ _id: product.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
