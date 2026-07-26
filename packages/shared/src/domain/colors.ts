const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function safeHex(value: string | undefined, fallback: string) {
  return value && HEX_COLOR.test(value) ? value : fallback;
}
