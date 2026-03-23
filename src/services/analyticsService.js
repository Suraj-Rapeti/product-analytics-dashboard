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
