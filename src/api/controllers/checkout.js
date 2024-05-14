const { checkoutSchema } = require("../../schemas");
const { helper } = require("../../utils");
const { collectionConst } = require("../../config");
const { ObjectId } = require("mongodb");

exports.checkout = async (req, res) => {
  try {
    const { value, error } = checkoutSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const selectedCart = await db.collection(collectionConst.carts).findOne({
      _id: new ObjectId(req.body.cartId),
    });
    if (!selectedCart) {
      return res.status(400).json({ message: "Cart item không tìm thấy" });
    }

    const skuListInCart = selectedCart.items.map((i) => ({
      ...i,
      warehouseId: selectedCart.warehouseId,
    }));

    const isUnValid = await helper.checkUnValidSkuItem(req, res, skuListInCart);
    if (isUnValid) return;

    res.status(201).json({ message: "Bạn có thể đặt đơn hàng này" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
