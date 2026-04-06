import { Injectable } from '@nestjs/common';
import axios from 'axios';


@Injectable()
export class LlmService {

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