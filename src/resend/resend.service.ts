import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private resend: Resend;
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendMail(from: string, to: string, subject: string, text: string) {
    const mailOptions = {
      from,
      to,
      subject,
      html: text,
    };

    try {
      const response = await this.resend.emails.send(mailOptions);

      return response;
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
