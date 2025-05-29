import { Router } from "express";
import studentController from "../controllers/student.controller";
import { upload } from "../upload";

const studentRouter = Router();

studentRouter.post(
  "/upload",
  upload.single("file"),
  studentController.importFromXlsx
);

export default studentRouter;
