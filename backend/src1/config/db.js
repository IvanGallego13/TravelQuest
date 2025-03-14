// backend/src/config/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.POSTGRES_DB, // Nombre de la base de datos
    process.env.POSTGRES_USER, // Usuario de la base de datos
    process.env.POSTGRES_PASSWORD, // Contraseña de la base de datos
    {
        host: process.env.POSTGRES_HOST, // Host de la base de datos
        port: process.env.POSTGRES_PORT || 5432, // Puerto de PostgreSQL
        dialect: "postgres",
        logging: false, // Para evitar mostrar logs innecesarios en consola
        dialectOptions: {
            ssl: process.env.POSTGRES_SSL === "true" ? { require: true, rejectUnauthorized: false } : false,
        },
    }
);

export default sequelize;
