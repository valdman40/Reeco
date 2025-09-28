export const queryKeys = {
  orders: (p: {
    page: number;
    limit: number;
    q?: string;
    status?: string;
    sort?: string;
  }) => [
    'orders',
    {
      page: p.page,
      limit: p.limit,
      // Only include defined values to ensure stable keys
      ...(p.q && { q: p.q }),
      ...(p.status && { status: p.status }),
      ...(p.sort && { sort: p.sort }),
    },
  ],
  order: (id: string) => ['order', id],
};
