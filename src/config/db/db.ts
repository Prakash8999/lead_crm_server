import { Dialect } from "sequelize";
import { env } from "../env";

export const dbConnection = {

    development: {
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        host: env.DB_HOST,
        dialect: 'mysql' as Dialect,
        logging: console.log,
        raw: true
    }
}