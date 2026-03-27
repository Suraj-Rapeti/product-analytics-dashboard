const toDateKey = (dateObj) => [
  dateObj.getFullYear(),
  String(dateObj.getMonth() + 1).padStart(2, '0'),
  String(dateObj.getDate()).padStart(2, '0'),
].join('-');

const parseDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isWithinRange = (dateObj, range) => dateObj && dateObj >= range.start && dateObj <= range.end;

export const buildDailyRevenueSeries = (orders, range) => {
  const startDay = new Date(range.start);
  startDay.setHours(0, 0, 0, 0);

  const endDay = new Date(range.end);
  endDay.setHours(0, 0, 0, 0);

  const revenueByDay = {};
  (orders || []).forEach((order) => {
    const orderDate = parseDate(order?.date);
    if (!isWithinRange(orderDate, range)) return;

    const normalized = new Date(orderDate);
    normalized.setHours(0, 0, 0, 0);
    const dateKey = toDateKey(normalized);
    revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + (order?.amount || 0);
  });

  const totalDays = Math.max(1, Math.floor((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1);

  return Array.from({ length: totalDays }, (_, index) => {
    const current = new Date(startDay);
    current.setDate(startDay.getDate() + index);
    const dateKey = toDateKey(current);

    return {
      name: dateKey,
      revenue: revenueByDay[dateKey] || 0,
    };
  });
};

export const buildDailyOrdersSeries = (orders, range) => {
  const startDay = new Date(range.start);
  startDay.setHours(0, 0, 0, 0);

  const endDay = new Date(range.end);
  endDay.setHours(0, 0, 0, 0);

  const ordersByDay = {};
  (orders || []).forEach((order) => {
    const orderDate = parseDate(order?.date);
    if (!isWithinRange(orderDate, range)) return;

    const normalized = new Date(orderDate);
    normalized.setHours(0, 0, 0, 0);
    const dateKey = toDateKey(normalized);
    ordersByDay[dateKey] = (ordersByDay[dateKey] || 0) + 1;
  });

  const totalDays = Math.max(1, Math.floor((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1);

  return Array.from({ length: totalDays }, (_, index) => {
    const current = new Date(startDay);
    current.setDate(startDay.getDate() + index);
    const dateKey = toDateKey(current);

    return {
      dateKey,
      dayLabel: new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      orders: ordersByDay[dateKey] || 0,
    };
  });
};

export const buildEventDistribution = (events, range, palette) => {
  const counts = {};
  (events || []).forEach((event) => {
    const eventDate = parseDate(event?.timestamp);
    if (!isWithinRange(eventDate, range)) return;

    const type = event?.type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  });

  return Object.keys(counts).map((key, index) => ({
    name: key,
    value: counts[key],
    color: palette[index % palette.length],
  }));
};

export const buildMonthlyRevenueSeries = (orders, range) => {
  const startMonth = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  const endMonth = new Date(range.end.getFullYear(), range.end.getMonth(), 1);

  const revenueByMonth = {};
  (orders || []).forEach((order) => {
    const orderDate = parseDate(order?.date);
    if (!isWithinRange(orderDate, range)) return;

    const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (order?.amount || 0);
  });

  const monthSpan =
    (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (endMonth.getMonth() - startMonth.getMonth()) +
    1;

  return Array.from({ length: Math.max(1, monthSpan) }, (_, index) => {
    const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + index, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

    return {
      name: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: revenueByMonth[monthKey] || 0,
    };
  });
};

export const rankDashboardInsights = (insights, limit = 3) => {
  const priority = {
    critical: 0,
    warning: 1,
    healthy: 2,
    positive: 2,
    info: 3,
  };

  return [...(insights || [])]
    .filter((item) => item?.id !== 'insight-key-takeaway')
    .sort((a, b) => (priority[a?.type] ?? 99) - (priority[b?.type] ?? 99))
    .slice(0, limit)
    .map((item) => {
      const description = item?.description || '';
      const actionPart = description.includes('Action:')
        ? description.split('Action:')[1].trim()
        : description;

      const headline = actionPart
        .split('.')
        .map((part) => part.trim())
        .filter(Boolean)[0] || item?.title || 'Insight';

      return {
        id: item?.id || headline,
        emoji: item?.type === 'critical' ? '🚨' : item?.type === 'warning' ? '⚠️' : '📈',
        text: `${item?.title || 'Insight'}: ${headline}`,
      };
    });
};

// ============================================================
// METRIC CALCULATIONS (Moved from App.js)
// ============================================================

export const calculateMetrics = (users, orders, events) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const uniqueBuyerCount = new Set(orders.map((order) => order.userId).filter(Boolean)).size;
  const conversionRate = users.length > 0 ? (uniqueBuyerCount / users.length) * 100 : 0;
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return {
    totalRevenue,
    uniqueBuyerCount,
    conversionRate,
    averageOrderValue,
  };
};

// ============================================================
// ANOMALY DETECTION (New Feature)
// ============================================================

export const detectAnomalies = (orders, range) => {
  if (!orders || orders.length === 0) return [];

  // Build daily revenue and order counts
  const dailyMetrics = {};
  const startDay = new Date(range.start);
  startDay.setHours(0, 0, 0, 0);
  const endDay = new Date(range.end);
  endDay.setHours(0, 0, 0, 0);

  orders.forEach((order) => {
    const orderDate = parseDate(order?.date);
    if (!isWithinRange(orderDate, range)) return;

    const normalized = new Date(orderDate);
    normalized.setHours(0, 0, 0, 0);
    const dateKey = toDateKey(normalized);

    if (!dailyMetrics[dateKey]) {
      dailyMetrics[dateKey] = { revenue: 0, orders: 0, date: new Date(dateKey) };
    }
    dailyMetrics[dateKey].revenue += order.amount || 0;
    dailyMetrics[dateKey].orders += 1;
  });

  const metrics = Object.values(dailyMetrics).sort((a, b) => a.date - b.date);
  if (metrics.length < 3) return [];

  const anomalies = [];
  const stdDev = (arr) => {
    const avg = arr.reduce((a, b) => a + b) / arr.length;
    const variance = arr.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / arr.length;
    return Math.sqrt(variance);
  };

  // Detect revenue anomalies
  const revenues = metrics.map((m) => m.revenue);
  const revenueSd = stdDev(revenues);

  metrics.forEach((metric, idx) => {
    if (idx === 0) return;
    const prev = metrics[idx - 1].revenue;
    const curr = metric.revenue;
    const changePercent = prev > 0 ? Math.abs((curr - prev) / prev) * 100 : 0;

    // Spike or drop > 75% (stricter threshold to reduce noise)
    if (changePercent > 75 && Math.abs(curr - prev) > revenueSd * 1.5) {
      anomalies.push({
        id: `anomaly-revenue-${idx}`,
        type: curr > prev ? 'spike' : 'drop',
        metric: 'revenue',
        date: metric.date,
        value: metric.revenue,
        change: changePercent.toFixed(1),
        severity: changePercent > 90 ? 'high' : 'medium',
      });
    }
  });

  // Detect order anomalies
  const orderCounts = metrics.map((m) => m.orders);
  const orderSd = stdDev(orderCounts);

  metrics.forEach((metric, idx) => {
    if (idx === 0) return;
    const prev = metrics[idx - 1].orders;
    const curr = metric.orders;
    const changePercent = prev > 0 ? Math.abs((curr - prev) / prev) * 100 : 0;

    // Spike or drop > 60% (stricter threshold to reduce noise)
    if (changePercent > 60 && Math.abs(curr - prev) > orderSd * 1.5) {
      anomalies.push({
        id: `anomaly-orders-${idx}`,
        type: curr > prev ? 'spike' : 'drop',
        metric: 'orders',
        date: metric.date,
        value: metric.orders,
        change: changePercent.toFixed(1),
        severity: changePercent > 80 ? 'high' : 'medium',
      });
    }
  });

  // Return only top 3 most severe anomalies
  return anomalies
    .sort((a, b) => {
      const severityScore = (a.severity === 'high' ? 1 : 0) - (b.severity === 'high' ? 1 : 0);
      if (severityScore !== 0) return severityScore;
      return parseFloat(b.change) - parseFloat(a.change);
    })
    .slice(0, 3);
};

// ============================================================
// ALERT GENERATION (New Feature)
// ============================================================

export const generateAlerts = (users, orders, events) => {
  const alerts = [];
  const metrics = calculateMetrics(users, orders, events);

  // Low conversion rate
  if (metrics.conversionRate < 20) {
    alerts.push({
      id: 'alert-low-conversion',
      type: 'critical',
      title: '🚨 Low Conversion Rate',
      message: `Only ${metrics.conversionRate.toFixed(1)}% of users convert. This is critically low.`,
      action: 'Optimize checkout flow & reduce friction',
    });
  } else if (metrics.conversionRate < 35) {
    alerts.push({
      id: 'alert-medium-conversion',
      type: 'warning',
      title: '⚠️ Conversion Below Target',
      message: `Conversion rate is ${metrics.conversionRate.toFixed(1)}%. Target: 35%+`,
      action: 'Test new product pages & checkout flow',
    });
  }

  // Missing funnel tracking
  const funnelViews = events.filter((e) => e.type === 'view_product').length;
  const funnelCart = events.filter((e) => e.type === 'add_to_cart').length;
  const funnelCheckout = events.filter((e) => e.type === 'checkout').length;

  if (funnelViews === 0 || funnelCart === 0 || funnelCheckout === 0) {
    alerts.push({
      id: 'alert-funnel-missing',
      type: 'warning',
      title: '⚠️ Incomplete Funnel Tracking',
      message: 'Missing funnel events: cannot diagnose where users drop off.',
      action: 'Implement missing funnel event tracking',
    });
  }

  // Declining orders (if we have order trend data)
  if (orders.length >= 10) {
    const recentOrders = orders.slice(-5).reduce((sum, o) => sum + (o.amount || 0), 0);
    const olderOrders = orders.slice(-10, -5).reduce((sum, o) => sum + (o.amount || 0), 0);
    if (olderOrders > 0 && recentOrders / olderOrders < 0.7) {
      alerts.push({
        id: 'alert-declining-orders',
        type: 'warning',
        title: '⚠️ Orders Declining',
        message: 'Recent order volume dropped 30%+ vs previous period.',
        action: 'Review pricing, product quality, and marketing campaigns',
      });
    }
  }

  return alerts;
};
