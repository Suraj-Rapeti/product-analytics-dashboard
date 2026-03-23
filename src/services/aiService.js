export const generateInsights = (users, orders) => {
  const safeUsers = Array.isArray(users) ? users : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  if (safeUsers.length === 0 && safeOrders.length === 0) {
    return [
      {
        id: 'insight-empty',
        type: 'info',
        title: 'Waiting for data',
        description: 'No user or order data is available yet. Insights will appear as soon as records are loaded.',
      },
    ];
  }

  if (safeOrders.length < safeUsers.length / 2) {
    return [
      {
        id: 'insight-conversion-warning',
        type: 'warning',
        title: 'Low conversion trend',
        description: 'User growth is outpacing order volume. Consider improving onboarding and first-purchase incentives.',
      },
      {
        id: 'insight-conversion-context',
        type: 'info',
        title: 'Users vs orders gap',
        description: `${safeUsers.length} users generated ${safeOrders.length} orders in this period.`,
      },
    ];
  }

  return [
    {
      id: 'insight-performance-positive',
      type: 'positive',
      title: 'Performance is healthy',
      description: 'Order volume is tracking well against user growth for the selected period.',
    },
    {
      id: 'insight-performance-context',
      type: 'info',
      title: 'Current totals',
      description: `${safeUsers.length} users and ${safeOrders.length} orders recorded.`,
    },
  ];
};