export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function apiFetch(path: string, opt?: RequestInit) {
  const r = await fetch(API_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...opt,
  });
  if (!r.ok) throw new Error(await r.text());
  try {
    return await r.json();
  } catch (e) {
    console.error("Error parsing response:", e);
    throw e;
  }
}
