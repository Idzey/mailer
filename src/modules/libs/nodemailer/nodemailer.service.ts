import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import mailConfig from 'src/config/mail.config';

@Injectable()
export class NodemailerService {
  private transporter: nodemailer.Transporter;
  private defaultSender: string;

  constructor() {
    this.transporter = nodemailer.createTransport(mailConfig);
    this.defaultSender = mailConfig.auth?.user ?? 'no-reply@localhost';
  }

  formatFrom(from: string | null) {
    if (from && from.includes('@')) return from;

    if (from && from.trim().length > 0)
      return `${from} <${this.defaultSender}>`;

    return this.defaultSender;
  }

  async sendVirificationEmail(to: string, emailToken: string) {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.formatFrom(null),
        to,
        subject: 'Verify your email',
        text: `Please verify your email by clicking the link: ${process.env.API_URL}/auth/verify-email/${emailToken}`,
      };

      const data = await this.transporter.sendMail(mailOptions);

      console.log('Email sent: ' + data.response);
    } catch (error) {
      console.error('Error sending email: ', error);
    }
  }

  async sendMail(
    from: string,
    to: string,
    subject: string,
    text?: string,
    html?: string,
  ) {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.formatFrom(from),
        to,
        subject,
        text,
        html,
      };

      const data = await this.transporter.sendMail(mailOptions);

      console.log('Email sent: ' + data.response);
    } catch (error) {
      console.error('Error sending email: ', error);
    }
  }
}
