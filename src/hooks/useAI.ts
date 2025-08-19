// src/hooks/useAI.ts
import useSWRMutation from "swr/mutation";

async function postJSON(url: string, { arg }: { arg: any }) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(arg) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function useAI() {
  const { trigger: evaluate, isMutating } = useSWRMutation("/api/ai/evaluate", postJSON);
  return { evaluate, isMutating };
}
