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

      const result = await studentsService.importFromXlsx(file.path);

      if (result.errors.length > 0) {
        res.status(207).json({
          message: "Importação concluída com alguns erros",
          successCount: result.successCount,
          errorCount: result.errors.length,
          errors: result.errors,
        });
      } else {
        res.status(200).json({
          message: "Todos os alunos foram importados com sucesso.",
          successCount: result.successCount,
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Erro interno ao importar." });
    }
  };
}

export default new StudentsController();
