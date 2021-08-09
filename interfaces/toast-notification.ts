export interface ToastNotification {
  type?: `primary` | `secondary` | `success` | `danger` | `warning` | `info` | `light` | `dark`;
  title?: string;
  delay?: number;
  content: string;
}
