const { collectionConst } = require("../../config");
const { skuSchema } = require("../../schemas");
const { ObjectId } = require("mongodb");
const { helper } = require("../../utils");

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
      {
        $lookup: {
          from: collectionConst.warehouses,
          let: { skuId: "$_id" },
          pipeline: [
            { $unwind: "$items" },
            { $match: { $expr: { $eq: ["$items.skuId", "$$skuId"] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                address: 1,
                regionCode: 1
              }
            }
          ],
          as: "warehouses"
        }
      }

    ];

    const skus = await db
      .collection(collectionConst.skus)
      .aggregate(pipeline)
      .toArray();

    const skusWithQuantity = await Promise.all(
      skus.map(async (sku) => {
        const quantity = await helper.getTotalQuantityBySkuId(
          req,
          res,
          sku._id
        );
        return { ...sku, quantity };
      })
    );

    res.json(skusWithQuantity);
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

    // function Person(first, last, age, eye) {
    //   this.firstName = first;
    //   this.lastName = last;
    //   this.age = age;
    //   this.eyeColor = eye;
    // }

    // // Create a Person object
    // const myFather = new Person("John", "Doe", 50, "blue");

    // console.log('myFather', myFather);

    // console.log("data", data);
    // // object rỗng -> map data vô -> loại bỏ field dư

    // // return;

    const product = await db.collection(collectionConst.skus).insertOne(data);
    res.status(201).json({ _id: product.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
