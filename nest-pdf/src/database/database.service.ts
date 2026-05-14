import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { Task } from 'src/types/task.type';
import { DbMessages } from './db.messages';

type DocumentRecord = {
  id: string;
  file?: string;
  parsed?: string;
  processed?: Task[];
  error?: string;
  updated: Date;
};

@Injectable()
export class DatabaseService {
  private readonly dbPath = path.join(process.cwd(), 'data');
  private readonly filePath = path.join(this.dbPath, 'documents.json');

  constructor() {
    this.ensureDbDirExists();
    this.ensureFileExists();
  }

  private ensureDbDirExists(): void {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
  }

  private ensureFileExists(): void {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]), 'utf8');
    }
  }

  private readData(): DocumentRecord[] {
    const content = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(content);
  }

  private writeData(data: DocumentRecord[]): void {
    const serializableData = data.map((doc) => ({
      ...doc,
      updated: new Date().toISOString(),
    }));
    fs.writeFileSync(
      this.filePath,
      JSON.stringify(serializableData, null, 2),
      'utf8',
    );
  }

  addFileToDB(id: string, file: Express.Multer.File) {
    const data = this.readData();
    const existingIndex = data.findIndex((doc) => doc.id === id);

    if (existingIndex !== -1 && data[existingIndex].error) {
      data[existingIndex] = { id: id, updated: new Date() };
    } else {
      data.push({
        id,
        file: file.path,
        updated: new Date(),
      });
    }

    this.writeData(data);
  }

  addParsedFileToDB(
    id: string,
    parsed: { output: string | null; error: string | null },
  ) {
    const data = this.readData();
    const existingIndex = data.findIndex((doc) => doc.id === id);

    if (existingIndex === -1) {
      return;
    }

    const doc = data[existingIndex];

    if (parsed.error) {
      doc.parsed = '';
      doc.error = parsed.error;
    } else if (parsed.output !== null && parsed.output !== undefined) {
      doc.parsed = parsed.output;
    } else {
      doc.parsed = '';
      doc.error = DbMessages.missingOutputAndError;
    }

    doc.updated = new Date();
    this.writeData(data);
  }

  addProcessedFileToDB(id: string, processed: Task[]) {
    const data = this.readData();
    const existingIndex = data.findIndex((doc) => doc.id === id);

    if (existingIndex !== -1) {
      data[existingIndex].processed = processed;
      data[existingIndex].error = undefined; // сброс ошибки
      data[existingIndex].updated = new Date();
    }

    this.writeData(data);
  }

  addErrorToDB(id: string, error: string) {
    const data = this.readData();
    const existingIndex = data.findIndex((doc) => doc.id === id);

    if (existingIndex !== -1) {
      data[existingIndex].error = error;
      data[existingIndex].updated = new Date();
    }

    this.writeData(data);
  }

  getFromDB(id: string) {
    const data = this.readData();
    const document = data.find((doc) => doc.id === id);

    if (!document) {
      return {
        id: null,
        isReady: true,
        processed: null,
        error: DbMessages.documentNotFound,
      };
    }

    document.updated = new Date(document.updated);

    if (document.error) {
      return {
        id: document.id,
        isReady: true,
        processed: null,
        error: document.error,
      };
    }

    if (!document.processed) {
      return {
        id: document.id,
        isReady: false,
        processed: [],
        error: null,
      };
    }

    return {
      id: document.id,
      isReady: true,
      processed: document.processed,
      error: null,
    };
  }

  delete(id: string) {
    const data = this.readData();
    const filteredData = data.filter((doc) => doc.id !== id);
    this.writeData(filteredData);
  }
}
