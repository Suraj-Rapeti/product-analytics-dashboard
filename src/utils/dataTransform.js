/**
 * Data Transformation Utilities
 * Handles all data processing, filtering, and period comparisons
 */

const parseDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isWithinRange = (dateObj, range) => 
  dateObj && dateObj >= range.start && dateObj <= range.end;

// ============================================================
// PERIOD DEFINITION
// ============================================================

export const getPeriodRange = (preset, customStart = null, customEnd = null, baselineDate = null) => {
  const end = baselineDate ? new Date(baselineDate) : new Date();
  end.setHours(23, 59, 59, 999);

  let start = new Date(end);
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case '7d':
      start.setDate(start.getDate() - 6);
      break;
    case '30d':
      start.setDate(start.getDate() - 29);
      break;
    case 'custom':
      if (customStart) {
        start = parseDate(`${customStart}T00:00:00`) || start;
      }
      if (customEnd) {
        const customRangeEnd = parseDate(`${customEnd}T23:59:59`);
        if (customRangeEnd) end.setTime(customRangeEnd.getTime());
      }
      break;
    case 'all':
    default:
      start = new Date(1970, 0, 1);
  }

  return { start, end };
};

// ============================================================
// PERIOD COMPARISON
// ============================================================

export const comparePeriods = (currentPeriod, previousPeriod) => {
  const currentValue = currentPeriod.value || 0;
  const previousValue = previousPeriod.value || 0;

  if (previousValue === 0) {
    return {
      change: currentValue > 0 ? 100 : 0,
      changePercent: currentValue > 0 ? 100 : 0,
      trend: currentValue > 0 ? 'up' : 'neutral',
      isImprovement: currentValue > previousValue,
    };
  }

  const change = currentValue - previousValue;
  const changePercent = (change / previousValue) * 100;

  return {
    change,
    changePercent: changePercent.toFixed(1),
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    isImprovement: change > 0,
  };
};

// ============================================================
// METRICS CALCULATION WITH PERIOD COMPARISON
// ============================================================

export const calculateMetricsWithComparison = (
  currentUsers,
  currentOrders,
  currentEvents,
  previousUsers,
  previousOrders,
  previousEvents
) => {
  // Current period metrics
  const currentMetrics = {
    users: currentUsers.length,
    revenue: currentOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
    orders: currentOrders.length,
    events: currentEvents.length,
    uniqueBuyers: new Set(currentOrders.map(o => o.userId).filter(Boolean)).size,
  };

  currentMetrics.conversionRate = currentMetrics.users > 0
    ? (currentMetrics.uniqueBuyers / currentMetrics.users) * 100
    : 0;

  currentMetrics.aov = currentMetrics.orders > 0
    ? currentMetrics.revenue / currentMetrics.orders
    : 0;

  // Previous period metrics
  const previousMetrics = {
    users: previousUsers.length,
    revenue: previousOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
    orders: previousOrders.length,
    events: previousEvents.length,
    uniqueBuyers: new Set(previousOrders.map(o => o.userId).filter(Boolean)).size,
  };

  previousMetrics.conversionRate = previousMetrics.users > 0
    ? (previousMetrics.uniqueBuyers / previousMetrics.users) * 100
    : 0;

  previousMetrics.aov = previousMetrics.orders > 0
    ? previousMetrics.revenue / previousMetrics.orders
    : 0;

  // Period comparisons
  const comparisons = {
    revenue: comparePeriods(
      { value: currentMetrics.revenue },
      { value: previousMetrics.revenue }
    ),
    orders: comparePeriods(
      { value: currentMetrics.orders },
      { value: previousMetrics.orders }
    ),
    users: comparePeriods(
      { value: currentMetrics.users },
      { value: previousMetrics.users }
    ),
    conversionRate: comparePeriods(
      { value: currentMetrics.conversionRate },
      { value: previousMetrics.conversionRate }
    ),
    aov: comparePeriods(
      { value: currentMetrics.aov },
      { value: previousMetrics.aov }
    ),
  };

  return {
    current: currentMetrics,
    previous: previousMetrics,
    comparisons,
  };
};

// ============================================================
// FILTER DATA BY RANGE
// ============================================================

export const filterDataByRange = (users, orders, events, range) => {
  return {
    users: users.filter(u => isWithinRange(parseDate(u.signupDate), range)),
    orders: orders.filter(o => isWithinRange(parseDate(o.date), range)),
    events: events.filter(e => isWithinRange(parseDate(e.timestamp), range)),
  };
};

// ============================================================
// GET PREVIOUS PERIOD DATA
// ============================================================

export const getPreviousPeriodRange = (currentRange) => {
  const daysDiff = Math.ceil((currentRange.end - currentRange.start) / (1000 * 60 * 60 * 24));

  const prevEnd = new Date(currentRange.start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  prevEnd.setHours(23, 59, 59, 999);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - daysDiff + 1);
  prevStart.setHours(0, 0, 0, 0);

  return { start: prevStart, end: prevEnd };
};

// ============================================================
// EVENT GROUPING BY TYPE
// ============================================================

export const groupEventsByType = (events) => {
  return events.reduce((acc, event) => {
    const type = event.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
};

// ============================================================
// PRODUCT ANALYSIS
// ============================================================

export const analyzeProducts = (orders) => {
  const productStats = {};

  orders.forEach(order => {
    const product = order.product || 'Unknown';
    if (!productStats[product]) {
      productStats[product] = {
        name: product,
        units: 0,
        revenue: 0,
        orders: 0,
      };
    }
    productStats[product].units += order.quantity || 1;
    productStats[product].revenue += order.amount || 0;
    productStats[product].orders += 1;
  });

  return Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
};

// ============================================================
// TREND DETECTION
// ============================================================

export const detectTrend = (currentValue, previousValue, threshold = 10) => {
  if (previousValue === 0) {
    return currentValue > 0 ? 'new' : 'zero';
  }

  const percentChange = Math.abs((currentValue - previousValue) / previousValue) * 100;

  if (percentChange < threshold) return 'stable';
  return currentValue > previousValue ? 'increasing' : 'decreasing';
};
