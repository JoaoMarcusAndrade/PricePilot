import { DataTypes, Model } from "sequelize";
import sequelize from "../database/index.DB.js";


class Chat extends Model { }


Chat.init({
    
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    name: {
        type: DataTypes.TEXT,
        allowNull: false
    }

}, {
    sequelize,
    tableName: "Chats"
})


export default Chat;