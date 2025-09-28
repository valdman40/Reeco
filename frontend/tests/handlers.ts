import { http, HttpResponse } from 'msw';

const customerNames = [
  'Alice Johnson',
  'Bob Smith',
  'Carol Wilson',
  'David Brown',
  'Emma Davis',
  'Frank Miller',
  'Grace Lee',
  'Henry Taylor',
  'Ivy Chen',
  'Jack Anderson',
  'Kate Thompson',
  'Liam Garcia',
  'Maya Patel',
  'Noah Martinez',
  'Olivia White',
];

const statuses = ['pending', 'approved', 'rejected'];

const orders = Array.from({ length: 15 }).map((_, i) => {
  const statusIndex = i % 3;
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - (i % 30)); // Spread orders across last 30 days

  return {
    id: `ord-${String(i + 1000).padStart(4, '0')}`,
    customer: customerNames[i] || `Customer ${i + 1}`,
    status: statuses[statusIndex],
    total: Math.floor(Math.random() * 2000) + 50, // Random totals between $50-$2050
    createdAt: baseDate.toISOString(),
    isApproved: statusIndex === 1,
    lineItemCount: Math.floor(Math.random() * 8) + 1, // 1-8 line items
  };
});

export const handlers = [
  http.get('http://localhost:3001/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? '5');
    const status =
      url.searchParams.get('status') === 'undefined'
        ? ''
        : url.searchParams.get('status');
    const q =
      url.searchParams.get('q') === 'undefined'
        ? ''
        : url.searchParams.get('q');
    const sort =
      url.searchParams.get('sort') === 'undefined'
        ? 'createdAt:desc'
        : url.searchParams.get('sort') ?? 'createdAt:desc';

    let filteredOrders = [...orders];

    // Filter by status
    if (status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === status
      );
    }

    // Filter by search query
    if (q) {
      const query = q.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.customer.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query)
      );
    }

    // Server-side sorting
    if (sort) {
      const [field, direction] = sort.split(':');
      console.log(`🔧 MSW: Sorting by ${field}:${direction}`);

      filteredOrders.sort((a, b) => {
        let comparison = 0;

        if (field === 'total') {
          comparison = a.total - b.total;
        } else if (field === 'createdAt') {
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (field === 'customer') {
          comparison = a.customer.localeCompare(b.customer);
        }

        return direction === 'desc' ? -comparison : comparison;
      });

      console.log(
        `🔧 MSW: First 3 results:`,
        filteredOrders.slice(0, 3).map((o) => ({
          id: o.id,
          field: field,
          value:
            field === 'createdAt'
              ? new Date(o.createdAt).toLocaleDateString()
              : field === 'total'
              ? o.total
              : field === 'customer'
              ? o.customer
              : 'unknown',
        }))
      );
    }

    const start = (page - 1) * limit;
    const items = filteredOrders.slice(start, start + limit);
    return HttpResponse.json({
      items,
      page,
      limit: 5,
      total: filteredOrders.length,
    });
  }),

  http.get('http://localhost:3001/orders/:id', ({ params }) => {
    const order = orders.find((o) => o.id === params.id);
    if (!order) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(order);
  }),

  http.patch(
    'http://localhost:3001/orders/:id',
    async ({ params, request }) => {
      const order = orders.find((o) => o.id === params.id);
      if (!order) {
        return new HttpResponse(null, { status: 404 });
      }

      // Parse the request body to get the actual isApproved value
      const body = (await request.json()) as { isApproved: boolean };

      // Update the order in memory for testing
      order.isApproved = body.isApproved;
      order.status = body.isApproved ? 'approved' : 'pending';
      return new HttpResponse(null, { status: 204 });
    }
  ),
];
