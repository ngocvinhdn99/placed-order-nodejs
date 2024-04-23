const { checkoutSchema } = require("../../schemas");
const { helper } = require("../../utils");

exports.checkout = async (req, res) => {
  try {
    const { value, error } = checkoutSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const isUnValid = await helper.checkUnValidSkuItem(req, res, value.items);
    if (isUnValid) return;

    res.status(201).json({ message: "Bạn có thể đặt đơn hàng này" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
