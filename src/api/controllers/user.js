const { collectionConst } = require("../../config");
const { userSchema } = require("../../schemas");
const { ObjectId } = require("mongodb");

exports.getAll = async (req, res) => {
  const db = req.app.locals.db;

  try {
    const users = await db
      .collection(collectionConst.users)
      .aggregate([
        {
          $lookup: {
            from: collectionConst.shippingAddress,
            localField: "_id",
            foreignField: "userId",
            as: "shippingAddresses",
          },
        },
      ])
      .toArray();

    res.json(users);
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
          from: collectionConst.shippingAddress,
          localField: "_id",
          foreignField: "userId",
          as: "shippingAddresses",
        },
      },
    ];

    const users = await db
      .collection(collectionConst.users)
      .aggregate(pipeline)
      .toArray();

    if (users.length > 0) {
      res.json(users[0]); // Gửi về sản phẩm tìm thấy
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createData = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { value, error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const doc = await db.collection(collectionConst.users).insertOne(value);
    res.status(201).json({ _id: doc.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
