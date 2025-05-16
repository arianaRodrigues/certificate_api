import { AppDataSource } from "../data-source";
import { Student } from "../entities/Students";
import * as xlsx from "node-xlsx";
import fs from "fs";
import certificateService from "./certificate.service";
class StudentService {
  async importFromXlsx(filePath: string): Promise<void> {
    const workSheets = xlsx.parse(fs.readFileSync(filePath));
    const rows = workSheets[0].data;

    const studentRepo = AppDataSource.getRepository(Student);

    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];

      if (!row || row.length === 0) continue;

      const [
        name,
        registration,
        publication_date,
        publication_page,
        certificate_number,
        second_issue,
        book,
        book_page,
        enrollment_start,
        enrollment_end,
        process_number,
      ] = row;

      const student = studentRepo.create({
        name: String(name).trim(),
        registration: String(registration).trim(),
      });

      // Cria o certificado associado
      const certificate = await certificateService.createCertificateFromRow({
        publication_date,
        publication_page,
        certificate_number,
        second_issue,
        book,
        book_page,
        enrollment_start,
        enrollment_end,
        process_number,
      });

      student.certificate = certificate;

      await studentRepo.save(student);
    }

    fs.unlinkSync(filePath);
  }
}

export default new StudentService();
