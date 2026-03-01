import { Sequelize } from "sequelize";
import { dbConnection } from "./db";




const sequelize = new Sequelize(dbConnection.development)

const syncOption = {
    alter: false, force: false
}

sequelize.sync(syncOption).then(() => {
    console.log("Database synced")
}).catch((error) => {
    console.log("Error syncing database: ", error)
})

export default sequelize