import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";

import config from "./config";

const params = {
  user: config.mysql.user,
  password: config.mysql.pass,
  host: config.mysql.host,
  database: config.mysql.database,
  namedPlaceholders: true,
};

const Connect = async () => {
  try {
    const connection = mysql.createPool(params);
    console.log("Connected to the MySQL database.");
    return connection;
  } catch (error) {
    console.error("Error connecting to the MySQL database:", error);
    throw error;
  }
};

const Query = async <T extends RowDataPacket[] | ResultSetHeader>(
  connection: mysql.PoolConnection,
  query: string,
  params: any[] = []
): Promise<T> => {
  try {
    const [result] = await connection.execute<T>(query, params);
    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    connection.release();
  }
};

export { Connect, Query };
