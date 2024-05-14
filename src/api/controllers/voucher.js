const { collectionConst } = require("../../config");
const { voucherSchema } = require("../../schemas");
const { ObjectId } = require("mongodb");
const { helper } = require("../../utils");

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

    const isValidDateISO8601 = helper.isValidDateISO8601(payload.expireAt);
    if (!isValidDateISO8601) {
      return res
        .status(400)
        .json({ message: "Kiểu dữ liệu expireAt không hợp lệ" });
    }

    const doc = {
      ...payload,
      expireAt: new Date(payload.expireAt),
    };

    const product = await db
      .collection(collectionConst.vouchers)
      .insertOne(doc);
    res.status(201).json({ _id: product.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
