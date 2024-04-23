const { collectionConst } = require("../../config");
const { paymentSchema } = require("../../schemas");

exports.getAll = async (req, res) => {
  const db = req.app.locals.db;

  try {
    const payments = await db
      .collection(collectionConst.payments)
      .find()
      .toArray();

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createData = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { value, error } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const payment = await db
      .collection(collectionConst.payments)
      .insertOne(value);
    res.status(201).json({ _id: payment.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
