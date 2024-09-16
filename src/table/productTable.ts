import logging from "../config/logging";
import { Connect, Query } from "../config/mysql";

const NAMESPACE = "Database";

export const createTables = async () => {
  logging.info(NAMESPACE, "Creating tables...");

  const queries = [
    `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      image VARCHAR(255),
      styles JSON
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS productImageSliders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      productId INT NOT NULL,
      images JSON,
      paginationType VARCHAR(50),
      sliderStyles JSON,
      imageStyles JSON,
      FOREIGN KEY (productId) REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS productInfoModules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      productId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      favoriteRate DECIMAL(5, 2),
      likeRate DECIMAL(5, 2),
      reviewCount INT,
      styles JSON,
      isOnSale BOOLEAN,
      priceBefore DECIMAL(10, 2),
      saleBadgeText VARCHAR(255),
      saleBadgeIcon VARCHAR(255),
      productColors JSON,
      descriptionTitle VARCHAR(255),
      description TEXT,
      specificationsTitle VARCHAR(255),
      FOREIGN KEY (productId) REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS specifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      productInfoModulesId INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      value VARCHAR(255) NOT NULL,
      FOREIGN KEY (productInfoModulesId) REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    );
    `,

    `
    CREATE TABLE IF NOT EXISTS productModules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      productId INT NOT NULL,
      moduleType ENUM('productInfoModule', 'productImageSlider'),
      moduleId INT,
      FOREIGN KEY (productId) REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    );
    `,

    `CREATE TABLE IF NOT EXISTS pages (
      nodeGuid CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      pageName VARCHAR(255) NOT NULL UNIQUE,
      path VARCHAR(255) NOT NULL,
      routeType VARCHAR(50) NOT NULL,
      appScreenName VARCHAR(100) NOT NULL
  );`,

    `CREATE TABLE IF NOT EXISTS route (
      nodeGuid CHAR(36),
      path VARCHAR(255) NOT NULL,
      routeType VARCHAR(50) NOT NULL,
      appScreenName VARCHAR(100) NOT NULL,
      FOREIGN KEY (nodeGuid) REFERENCES pages(nodeGuid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
  );`,

    `CREATE TABLE IF NOT EXISTS category (
    nodeGuid CHAR(36),
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    styles JSON,
    FOREIGN KEY (nodeGuid) REFERENCES pages(nodeGuid)
      ON UPDATE CASCADE
      ON DELETE CASCADE
  );`,
  ];

  try {
    const pool = await Connect();
    const connection = pool.getConnection();

    try {
      await Promise.all(
        queries.map(async (query) => Query(await connection, query))
      );
      logging.info(NAMESPACE, "All tables created successfully.");
    } catch (error) {
      logging.error(
        NAMESPACE,
        "Error creating tables",
        (error as Error).message
      );
    } finally {
      logging.info(NAMESPACE, "Releasing connection.");
      (await connection).release();
    }
  } catch (error) {
    logging.error(NAMESPACE, "Connection error", (error as Error).message);
  }
};
