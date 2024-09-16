import express from "express";

import controllerProduct from "../src/controller/products";
import controllerRoute from "../src/controller/route";
import controllerPages from "../src/controller/pages";

const router = express.Router();

router.post("/create/product", controllerProduct.createProduct);
router.get("/get/products", controllerProduct.getAllProducts);
router.get("/get/product", controllerProduct.getProduct);
router.get("/get/productDetails", controllerProduct.getProductDetails);
router.put("/update/product", controllerProduct.updateProduct);
router.delete("/delete/product", controllerProduct.deleteProduct);
router.delete("/delete/productList", controllerProduct.deleteProductList);

// RouteApiProps routes
router.post("/create/route", controllerRoute.createRoute);
router.get("/get/route", controllerRoute.getRoutes);

// PagesProps routes
router.post("/create/page", controllerPages.createPage);
router.get("/get/page", controllerPages.getPages);
router.delete("/delete/page", controllerPages.deletePage);

export = router;
