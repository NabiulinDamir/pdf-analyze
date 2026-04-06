import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class OcrService {
  
  async checkHealth(): Promise<boolean> {
    try {
      await axios.get(`http://${process.env.MARKER_URL}`, {
        timeout: 1000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}