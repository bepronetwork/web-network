import sgMail, { ClientResponse } from "@sendgrid/mail";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();

export class EmailService {
  constructor(private readonly apiKey: string, private readonly from: string) {
    sgMail.setApiKey(apiKey);
  }

  async sendEmail(subject: string, to: string, content: string): Promise<ClientResponse> {
    return new Promise((resolve, reject) => {
      sgMail.send({
        from: this.from,
        to,
        subject,
        text: subject,
        html: content
      }, false, (error, result) => {
        if (error)
          reject(error);
        else
          resolve(result[0]);
      });
    });
  }
}

export const emailService = new EmailService(serverRuntimeConfig?.email?.apiKey, serverRuntimeConfig?.email?.from);