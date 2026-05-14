import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import type { LlmParsedResult } from 'src/types/llm.type';
import type { Task } from 'src/types/task.type';
import { LlmMessages } from './llm.messages';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  async parse(document: string): Promise<LlmParsedResult> {
    if (!document || document.trim() === '') {
      return { tasks: [], error: LlmMessages.emptyDocument };
    }

    try {
      const res = await axios.post(
        `http://${process.env.LLM_URL}/api/processing`,
        {
          document: document,
        },
      );

      if (res.status !== 200) {
        const errorMessage = LlmMessages.serviceReturnedStatus(res.status);
        this.logger.warn(errorMessage);
        return { tasks: [], error: errorMessage };
      }

      const data = res.data;

      if (!data?.result?.tasks || !Array.isArray(data.result.tasks)) {
        const errorMessage = LlmMessages.invalidTasksArray;
        this.logger.error(errorMessage);
        return { tasks: [], error: errorMessage };
      }

      const rawTasks: unknown[] = data.result.tasks;
      const tasks: Task[] = [];

      for (let i = 0; i < rawTasks.length; i++) {
        const item = rawTasks[i];

        if (!Array.isArray(item) || item.length !== 4) {
          this.logger.warn(LlmMessages.skippingInvalidTask(i));
          continue;
        }

        const [title, responsible, deadline, id] = item;

        if (typeof title !== 'string') {
          this.logger.warn(LlmMessages.titleNotString(i));
          continue;
        }

        let responsibleList: string[] = [];
        if (
          Array.isArray(responsible) &&
          responsible.every((r) => typeof r === 'string')
        ) {
          responsibleList = responsible;
        } else if (typeof responsible === 'string') {
          responsibleList = responsible
            .replace(';', ',')
            .split(',')
            .map((v) => v.trim());
        } else {
          this.logger.warn(LlmMessages.responsibleInvalid(i));
          continue;
        }

        if (typeof deadline !== 'string') {
          this.logger.warn(LlmMessages.deadlineNotString(i));
          continue;
        }

        if (typeof id !== 'string' && typeof id !== 'number') {
          this.logger.warn(LlmMessages.idInvalid(i));
          continue;
        }

        tasks.push({
          id: String(id),
          title: title.trim(),
          responsible: responsibleList,
          deadline: deadline.trim(),
        });
      }

      return { tasks, error: null };
    } catch (error) {
      const baseLogMessage = `${LlmMessages.requestError} ${error.message || error}`;
      this.logger.error(baseLogMessage, (error as Error).stack);

      let errorMessage: string = LlmMessages.internalProcessingError;

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const message =
            error.response.data?.message ||
            LlmMessages.serviceReturnedStatus(status);
          errorMessage = LlmMessages.serviceErrorResponse(status, message);
        } else if (error.request) {
          errorMessage = LlmMessages.noResponseFromService;
        } else {
          errorMessage = LlmMessages.requestSetupError;
        }
      }

      return { tasks: [], error: errorMessage };
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await axios.get(`http://${process.env.LLM_URL}`, {
        timeout: 1000,
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) return false;
      return false;
    }
  }
}
