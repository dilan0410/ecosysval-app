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

  // ==========================================
  // NUEVO: ENVIAR CORREO DE VERIFICACIÓN
  // ==========================================
  async enviarCorreoVerificacion(
    toEmail: string,
    nombre: string,
    token: string,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const verifyUrl = `${frontendUrl}/verificar?token=${token}`;

    const html = `
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
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 26px;
            }
            .header p {
              margin: 8px 0 0;
              color: #fbbf24;
              font-size: 14px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .content p {
              font-size: 16px;
              color: #4b5563;
              margin: 16px 0;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: #fbbf24;
              color: #111827 !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 700;
              font-size: 16px;
              margin: 20px 0;
            }
            .link-fallback {
              background: #f9fafb;
              padding: 16px;
              border-radius: 8px;
              font-size: 12px;
              color: #6b7280;
              word-break: break-all;
              margin-top: 20px;
            }
            .footer {
              padding: 20px 30px;
              background: #f9fafb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            .warning {
              background: #fef3c7;
              border-left: 3px solid #fbbf24;
              padding: 12px;
              border-radius: 4px;
              margin-top: 20px;
              font-size: 13px;
              text-align: left;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a Ecosysval!</h1>
              <p>Verifica tu email para empezar</p>
            </div>
            
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>
              <p>Gracias por registrarte en Ecosysval. Para activar tu cuenta y empezar a usar la plataforma, verifica tu email haciendo click en el botón:</p>
              
              <a href="${verifyUrl}" class="button">Verificar mi email</a>
              
              <div class="warning">
                Este link expira en 24 horas. Si no verificas tu email, no podrás iniciar sesión.
              </div>
              
              <div class="link-fallback">
                ¿No funciona el botón? Copia y pega este link en tu navegador:<br>
                <a href="${verifyUrl}">${verifyUrl}</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
              <p><strong>Ecosysval</strong> - Ecosistema empresarial</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const result = await this.resend.emails.send({
        from: `Ecosysval <${this.fromEmail}>`,
        to: toEmail,
        subject: 'Verifica tu email en Ecosysval',
        html,
      });

      if (result.error) {
        this.logger.error('Error al enviar email de verificación:', result.error);
        throw new Error(`Error: ${result.error.message}`);
      }

      this.logger.log(`Email de verificación enviado a ${toEmail}. ID: ${result.data?.id}`);
      return result.data;
    } catch (error) {
      this.logger.error('Error inesperado enviando verificación:', error);
      throw error;
    }
  }

    // ==========================================
    // NUEVO: ENVIAR CORREO DE RECUPERACIÓN DE CONTRASEÑA
    // ==========================================
    async enviarCorreoRecuperacion(
      toEmail: string,
      nombre: string,
      token: string,
    ) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

      const html = `
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
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 26px;
              }
              .header p {
                margin: 8px 0 0;
                color: #fbbf24;
                font-size: 14px;
              }
              .content {
                padding: 40px 30px;
                text-align: center;
              }
              .content p {
                font-size: 16px;
                color: #4b5563;
                margin: 16px 0;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: #fbbf24;
                color: #111827 !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 700;
                font-size: 16px;
                margin: 20px 0;
              }
              .link-fallback {
                background: #f9fafb;
                padding: 16px;
                border-radius: 8px;
                font-size: 12px;
                color: #6b7280;
                word-break: break-all;
                margin-top: 20px;
              }
              .footer {
                padding: 20px 30px;
                background: #f9fafb;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
              }
              .warning {
                background: #fef3c7;
                border-left: 3px solid #fbbf24;
                padding: 12px;
                border-radius: 4px;
                margin-top: 20px;
                font-size: 13px;
                text-align: left;
                color: #92400e;
              }
              .security-note {
                background: #fee2e2;
                border-left: 3px solid #dc2626;
                padding: 12px;
                border-radius: 4px;
                margin-top: 12px;
                font-size: 12px;
                text-align: left;
                color: #991b1b;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Recuperar Contraseña</h1>
                <p>Solicitud de restablecimiento</p>
              </div>
              
              <div class="content">
                <p>Hola <strong>${nombre}</strong>,</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Ecosysval. Haz click en el botón para crear una nueva contraseña:</p>
                
                <a href="${resetUrl}" class="button">Restablecer contraseña</a>
                
                <div class="warning">
                  <strong>Este link expira en 1 hora.</strong> Después tendrás que solicitar uno nuevo.
                </div>
                
                <div class="security-note">
                  <strong>¿No solicitaste este cambio?</strong> Ignora este correo. Tu contraseña seguirá siendo la misma. Nadie puede acceder a tu cuenta sin este link.
                </div>
                
                <div class="link-fallback">
                  ¿No funciona el botón? Copia y pega este link en tu navegador:<br>
                  <a href="${resetUrl}">${resetUrl}</a>
                </div>
              </div>
              
              <div class="footer">
                <p>Por seguridad, este link solo puede usarse UNA vez.</p>
                <p><strong>Ecosysval</strong> - Ecosistema empresarial</p>
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        const result = await this.resend.emails.send({
          from: `Ecosysval <${this.fromEmail}>`,
          to: toEmail,
          subject: 'Restablece tu contraseña de Ecosysval',
          html,
        });

        if (result.error) {
          this.logger.error(
            'Error al enviar email de recuperación:',
            result.error,
          );
          throw new Error(`Error: ${result.error.message}`);
        }

        this.logger.log(
          `Email de recuperación enviado a ${toEmail}. ID: ${result.data?.id}`,
        );
        return result.data;
      } catch (error) {
        this.logger.error(
          'Error inesperado enviando recuperación:',
          error,
        );
        throw error;
      }
    }

}