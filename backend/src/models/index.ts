import User from "./User.js";
import Chat from "./Chat.js"

User.hasMany(Chat,{
    foreignKey:"userId",
    onDelete:"CASCADE"
});

export {
    User,
};