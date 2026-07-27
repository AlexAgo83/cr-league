import nodemailer from "nodemailer";
import type { ApiConfig } from "./config.js";

export type RecoveryMailer = {
  active: boolean;
  sendRecoveryCode(email: string, code: string): Promise<boolean>;
  sendPlanReminder?(email: string, input: { leagueName: string; teamName: string; grandPrixName: string; season: number; round: number }): Promise<boolean>;
};

export function createRecoveryMailer(config: Pick<ApiConfig, "smtp">, log: Pick<Console, "info" | "error"> = console): RecoveryMailer {
  const { host, port, user, pass, from } = config.smtp;
  if (!host || !user || !pass || !from) {
    return {
      active: false,
      async sendRecoveryCode(email) {
        log.info(`Recovery email skipped; SMTP is not configured for ${email}.`);
        return false;
      },
      async sendPlanReminder(email) {
        log.info(`Plan reminder skipped; SMTP is not configured for ${email}.`);
        return false;
      }
    };
  }

  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  return {
    active: true,
    async sendRecoveryCode(email, code) {
      await transport.sendMail({
        from,
        to: email,
        subject: "CR League recovery code",
        text: `Your CR League recovery code is ${code}.\n\nIf you requested a new code, your previous code no longer works.`
      });
      return true;
    },
    async sendPlanReminder(email, input) {
      await transport.sendMail({
        from,
        to: email,
        subject: `CR League reminder - ${input.leagueName}`,
        text: `Your race plan is still pending for ${input.leagueName}, season ${input.season}, GP ${input.round} (${input.grandPrixName}).\n\nOpen CR League and lock your plan when ready.`
      });
      return true;
    }
  };
}
