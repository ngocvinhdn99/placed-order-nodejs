const { collectionConst } = require("../../config");
const { voucherSchema } = require("../../schemas");
const { ObjectId } = require("mongodb");

exports.getAll = async (req, res) => {
  const db = req.app.locals.db;

  try {
    const vouchers = await db
      .collection(collectionConst.vouchers)
      .find()
      .toArray();

    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createData = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { value: payload, error } = voucherSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    for (let i = 0; i < payload.appliedPaymentMethodIds.length; i++) {
      const paymentId = payload.appliedPaymentMethodIds[i];
      const validPayment = await db
        .collection(collectionConst.payments)
        .findOne({
          _id: new ObjectId(paymentId || ""),
        });
      if (!validPayment)
        return res
          .status(400)
          .json({ message: `Payment ${paymentId} không tồn tại` });
    }

    const doc = {
      ...payload,
      appliedPaymentMethodIds: payload.appliedPaymentMethodIds.map(
        (id) => new ObjectId(id || "")
      ),
    };

    const product = await db
      .collection(collectionConst.vouchers)
      .insertOne(doc);
    res.status(201).json({ _id: product.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
