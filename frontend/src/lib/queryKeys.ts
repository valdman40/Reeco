export const queryKeys = {
  orders: (p: { page: number; limit: number; q?: string; status?: string }) => [
    'orders',
    {
      page: p.page,
      limit: p.limit,
      // Only include defined values to ensure stable keys
      ...(p.q && { q: p.q }),
      ...(p.status && { status: p.status }),
    },
  ],
  order: (id: string) => ['order', id],
};
