export interface ToastNotification {
  type?: `primary` | `secondary` | `success` | `danger` | `warning` | `info`;
  title: string;
  delay?: number;
  content?: string;
  link?: string;
  linkName?: string;
}
