const value = process.env.VITE_API_BASE_URL;

if (!value) {
  process.exit(0);
}

let url;
try {
  url = new URL(value);
} catch {
  console.error("VITE_API_BASE_URL must be a valid URL.");
  process.exit(1);
}

if (url.protocol !== "http:" && url.protocol !== "https:") {
  console.error("VITE_API_BASE_URL must start with http:// or https://.");
  process.exit(1);
}
