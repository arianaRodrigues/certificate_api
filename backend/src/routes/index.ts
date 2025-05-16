import { Express } from "express";
import studentRouter from "./student.route";

const Routers = (app: Express): void => {
  app.use("/", studentRouter);
};

export default Routers;
