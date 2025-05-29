import { AppDataSource } from "../data-source";
import { Student } from "../entities/Students";
import * as xlsx from "node-xlsx";
import fs from "fs";
import certificateService from "./certificate.service";
import { VerifyIfStudentIsValid } from "../utils/VerifyIfStudentIsValid";
import { verifyIfStudentIsInSameBookOrPage } from "../utils/VerifyIfStudentIsInSameBookOrPage";
import { parseExcelDate } from "../utils/parseExcelDate";

class StudentService {
  async importFromXlsx(filePath: string): Promise<{
    errors: string[];
    successCount: number;
  }> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }

    const workSheets = xlsx.parse(fs.readFileSync(filePath));
    const rows = workSheets[0].data;

    const studentRepo = AppDataSource.getRepository(Student);
    const newStudents: { name: string; registration: string; row: any[] }[] =
      [];

    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const [name, registration] = row;
      if (!name || !registration) continue;

      newStudents.push({
        name: String(name).trim(),
        registration: String(registration).trim(),
        row,
      });
    }

    const existingRecords = await studentRepo.find({
      relations: { certificate: true },
    });

    const alreadyRegistered = existingRecords.map((student) => ({
      name: student.name.trim(),
      registration: student.registration.trim(),
    }));

    const { validStudents, errors: duplicateErrors } = VerifyIfStudentIsValid(
      newStudents,
      alreadyRegistered
    );

    const preparedExisting = existingRecords.map((student) => ({
      name: student.name.trim(),
      registration: student.registration,
      book: student.certificate?.book?.trim() ?? "",
      book_page: student.certificate?.book_page?.trim() ?? "",
    }));

    const preparedNew = newStudents.map(({ name, registration, row }) => ({
      name: name.trim(),
      registration: registration,
      book: String(row[6] || "").trim(),
      book_page: String(row[7] || "").trim(),
    }));

    const { errors: bookPageErrors, invalidKeys: bookPageInvalidKeys } =
      verifyIfStudentIsInSameBookOrPage(preparedNew, preparedExisting);

    const allErrors = [...duplicateErrors, ...bookPageErrors];

    // Criar conjunto de chaves inválidas
    const invalidKeys = new Set<string>();

    // Adicionar chaves inválidas dos duplicados
    duplicateErrors.forEach((error) => {
      const match = error.match(/student "(.+?)"/i);
      if (match) {
        const studentName = match[1];
        const student = newStudents.find((s) => s.name === studentName);
        if (student) {
          invalidKeys.add(`${student.name}|${student.registration}`);
        }
      }
    });

    bookPageInvalidKeys.forEach((key) => invalidKeys.add(key));

    // Processar apenas alunos válidos
    let successCount = 0;
    for (const studentData of newStudents) {
      const fullKey = `${studentData.name}|${studentData.registration}`;

      if (invalidKeys.has(fullKey)) {
        continue;
      }

      const [
        _name,
        _registration,
        publication_date,
        publication_page,
        certificate_number,
        second_issue,
        book,
        book_page,
        enrollment_start,
        enrollment_end,
        process_number,
      ] = studentData.row;

      try {
        const student = studentRepo.create({
          name: String(_name).trim(),
          registration: String(_registration).trim(),
        });

        const certificate = await certificateService.createCertificateFromRow({
          publication_date: parseExcelDate(publication_date),
          publication_page,
          certificate_number,
          second_issue,
          book,
          book_page,
          enrollment_start: parseExcelDate(enrollment_start),
          enrollment_end: parseExcelDate(enrollment_end),
          process_number,
        });

        student.certificate = certificate;
        await studentRepo.save(student);
        successCount++;
      } catch (error) {
        console.error(`Erro ao salvar aluno ${_name}:`, error);
        allErrors.push(`Erro ao processar aluno ${_name}: ${error.message}`);
      }
    }

    fs.unlinkSync(filePath);

    return { errors: allErrors, successCount };
  }
}

export default new StudentService();
