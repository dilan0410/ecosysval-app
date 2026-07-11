// backend/src/mailer/mailer.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import { CapacitacionDto } from '../contact/dto/capacitacion.dto';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private resend: Resend;
  private readonly fromEmail: string;
  private readonly destinoEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      this.logger.error('RESEND_API_KEY no está configurada en el .env');
      throw new Error('RESEND_API_KEY es obligatoria');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = process.env.MAIL_FROM || 'onboarding@resend.dev';
    this.destinoEmail = process.env.MAIL_DESTINO || 'test@test.com';

    this.logger.log('MailerService inicializado con Resend');
  }

  // ==========================================
  // ENVIAR CORREO DE CAPACITACIÓN
  // ==========================================
  async enviarCorreoCapacitacion(data: CapacitacionDto) {
    const html = this.buildCapacitacionHtml(data);

    try {
      const result = await this.resend.emails.send({
        from: `Ecosysval <${this.fromEmail}>`,
        to: this.destinoEmail,
        subject: `Nueva solicitud de capacitación: ${data.interes}`,
        html,
        replyTo: data.email, // Para poder responder al usuario directamente
      });

      if (result.error) {
        this.logger.error('Error al enviar con Resend:', result.error);
        throw new InternalServerErrorException(
          `Error al enviar correo: ${result.error.message}`,
        );
      }

      this.logger.log(
        `Correo de capacitación enviado. ID: ${result.data?.id}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Error inesperado al enviar correo:', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo. Intenta de nuevo más tarde.',
      );
    }
  }

  // ==========================================
  // TEMPLATE HTML PROFESIONAL
  // ==========================================
  private buildCapacitacionHtml(data: CapacitacionDto): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f5f7fa;
            }
            .container {
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #071326 0%, #1a2a44 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 8px 0 0;
              color: #fbbf24;
              font-size: 14px;
            }
            .content {
              padding: 30px;
            }
            .field {
              margin-bottom: 15px;
              padding: 12px;
              background: #f9fafb;
              border-left: 3px solid #fbbf24;
              border-radius: 4px;
            }
            .field-label {
              font-size: 11px;
              text-transform: uppercase;
              color: #6b7280;
              font-weight: 600;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .field-value {
              font-size: 15px;
              color: #111827;
              font-weight: 500;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              background: #fbbf24;
              color: #111827;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              margin-left: 8px;
            }
            .footer {
              padding: 20px 30px;
              background: #f9fafb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nueva Solicitud de Capacitación</h1>
              <p>${data.interes}<span class="badge">Nuevo</span></p>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="field-label">Nombre completo</div>
                <div class="field-value">${data.nombre} ${data.apellido}</div>
              </div>
              
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value"><a href="mailto:${data.email}">${data.email}</a></div>
              </div>
              
              <div class="field">
                <div class="field-label">Teléfono</div>
                <div class="field-value">${data.telefono}</div>
              </div>
              
              <div class="field">
                <div class="field-label">Estado</div>
                <div class="field-value">${data.estado}</div>
              </div>
              
              ${data.empresa ? `
              <div class="field">
                <div class="field-label">Empresa</div>
                <div class="field-value">${data.empresa}</div>
              </div>` : ''}
              
              ${data.cargo ? `
              <div class="field">
                <div class="field-label">Cargo</div>
                <div class="field-value">${data.cargo}</div>
              </div>` : ''}
              
              ${data.mensaje ? `
              <div class="field">
                <div class="field-label">Mensaje</div>
                <div class="field-value">${data.mensaje}</div>
              </div>` : ''}
            </div>
            
            <div class="footer">
              <p>Este correo fue enviado desde el formulario de contacto de <strong>Ecosysval</strong></p>
              <p>Puedes responder directamente a este correo para contactar al solicitante.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}