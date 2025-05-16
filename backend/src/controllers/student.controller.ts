import { Request, Response } from "express";
import studentsService from "../services/students.service";

class StudentsController {
  importFromXlsx = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).send({ error: "Nenhum arquivo foi enviado." });
        return;
      }

      await studentsService.importFromXlsx(file.path);

      res
        .status(200)
        .json({ message: "Alunos e certificados importados com sucesso." });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Erro interno ao importar." });
    }
  };
}

export default new StudentsController();
