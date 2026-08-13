import { DataTypes, Model } from "sequelize";
import sequelize from "../database/index.DB.js";


class User extends Model {
    declare id: number;
    declare name: string;
    declare picture: string;
    declare email: string;
    declare telephone: string;
    declare pass: string;
}


User.init({

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    picture: {
        type: DataTypes.TEXT, //url da imagem subida pro servidor e salva em disco
        allowNull: true
    },

    email: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            isEmail: {
                msg: "O formato inserido é inválido." //mensagem de erro caso não seja um email
            }
        }
    },

    telephone: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            is: {
                // Aceita fixos (10 dígitos) ou celulares (11 dígitos) com DDD
                args: /^[1-9]{2}9?[0-9]{8}$/,
                msg: "O telefone deve conter apenas números com o DDD (ex: 11999998888)."
            }
        }
    },

    pass: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            is: {
                args: /^\$2[aby]\$/,
                msg: "O pass_hash deve ser um hash bcrypt válido."
            }
        }
    },


}, {
    sequelize,
    tableName: "Users"
})


export default User;