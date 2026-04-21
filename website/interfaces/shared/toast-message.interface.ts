export interface IToastMessage {
  id: number;
  severity: 'success' | 'info' | 'warn' | 'error' | 'contrast';
  summary: string;
  detail: string;
  life?: number;
  closable?: boolean;
}
