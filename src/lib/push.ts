import crypto from "crypto";
import { prisma } from "./prisma";

function toBase64URL(buf: Buffer): string {
  return buf.toString("base64url");
}

function fromBase64URL(str: string): Buffer {
  return Buffer.from(str, "base64url");
}

function extractRawPublicKey(spkiDer: Buffer): Buffer {
  return spkiDer.subarray(spkiDer.length - 65);
}

function createVAPIDJWT(audience: string): string {
  const privateKeyDER = fromBase64URL(process.env.VAPID_PRIVATE_KEY!);
  const header = JSON.stringify({ alg: "ES256", typ: "JWT" });
  const payload = JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 86400,
    sub: process.env.NEXT_PUBLIC_APP_URL || "mailto:admin@familyhub.app",
  });
  const headerB64 = toBase64URL(Buffer.from(header));
  const payloadB64 = toBase64URL(Buffer.from(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const privateKey = crypto.createPrivateKey({
    key: privateKeyDER,
    format: "der",
    type: "pkcs8",
  });
  const signature = crypto.sign("sha256", Buffer.from(signingInput), privateKey);
  return `${signingInput}.${toBase64URL(signature)}`;
}

function hkdfExtract(salt: Buffer, ikm: Buffer): Buffer {
  return crypto.createHmac("sha256", salt).update(ikm).digest();
}

function hkdfExpand(prk: Buffer, info: Buffer, length: number): Buffer {
  const blocks: Buffer[] = [];
  let T = Buffer.alloc(0);
  for (let i = 1; Buffer.concat(blocks).length < length; i++) {
    T = crypto.createHmac("sha256", prk).update(Buffer.concat([T, info, Buffer.from([i])])).digest();
    blocks.push(T);
  }
  return Buffer.concat(blocks).slice(0, length);
}

function encryptPayload(
  payload: Buffer,
  p256dh: Buffer,
  auth: Buffer,
): { salt: Buffer; serverPublic: Buffer; ciphertext: Buffer } {
  const salt = crypto.randomBytes(16);
  const serverCurve = crypto.createECDH("prime256v1");
  serverCurve.generateKeys();
  const serverPublic = serverCurve.getPublicKey();
  const sharedSecret = serverCurve.computeSecret(p256dh);
  const prk = hkdfExtract(auth, sharedSecret);
  const cek = hkdfExpand(prk, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdfExpand(prk, Buffer.from("Content-Encoding: nonce\0"), 12);

  const record = Buffer.concat([Buffer.from([0x00]), payload]);
  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const encrypted = Buffer.concat([cipher.update(record), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { salt, serverPublic, ciphertext: Buffer.concat([encrypted, tag]) };
}

interface PushSubData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

function areVAPIDKeysSet(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export async function sendPushNotification(
  subscription: PushSubData,
  title: string,
  body: string,
  link?: string,
): Promise<boolean> {
  if (!areVAPIDKeysSet()) return false;
  try {
    const vapidPublicSPKI = fromBase64URL(process.env.VAPID_PUBLIC_KEY!);
    const vapidPublicRaw = extractRawPublicKey(vapidPublicSPKI);
    const payload = JSON.stringify({ title, body, link, tag: "familyhub" });
    const { salt, serverPublic, ciphertext } = encryptPayload(
      Buffer.from(payload),
      fromBase64URL(subscription.keys.p256dh),
      fromBase64URL(subscription.keys.auth),
    );
    const audience = new URL(subscription.endpoint).origin;
    const jwt = createVAPIDJWT(audience);

    const contentCodingHeader = Buffer.concat([
      salt,
      Buffer.from([0x00, 0x00, 0x10, 0x00]),
      Buffer.from([65]),
      serverPublic,
    ]);
    const bodyBuffer = Buffer.concat([contentCodingHeader, ciphertext]);
    const res = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        TTL: "86400",
        Authorization: `vapid t=${jwt}, k=${toBase64URL(vapidPublicRaw)}`,
      },
      body: bodyBuffer,
    });
    if (res.status === 410 || res.status === 404) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: subscription.endpoint } });
      return false;
    }
    return res.ok;
  } catch {
    return false;
  }
}

interface NotifPayload {
  title: string;
  body: string;
  link?: string;
}

export async function notifyUser(userId: string, payload: NotifPayload): Promise<void> {
  if (!areVAPIDKeysSet()) return;
  try {
    const subs = await prisma.pushSubscription.findMany({ where: { userId } });
    await Promise.allSettled(
      subs.map((s) =>
        sendPushNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload.title,
          payload.body,
          payload.link,
        ),
      ),
    );
  } catch {
    // silently fail
  }
}

export function getVAPIDPublicKey(): string | null {
  if (!process.env.VAPID_PUBLIC_KEY) return null;
  try {
    const spki = fromBase64URL(process.env.VAPID_PUBLIC_KEY);
    const raw = spki.subarray(spki.length - 65);
    return raw.toString("base64");
  } catch {
    return null;
  }
}
