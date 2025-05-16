import express from "express";
import Routers from "./routes";

const app = express();

app.use(express.json());

Routers(app);

export default app;
