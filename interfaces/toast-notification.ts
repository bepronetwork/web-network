export type ToastNotificationType = `primary` | `secondary` | `success` | `danger` | `warning` | `info`;

export interface ToastNotification {
  type?: ToastNotificationType;
  title: string;
  delay?: number;
  content?: string;
  link?: string;
  linkName?: string;
  id?: number;
}
