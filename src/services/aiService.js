const toValidDate = (value) => {
  const dateObj = new Date(value);
  return Number.isNaN(dateObj.getTime()) ? null : dateObj;
};

const pct = (value) => `${Math.round(value)}%`;

const splitIntoHalves = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return [[], []];
  const mid = Math.floor(arr.length / 2);
  return [arr.slice(0, Math.max(1, mid)), arr.slice(Math.max(1, mid))];
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const generateInsights = (users, orders, events) => {
  const safeUsers = Array.isArray(users) ? users : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeEvents = Array.isArray(events) ? events : [];
  const insights = [];

  if (safeUsers.length === 0 && safeOrders.length === 0 && safeEvents.length === 0) {
    return [
      {
        id: 'insight-empty',
        type: 'warning',
        title: 'Waiting for data',
        description: 'No user, order, or event data yet. Action: load data sources to enable insights.',
      },
    ];
  }

  const totalRevenue = safeOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

  const buyerUserIds = new Set(
    safeOrders
      .map((order) => order.userId)
      .filter(Boolean),
  );
  const conversionRate = safeUsers.length > 0
    ? (buyerUserIds.size / safeUsers.length) * 100
    : 0;

  const alerts = [];

  let conversionType = 'healthy';
  if (safeUsers.length > 0 && conversionRate < 20) conversionType = 'critical';
  else if (safeUsers.length > 0 && conversionRate < 35) conversionType = 'warning';

  if (conversionType === 'critical') {
    alerts.push('Conversion is critically low -> optimize checkout now.');
  }

  insights.push({
    id: 'insight-conversion-rate',
    type: conversionType,
    title: 'Conversion Rate',
    description: conversionType === 'critical'
      ? `${pct(conversionRate)} users convert. Critical drop-off. Action: optimize checkout.`
      : conversionType === 'warning'
        ? `${pct(conversionRate)} users convert. Below target. Action: reduce funnel friction.`
        : `${pct(conversionRate)} users convert. Healthy performance. Action: scale traffic.`,
  });

  const funnelViews = safeEvents.filter((event) => event.type === 'view_product').length;
  const funnelCart = safeEvents.filter((event) => event.type === 'add_to_cart').length;
  const funnelCheckout = safeEvents.filter((event) => event.type === 'checkout').length;
  const funnelDropFromView = funnelViews > 0
    ? ((funnelViews - funnelCheckout) / funnelViews) * 100
    : 0;

  if (funnelViews === 0 && funnelCart === 0 && funnelCheckout === 0) {
    alerts.push('Funnel tracking missing -> cannot diagnose drop-offs.');
  } else {
    const funnelType = funnelDropFromView > 75 ? 'critical' : funnelDropFromView > 55 ? 'warning' : 'healthy';
    insights.push({
      id: 'insight-funnel-dropoff',
      type: funnelType,
      title: 'Funnel Drop-off',
      description: funnelType === 'critical'
        ? `Views ${funnelViews} -> Cart ${funnelCart} -> Checkout ${funnelCheckout}. Severe drop-off (${pct(funnelDropFromView)}). Action: fix checkout blockers.`
        : funnelType === 'warning'
          ? `Views ${funnelViews} -> Cart ${funnelCart} -> Checkout ${funnelCheckout}. High drop-off (${pct(funnelDropFromView)}). Action: optimize product-to-checkout flow.`
          : `Views ${funnelViews} -> Cart ${funnelCart} -> Checkout ${funnelCheckout}. Funnel is stable. Action: run conversion tests.`,
    });
  }

  const ordersByDay = {};
  const revenueByDay = {};
  safeOrders.forEach((order) => {
    const orderDate = toValidDate(order.date);
    if (!orderDate) return;

    const dateKey = [
      orderDate.getFullYear(),
      String(orderDate.getMonth() + 1).padStart(2, '0'),
      String(orderDate.getDate()).padStart(2, '0'),
    ].join('-');

    ordersByDay[dateKey] = (ordersByDay[dateKey] || 0) + 1;
    revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + (order.amount || 0);
  });

  const dailyOrderEntries = Object.entries(ordersByDay).sort((a, b) => a[0].localeCompare(b[0]));
  const orderCounts = dailyOrderEntries.map(([, count]) => count);
  const [orderFirstHalf, orderSecondHalf] = splitIntoHalves(orderCounts);
  const firstHalfAvgOrders = orderFirstHalf.length > 0
    ? orderFirstHalf.reduce((sum, value) => sum + value, 0) / orderFirstHalf.length
    : 0;
  const secondHalfAvgOrders = orderSecondHalf.length > 0
    ? orderSecondHalf.reduce((sum, value) => sum + value, 0) / orderSecondHalf.length
    : 0;
  const ordersTrendDelta = firstHalfAvgOrders > 0
    ? ((secondHalfAvgOrders - firstHalfAvgOrders) / firstHalfAvgOrders) * 100
    : 0;

  const dailyRevenueValues = Object.entries(revenueByDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, value]) => value);
  const [revenueFirstHalf, revenueSecondHalf] = splitIntoHalves(dailyRevenueValues);
  const firstHalfAvgRevenue = revenueFirstHalf.length > 0
    ? revenueFirstHalf.reduce((sum, value) => sum + value, 0) / revenueFirstHalf.length
    : 0;
  const secondHalfAvgRevenue = revenueSecondHalf.length > 0
    ? revenueSecondHalf.reduce((sum, value) => sum + value, 0) / revenueSecondHalf.length
    : 0;
  const revenueTrendDelta = firstHalfAvgRevenue > 0
    ? ((secondHalfAvgRevenue - firstHalfAvgRevenue) / firstHalfAvgRevenue) * 100
    : 0;

  let ordersTrendType = 'warning';
  let ordersTrendDetail = 'Not enough order history yet to detect trend.';
  if (orderCounts.length > 1) {
    if (ordersTrendDelta <= -20) {
      ordersTrendType = 'critical';
      ordersTrendDetail = `Orders ${Math.round(ordersTrendDelta)}%. Serious decline. Action: investigate traffic and checkout immediately.`;
      alerts.push(`Orders down ${Math.abs(Math.round(ordersTrendDelta))}% -> urgent review needed.`);
    } else if (ordersTrendDelta < -5) {
      ordersTrendType = 'warning';
      ordersTrendDetail = `Orders ${Math.round(ordersTrendDelta)}%. Mild decline, monitor closely. Action: run targeted campaigns.`;
    } else if (ordersTrendDelta <= 5) {
      ordersTrendType = 'healthy';
      ordersTrendDetail = `Orders ${ordersTrendDelta >= 0 ? '+' : ''}${Math.round(ordersTrendDelta)}%. Stable trend. Action: keep monitoring.`;
    } else {
      ordersTrendType = 'healthy';
      ordersTrendDetail = `Orders +${Math.round(ordersTrendDelta)}%. Demand is improving.${Math.abs(revenueTrendDelta) < 5 ? ' Revenue is flatter than orders.' : ''} Action: protect inventory and scale winners.`;
    }
  }

  insights.push({
    id: 'insight-orders-trend',
    type: ordersTrendType,
    title: 'Orders Trend',
    description: ordersTrendDetail,
  });

  const productUnits = {};
  const productRevenue = {};
  safeOrders.forEach((order) => {
    const product = order.product || 'Unknown';
    const units = order.quantity || 1;
    productUnits[product] = (productUnits[product] || 0) + units;
    productRevenue[product] = (productRevenue[product] || 0) + (order.amount || 0);
  });
  const sortedProducts = Object.entries(productUnits).sort((a, b) => b[1] - a[1]);

  if (sortedProducts.length > 0) {
    const [topProductName, topProductUnits] = sortedProducts[0];
    const [lowProductName, lowProductUnits] = sortedProducts[sortedProducts.length - 1];

    insights.push({
      id: 'insight-top-products',
      type: 'healthy',
      title: 'Top Products',
      description: `${topProductName} leads (${topProductUnits} units). ${lowProductName} underperforms (${lowProductUnits} units). Action: increase ads for ${topProductName} and review pricing for ${lowProductName}.`,
    });
  }

  const weekdayOrderCounts = Array.from({ length: 7 }, () => 0);
  dailyOrderEntries.forEach(([dateKey, count]) => {
    const dayDate = toValidDate(`${dateKey}T00:00:00`);
    if (!dayDate) return;
    weekdayOrderCounts[dayDate.getDay()] += count;
  });

  if (dailyOrderEntries.length > 0) {
    const peakDayIndex = weekdayOrderCounts.indexOf(Math.max(...weekdayOrderCounts));
    const lowDayIndex = weekdayOrderCounts.indexOf(Math.min(...weekdayOrderCounts));

    insights.push({
      id: 'insight-peak-day',
      type: 'healthy',
      title: 'Peak Day Pattern',
      description: `${dayNames[peakDayIndex]} is strongest. ${dayNames[lowDayIndex]} is weakest. Action: push promos on ${dayNames[peakDayIndex]} and lift engagement on ${dayNames[lowDayIndex]}.`,
    });
  }

  const usersByMonth = {};
  safeUsers.forEach((user) => {
    const signupDate = toValidDate(user.signupDate);
    if (!signupDate) return;

    const monthKey = `${signupDate.getFullYear()}-${String(signupDate.getMonth() + 1).padStart(2, '0')}`;
    usersByMonth[monthKey] = (usersByMonth[monthKey] || 0) + 1;
  });

  const monthlyUsers = Object.entries(usersByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, count]) => count);
  const [usersFirstHalf, usersSecondHalf] = splitIntoHalves(monthlyUsers);
  const firstHalfAvgUsers = usersFirstHalf.length > 0
    ? usersFirstHalf.reduce((sum, value) => sum + value, 0) / usersFirstHalf.length
    : 0;
  const secondHalfAvgUsers = usersSecondHalf.length > 0
    ? usersSecondHalf.reduce((sum, value) => sum + value, 0) / usersSecondHalf.length
    : 0;
  const userGrowthDelta = firstHalfAvgUsers > 0
    ? ((secondHalfAvgUsers - firstHalfAvgUsers) / firstHalfAvgUsers) * 100
    : 0;

  insights.push({
    id: 'insight-user-growth',
    type: userGrowthDelta < -10 ? 'warning' : userGrowthDelta > 10 ? 'healthy' : 'warning',
    title: 'User Growth Trend',
    description:
      monthlyUsers.length > 1
        ? `Growth ${userGrowthDelta >= 0 ? '+' : ''}${Math.round(userGrowthDelta)}% (avg ${Math.round(firstHalfAvgUsers)} -> ${Math.round(secondHalfAvgUsers)} users). ${userGrowthDelta < -10 ? 'Acquisition is slowing.' : userGrowthDelta > 10 ? 'Strong acquisition trend.' : 'Acquisition is steady.'} Action: ${userGrowthDelta < -10 ? 'improve acquisition channels.' : userGrowthDelta > 10 ? 'double down on winning channels.' : 'maintain and monitor CAC.'}`
        : 'Not enough monthly signup history yet to infer growth trend.',
  });

  const averageOrderValue = safeOrders.length > 0 ? totalRevenue / safeOrders.length : 0;
  insights.push({
    id: 'insight-aov',
    type: averageOrderValue < 300 && safeOrders.length > 0 ? 'warning' : 'healthy',
    title: 'Average Order Value',
    description: safeOrders.length > 0
      ? `AOV $${Math.round(averageOrderValue).toLocaleString()}. ${averageOrderValue < 300 ? 'Low-value baskets.' : 'Healthy order value.'} Action: ${averageOrderValue < 300 ? 'add bundles and upsells.' : 'test premium upsells.'}`
      : 'No orders yet to compute average order value.',
  });

  const eventsPerUser = safeUsers.length > 0 ? safeEvents.length / safeUsers.length : 0;
  insights.push({
    id: 'insight-engagement',
    type: eventsPerUser < 2 ? 'warning' : eventsPerUser >= 3 ? 'healthy' : 'warning',
    title: 'Engagement Level',
    description: `${eventsPerUser.toFixed(2)} events/user. ${eventsPerUser < 2 ? 'Low engagement.' : eventsPerUser >= 3 ? 'Good engagement.' : 'Moderate engagement.'}${eventsPerUser > 3 && conversionRate < 35 ? ' Engagement is high but conversion is weak.' : ''} Action: ${eventsPerUser < 2 ? 'improve onboarding prompts.' : eventsPerUser >= 3 && conversionRate < 35 ? 'optimize checkout.' : 'keep optimizing journeys.'}`,
  });

  if (dailyRevenueValues.length > 1) {
    const avgRevenue = dailyRevenueValues.reduce((sum, value) => sum + value, 0) / dailyRevenueValues.length;
    const variance = dailyRevenueValues.reduce((sum, value) => sum + ((value - avgRevenue) ** 2), 0) / dailyRevenueValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = avgRevenue > 0 ? stdDev / avgRevenue : 0;

    insights.push({
      id: 'insight-sales-consistency',
      type: cv > 0.6 ? 'warning' : 'healthy',
      title: 'Sales Consistency',
      description: cv > 0.6
        ? 'Revenue is volatile. Demand is unstable. Action: smooth demand with steady campaigns.'
        : 'Stable demand with low volatility. Action: scale predictably.',
    });
  }

  const sortedDailyOrders = Object.entries(ordersByDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, count]) => count);
  if (sortedDailyOrders.length >= 14) {
    const lastWeek = sortedDailyOrders.slice(-7).reduce((sum, count) => sum + count, 0);
    const priorWeek = sortedDailyOrders.slice(-14, -7).reduce((sum, count) => sum + count, 0);
    const weekDrop = priorWeek > 0 ? ((priorWeek - lastWeek) / priorWeek) * 100 : 0;
    if (weekDrop >= 40) {
      alerts.push(`Orders dropped ${Math.round(weekDrop)}% WoW -> urgent action needed.`);
    }
  }

  if (safeOrders.length === 0 && safeEvents.length === 0) {
    alerts.push('No order or event activity detected in selected period.');
  }

  if (eventsPerUser >= 3 && conversionRate >= 35) {
    insights.push({
      id: 'insight-opportunity',
      type: 'healthy',
      title: 'Opportunity Signal',
      description: 'High engagement + healthy conversion. Action: test upsells or small price lift.',
    });
  }

  let keyTakeawayType = 'healthy';
  let keyTakeawayText = 'Strong conversion and growth. Focus on scaling traffic and upsells.';
  if (alerts.length > 0) {
    keyTakeawayType = 'critical';
    keyTakeawayText = 'Top priority: fix critical alerts first, then optimize conversion and growth levers.';
  } else if (conversionType === 'warning' || ordersTrendType === 'warning') {
    keyTakeawayType = 'warning';
    keyTakeawayText = 'Mixed signals: monitor order trend and tighten conversion before scaling.';
  }

  insights.unshift({
    id: 'insight-key-takeaway',
    type: keyTakeawayType,
    title: 'Key Takeaway',
    description: keyTakeawayText,
  });

  if (alerts.length > 0) {
    insights.unshift({
      id: 'insight-alerts',
      type: 'critical',
      title: 'Critical Alerts',
      description: `Action now: ${alerts.join(' ')}`,
    });
  }

  return insights;
};