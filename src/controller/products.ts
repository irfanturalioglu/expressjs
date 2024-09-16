import { NextFunction, Request, Response } from "express";

import logging from "../config/logging";
import { Connect, Query } from "../config/mysql";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import {
  productImageSlider,
  ProductInfoModuleBase,
  product as productType,
} from "../types/generalType";

interface Product extends RowDataPacket {
  id: number;
  name: string;
  price: number;
  image: string;
  styles: string;
}

interface Specification extends RowDataPacket {
  title: string;
  value: string;
}

const NAMESPACE = "Products";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logging.info(NAMESPACE, "Inserting product");

  const { name, price, image, styles } = req.body as {
    name: string;
    price: number;
    image: string;
    styles: JSON;
  };

  const query = `INSERT INTO products ( name, price, image, styles) VALUES ( ?, ?, ?, ?)`;
  const querySpecifications = `INSERT INTO specifications ( productInfoModulesId, title, value) VALUES ( ?, ?, ?)`;
  const connection = (await Connect()).getConnection();

  try {
    const result = await Query(await connection, query, [
      name,
      price,
      image,
      JSON.stringify(styles),
    ]);

    res.status(200).json({
      message: "Product created",
      product: {
        name,
        price,
        image,
        styles,
      },
    });
    logging.info(NAMESPACE, "Product created", result);
  } catch (error) {
    logging.error(NAMESPACE, (error as Error).message, error);

    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  } finally {
    logging.info(NAMESPACE, "Closing connection.");
    (await connection).release();
  }
};

const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logging.info(NAMESPACE, "Getting all products.");

  const query = "SELECT * FROM products";
  const connection = (await Connect()).getConnection();

  try {
    const result = await Query(await connection, query);

    res.status(200).json({
      products: result,
    });
    logging.info(NAMESPACE, "Products retrieved", result);
  } catch (error) {
    logging.error(NAMESPACE, (error as Error).message, error);

    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  } finally {
    logging.info(NAMESPACE, "Closing connection.");
    (await connection).release();
  }
};

const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, "Getting product by ID.");

  const productId = req.query.id;

  const query = `SELECT * FROM products WHERE id = ?`;
  const connection = (await Connect()).getConnection();

  if (!productId) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  try {
    const result = await Query<Product[]>(await connection, query, [productId]);

    if (result.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      product: result,
    });
    logging.info(NAMESPACE, "Product retrieved", result);
  } catch (error) {
    logging.error(NAMESPACE, (error as Error).message, error);

    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  } finally {
    logging.info(NAMESPACE, "Closing connection.");
    (await connection).release();
  }
};

