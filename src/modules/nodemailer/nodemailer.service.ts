import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import mailConfig from 'src/config/mail.config';

@Injectable()
export class NodemailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(mailConfig);
  }

  async sendVirificationEmail(to: string, emailToken: string) {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: mailConfig.auth.user,
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

  async sendMail(from: string, to: string, subject: string, text: string) {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from,
        to,
        subject,
        text,
      };

      const data = await this.transporter.sendMail(mailOptions);

      console.log('Email sent: ' + data.response);
    } catch (error) {
      console.error('Error sending email: ', error);
    }
  }
}
