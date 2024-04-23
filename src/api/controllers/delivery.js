const { collectionConst } = require("../../config");
const { deliverySchema } = require("../../schemas");

exports.getAll = async (req, res) => {
  const db = req.app.locals.db;

  try {
    const delivery = await db
      .collection(collectionConst.delivery)
      .find()
      .toArray();

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createData = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { value, error } = deliverySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const delivery = await db
      .collection(collectionConst.delivery)
      .insertOne(value);
    res.status(201).json({ _id: delivery.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
