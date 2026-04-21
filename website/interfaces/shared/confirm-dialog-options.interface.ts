export interface IConfirmDialogOptions {
  header: string;
  message: string;
  acceptLabel?: string;
  acceptSeverity?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'contrast'
    | 'help';
  rejectLabel?: string;
  rejectSeverity?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'contrast'
    | 'help';
  accept: () => void;
  reject?: () => void;
}
