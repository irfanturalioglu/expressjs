import { NextFunction, Request, Response } from "express";

import logging from "../config/logging";
import { Connect, Query } from "../config/mysql";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const NAMESPACE = "Pages";

interface PagesProps extends RowDataPacket {
  nodeGuid: string;
  pageName: string;
  path: string;
  routeType: string;
  appScreenName: string;
}

const createPage = async (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, "Inserting product");

  const { pageName, path, routeType, appScreenName } = req.body as {
    pageName: string;
    path: string;
    routeType: string;
    appScreenName: string;
  };

  const query = `INSERT INTO pages ( nodeGuid, pageName, path, routeType, appScreenName) VALUES ( UUID(), ?, ?, ?, ?)`;
  const connection = (await Connect()).getConnection();

  try {
    const result = await Query(await connection, query, [
      pageName,
      path,
      routeType,
      appScreenName,
    ]);

    res.status(200).json({
      message: "Product created",
      route: {
        pageName,
        path,
        routeType,
        appScreenName,
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

const getPages = async (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, "Getting all pages");

  const query = `SELECT * FROM pages`;
  const connection = (await Connect()).getConnection();
  try {
    const result = await Query<PagesProps[]>(await connection, query);

    res.status(200).json({
      pages: result,
    });
    logging.info(NAMESPACE, "Get all pages", result);
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

const deletePage = async (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, "Deleting page");

  const { nodeGuid } = req.body as {
    nodeGuid: string;
  };

  const query = `DELETE FROM pages WHERE nodeGuid = ?`;

  const connection = (await Connect()).getConnection();

  try {
    const result = await Query(await connection, query, [nodeGuid]);

    res.status(200).json({
      message: "Page deleted successfully",
      page: {
        nodeGuid,
      },
    });
    logging.info(NAMESPACE, "Page deleted", result);
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

export default { createPage, getPages, deletePage };
