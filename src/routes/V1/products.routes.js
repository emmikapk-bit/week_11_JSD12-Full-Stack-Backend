import { Router } from "express";
import { products } from "../../fakeData/fakeProducts.js";

export const router = Router();

//find all Products
router.get("/", (req, res) => {
  res.json(products);
});

// find Product id
router.get("/:id", (req, res) => {
  const product = products.find((p) => String(p.id) === String(req.params.id));
  if (!product) {
    return res.status(404).json({ error: "product not found" });
  }
  res.json(product);
});

/// Create new Product
router.post("/", (req, res) => {
  const { name, price, Qty } = req.body || {};

  if (!name || !price) {
    return res.status(400).json("name and price are required");
  }

  const nextId = String(
    (products.reduce((max, p) => Math.max(max, Number(p.id)), 0) || 0) + 1,
  );

  const newProduct = { id: nextId, name, price, Qty: Qty || 0 };

  products.push(newProduct);
  return res.status(201).json(newProduct);
});

//Update Product
router.put("/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: "product not found" });
  }
  const { name, price, Qty } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "name and price are required" });
  }

  product.name = name;
  product.price = price;
  product.Qty = Qty;

  res.status(200).json(product);
});

// delete Product
router.delete("/:id", (req, res) => {
  const product = products.findIndex((p) => p.id === req.params.id);

  if (product === -1) {
    return res.status(404).json({ error: "product not found" });
  }

  const deletedProduct = products.splice(product, 1);

  res.status(200).json({
    message: "Product deleted successfully",
    deletedProduct: deletedProduct[0],
  });
});
