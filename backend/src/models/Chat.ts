import { DataTypes, Model } from "sequelize";
import sequelize from "../database/index.DB.js";

class Chat extends Model {
    declare id: number;
    declare userId: number;
    declare name: string;
    declare content: string;
}

Chat.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "Chats"
    }
);

export default Chat;