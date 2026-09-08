import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.resolve("../.env")
});
import express from 'express'
import cors from "cors"
import sequelize from "./database/index.DB.js";
import { fileURLToPath } from "url";
import { router } from "./routes/index.routes.js";
import "./models/index.js";

// import swaggerUi from "swagger-ui-express";
// import swaggerSpec from "./swagger.js"
// import webpush from "web-push"

export const app = express();

export const __filename = fileURLToPath(import.meta.url);
export const _dirname = path.dirname(__filename);

// Models are registered before this call so Sequelize can create/update their tables on startup.
sequelize.sync()
    .then(() => {
        console.log("Banco sincronizado");
    });

app.use(cors())

// API clients send JSON; the limit prevents unexpectedly large request bodies from reaching services.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static(path.join(_dirname, "views")));

app.use(router);
