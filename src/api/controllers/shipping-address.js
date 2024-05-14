const { collectionConst } = require("../../config");
const { shippingAddressSchema } = require("../../schemas");
const { ObjectId } = require("mongodb");

exports.getAll = async (req, res) => {
  const { db } = req.app.locals;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Vui lòng cung cấp userId" });
  }
  const selectedUser = await db.collection(collectionConst.users).findOne({
    _id: new ObjectId(userId),
  });
  if (!selectedUser) {
    return res.status(400).json({ message: "User không tìm thấy" });
  }

  try {
    const pipeline = [
      { $match: { userId: new ObjectId(userId) } }, // Lọc các địa chỉ theo userId
      {
        $lookup: {
          from: collectionConst.users,
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ];

    const shippingAddress = await db
      .collection(collectionConst.shippingAddress)
      .aggregate(pipeline)
      .toArray();

    res.json(shippingAddress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createData = async (req, res) => {
  const db = req.app.locals.db;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Vui lòng cung cấp userId" });
  }

  try {
    const selectedUser = await db.collection(collectionConst.users).findOne({
      _id: new ObjectId(userId),
    });
    if (!selectedUser) {
      return res.status(400).json({ message: "User không tìm thấy" });
    }

    const { value, error } = shippingAddressSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const data = {
      ...value,
      userId: new ObjectId(userId),
    };

    const doc = await db
      .collection(collectionConst.shippingAddress)
      .insertOne(data);
    res.status(201).json({ _id: doc.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
