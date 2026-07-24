import { LeagueRuleError } from "./errors.js";
import type { CreateProfileInput, Db, ProfileSession, RecoveryMailer, RecoverProfileInput } from "./types.js";
import { createRecoveryCode, hashRecoveryCode, normalizeEmail, profileSession, verifyRecoveryCode } from "./utils.js";

export async function createProfile(db: Db, input: CreateProfileInput = {}, mailer?: RecoveryMailer): Promise<ProfileSession & { recoveryEmailSent?: boolean }> {
  const email = normalizeEmail(input.email);
  if (!email) throw new LeagueRuleError("A valid email is required.");

  const existing = await db.profile.findUnique({ where: { email } });
  if (existing) {
    await requestRecoveryCode(db, { email }, mailer);
    return { profile: { id: existing.id, email: existing.email }, teams: [] };
  }

  const recoveryCode = createRecoveryCode();
  const profile = await db.profile.create({
    data: {
      email,
      recoveryCodeHash: await hashRecoveryCode(recoveryCode)
    }
  });

  let recoveryEmailSent = false;
  if (mailer) {
    try {
      recoveryEmailSent = await mailer.sendRecoveryCode(email, recoveryCode);
      if (recoveryEmailSent) {
        await db.profile.update({ where: { id: profile.id }, data: { recoveryEmailSentAt: new Date() } });
      }
    } catch (error) {
      console.error("Recovery email failed after profile creation.", error);
    }
  }

  return { profile: { id: profile.id, email: profile.email }, recoveryCode, recoveryEmailSent, teams: [] };
}

export async function requestRecoveryCode(db: Db, input: { email?: string } = {}, mailer?: RecoveryMailer, now = new Date()) {
  const email = normalizeEmail(input.email);
  if (!email) throw new LeagueRuleError("A valid email is required.");

  const profile = await db.profile.findUnique({ where: { email } });
  if (!profile || !mailer?.active || isRecoveryEmailCoolingDown(profile.recoveryEmailSentAt, now)) return { ok: true };

  const recoveryCode = createRecoveryCode();
  let sent = false;
  try {
    sent = await mailer.sendRecoveryCode(email, recoveryCode);
  } catch (error) {
    console.error("Recovery email re-issue failed.", error);
  }
  if (!sent) return { ok: true };

  await db.profile.update({
    where: { id: profile.id },
    data: {
      recoveryCodeHash: await hashRecoveryCode(recoveryCode),
      recoveryEmailSentAt: now
    }
  });

  return { ok: true };
}

function isRecoveryEmailCoolingDown(sentAt: Date | null | undefined, now: Date) {
  return sentAt ? now.getTime() - sentAt.getTime() < 15 * 60 * 1000 : false;
}

export async function recoverProfile(db: Db, input: RecoverProfileInput = {}): Promise<ProfileSession | null> {
  const email = normalizeEmail(input.email);
  const recoveryCode = input.recoveryCode?.trim().toUpperCase();
  if (!email || !recoveryCode) throw new LeagueRuleError("Email and recovery code are required.");

  const profile = await db.profile.findUnique({ where: { email } });
  const verification = profile ? await verifyRecoveryCode(recoveryCode, profile.recoveryCodeHash) : false;
  if (!profile || !verification) return null;
  if (verification === "legacy") {
    await db.profile.update({
      where: { id: profile.id },
      data: { recoveryCodeHash: await hashRecoveryCode(recoveryCode) }
    });
  }

  const session = await profileSession(db, profile.id);
  return session ? { ...session, recoveryCode } : null;
}
