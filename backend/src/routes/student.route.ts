import { Router } from "express";
import studentController from "../controllers/student.controller";
import path from "path";
import multer from "multer";

const studentRouter = Router();

const upload = multer({
  dest: path.resolve(__dirname, "..", "..", "tmp"),
});

studentRouter.post(
  "/upload",
  upload.single("file"),
  studentController.importFromXlsx
);

export default studentRouter;
