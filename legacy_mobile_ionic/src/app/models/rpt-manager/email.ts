import { Parameter } from './parameter';

export interface Email {
  Subject: string;
  Body: string;
  Recipients: string[];
  Parameters: Parameter[];
}