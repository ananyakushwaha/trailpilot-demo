import crypto from "node:crypto";

export function isControlPanelPasswordValid(password: string) {
  const configured = process.env.CONTROL_PANEL_PASSWORD;
  if (!configured || !password) return false;
  const expected = Buffer.from(configured);
  const received = Buffer.from(password);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
