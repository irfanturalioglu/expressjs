import { NextFunction, Request, Response } from "express";

import logging from "../config/logging";
import { Connect, Query } from "../config/mysql";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const NAMESPACE = "Category";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logging.info(NAMESPACE, "Inserting product");

  const { name, icon, styles } = req.body as {
    name: string;
    icon: string;
    styles: JSON;
  };

  const query = `INSERT INTO products ( name, price, image, styles) VALUES ( ?, ?, ?, ?)`;
  const querySpecifications = `INSERT INTO specifications ( productInfoModulesId, title, value) VALUES ( ?, ?, ?)`;
  const connection = (await Connect()).getConnection();

  try {
    const result = await Query(await connection, query, [
      name,
      icon,
      JSON.stringify(styles),
    ]);

    res.status(200).json({
      message: "Product created",
      product: {
        name,
        icon,
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
