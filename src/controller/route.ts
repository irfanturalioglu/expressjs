import { NextFunction, Request, Response } from "express";

import logging from "../config/logging";
import { Connect, Query } from "../config/mysql";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const NAMESPACE = "Routes";

interface RouteApiProps extends RowDataPacket {
  nodeGuid: string;
  path: string;
  routeType: string;
  appScreenName: string;
}

const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, "Inserting product");

  const { nodeGuid, path, routeType, appScreenName } = req.body as {
    nodeGuid: string;
    path: string;
    routeType: string;
    appScreenName: string;
    icon: string;
  };

  const query = `INSERT INTO route ( nodeGuid, path, routeType, appScreenName) VALUES ( ?, ?, ?, ?)`;
  const connection = (await Connect()).getConnection();

  try {
    const result = await Query(await connection, query, [
      nodeGuid,
      path,
      routeType,
      appScreenName,
    ]);

    res.status(200).json({
      message: "Product created",
      route: {
        nodeGuid,
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

const getRoutes = async (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, "Getting all routes");

  const query = `SELECT * FROM route`;
  const connection = (await Connect()).getConnection();
  try {
    const result = await Query<RouteApiProps[]>(await connection, query);

    res.status(200).json({
      routes: result,
    });
    logging.info(NAMESPACE, "Got all routes", result);
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

export default { createRoute, getRoutes };