const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logging.info(NAMESPACE, "Getting product details.");

  const productId = req.query.id;
  const connection = (await Connect()).getConnection();

  if (!productId) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  try {
    const productQuery = `SELECT * FROM products WHERE id =  ?`;
    const productResults = await Query<Product[]>(
      await connection,
      productQuery,
      [productId]
    );

    if (productResults.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const sliderQuery = `SELECT * FROM productImageSliders WHERE productId = ?`;
    const sliderResults = await Query<productImageSlider[]>(
      await connection,
      sliderQuery,
      [productId]
    );

    const specificationQuery = `SELECT * FROM specifications WHERE productInfoModulesId = ?`;
    const specificationResults = await Query<Specification[]>(
      await connection,
      specificationQuery,
      [productId]
    );

    return res.status(200).json({
      data: {
        product: productResults[0],
        slider: sliderResults[0],
        specifications:
          specificationResults.length > 0 ? specificationResults : null,
      },
    });
  } catch (error) {
    logging.error(NAMESPACE, (error as Error).message, error);

    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logging.info(NAMESPACE, "Updating product");

  const { id, name, price, image, styles } = req.body as {
    id: number;
    name: string;
    price: number;
    image: string;
    styles: JSON;
  };

  const query = `UPDATE products SET name = ?, price = ?, image = ?, styles = ? WHERE id = ?`;
  const connection = (await Connect()).getConnection();

  try {
    const result = await Query(await connection, query, [
      name,
      price,
      image,
      JSON.stringify(styles),
      id,
    ]);

    res.status(200).json({
      message: "Product updated successfully",
      product: {
        id,
        name,
        price,
        image,
        styles,
      },
    });
    logging.info(NAMESPACE, "Product updated", result);
  } catch (error) {
    logging.error(NAMESPACE, (error as Error).message, error);

    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  } finally {
    logging.info(NAMESPACE, "Closing connection.");
    (await connection).release();
  }
};

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logging.info(NAMESPACE, "Deleting product");

  const { id } = req.body as {
    id: number;
  };

  const query = `DELETE FROM products WHERE id = ?`;
  const querySlider = `DELETE FROM productImageSliders WHERE productId = ?`;
  const querySpecifications = `DELETE FROM specifications WHERE productInfoModulesId = ?`;

  const connection = (await Connect()).getConnection();

  try {
    await Query(await connection, querySlider, [id]);
    await Query(await connection, querySpecifications, [id]);
    const result = await Query(await connection, query, [id]);

    res.status(200).json({
      message: "Product deleted successfully",
      product: {
        id,
      },
    });
    logging.info(NAMESPACE, "Product deleted", result);
  } catch (error) {
    logging.error(NAMESPACE, (error as Error).message, error);

    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  } finally {
    logging.info(NAMESPACE, "Closing connection.");
    (await connection).release();
  }
};

const deleteProductList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logging.info(NAMESPACE, "Deleting product");
  const { id } = req.body as {
    id: number[];
  };

  // ID tiplerinin kontrolü
  if (!Array.isArray(id) || id.some((id) => typeof id !== "number")) {
    return res.status(400).json({
      message: "Invalid input: ids should be an array of numbers.",
    });
  }

  const placeholders = id.map(() => "?").join(",");

  const query = `DELETE FROM products WHERE id IN (${placeholders})`;
  const querySlider = `DELETE FROM productImageSliders WHERE productId IN (${placeholders})`;
  const querySpecifications = `DELETE FROM specifications WHERE productInfoModulesId IN (${placeholders})`;

  const connection = (await Connect()).getConnection();

  try {
    // productImageSliders tablosundan silme işlemi
    const sliderResult = await Query(await connection, querySlider, id);
    if (sliderResult) {
      logging.info(
        NAMESPACE,
        `Deleted ${sliderResult} sliders from productImageSliders table.`,
        sliderResult
      );
    } else {
      logging.warn(
        NAMESPACE,
        "No sliders found for the provided product IDs.",
        sliderResult
      );
    }

    // specifications tablosundan silme işlemi
    const specificationsResult = await Query<ResultSetHeader>(
      await connection,
      querySpecifications,
      id
    );

    if (specificationsResult) {
      logging.info(
        NAMESPACE,
        `Deleted ${specificationsResult} specifications.`,
        specificationsResult
      );
    } else {
      logging.warn(
        NAMESPACE,
        "No specifications found for the provided product IDs.",
        specificationsResult
      );
    }

    // products tablosundan silme işlemi
    const productResult = await Query<Product[]>(await connection, query, id);
    if (productResult) {
      logging.info(
        NAMESPACE,
        `Deleted ${productResult} products from products table.`,
        productResult
      );
    } else {
      logging.warn(
        NAMESPACE,
        "No products found for the provided IDs.",
        productResult
      );
    }

    return res.status(200).json({
      message: `${productResult} products and related data deleted successfully`,
      deleteList: id,
    });
  } catch (error) {
    (await connection).rollback();
    logging.error(NAMESPACE, (error as Error).message, error);

    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  } finally {
    (await connection).release();
    logging.info(NAMESPACE, "Closing connection.");
  }
};

export default {
  createProduct,
  getAllProducts,
  getProduct,
  getProductDetails,
  updateProduct,
  deleteProduct,
  deleteProductList,
};
