import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export function useApproveOrder() {
  return useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      apiFetch(`/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isApproved }),
      }),
  });
}
