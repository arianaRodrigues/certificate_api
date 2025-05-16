import express from "express";
// import NotificationRouter from "./notification-router";

const app = express();

app.use(express.json());

// NotificationRouter(app);

export default app;
