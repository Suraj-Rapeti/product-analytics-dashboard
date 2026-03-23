import React, { useState, useEffect } from 'react';
import './App.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import RevenueLineChart from './components/RevenueLineChart';
import MonthlyRevenueAreaChart from './components/MonthlyRevenueAreaChart';
import OrdersBarChart from './components/OrdersBarChart';
import EventPieChart from './components/EventPieChart';
import AIInsightsPanel from './components/AIInsightsPanel';
import { Sun, Moon, Menu } from 'lucide-react';

// Services
import { getUsers, getOrders, getEvents } from './services/dataService';
import { generateInsights } from './services/aiService';

const PRESET_OPTIONS = [
  { id: '7d', label: '7D', days: 7 },
  { id: '30d', label: '30D', days: 30 },
  { id: '90d', label: '90D', days: 90 },
  { id: 'all', label: 'All', days: null },
  { id: 'custom', label: 'Custom', days: null },
];

const parseDateSafe = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatInputDate = (dateObj) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getDateFromInput = (value, fallback) => {
  if (!value) return fallback;
  const parsed = parseDateSafe(`${value}T00:00:00`);
  return parsed || fallback;
};

const getRangeSubtitle = (startDate, endDate) => {
  const formattedStart = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedEnd = endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${formattedStart} - ${formattedEnd}`;
};

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="h-10 w-10 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function Dashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userSignupFilter, setUserSignupFilter] = useState('all');
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [revenueChartPreset, setRevenueChartPreset] = useState('30d');
  const [revenueChartStartDate, setRevenueChartStartDate] = useState('');
  const [revenueChartEndDate, setRevenueChartEndDate] = useState('');
  const [ordersChartPreset, setOrdersChartPreset] = useState('30d');
  const [ordersChartStartDate, setOrdersChartStartDate] = useState('');
  const [ordersChartEndDate, setOrdersChartEndDate] = useState('');
  const [eventsChartPreset, setEventsChartPreset] = useState('30d');
  const [eventsChartStartDate, setEventsChartStartDate] = useState('');
  const [eventsChartEndDate, setEventsChartEndDate] = useState('');
  const [monthlyChartPreset, setMonthlyChartPreset] = useState('all');
  const [monthlyChartStartDate, setMonthlyChartStartDate] = useState('');
  const [monthlyChartEndDate, setMonthlyChartEndDate] = useState('');

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const u = await getUsers();
      const o = await getOrders();
      const e = await getEvents();

      setUsers(u);
      setOrders(o);
      setEvents(e);
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeNav]);

  // 🔥 METRICS
  const allTimelineDates = [
    ...orders.map((o) => parseDateSafe(o.date)).filter(Boolean),
    ...events.map((e) => parseDateSafe(e.timestamp)).filter(Boolean),
    ...users.map((u) => parseDateSafe(u.signupDate)).filter(Boolean),
  ];

  const timelineMinDate = allTimelineDates.length > 0
    ? new Date(Math.min(...allTimelineDates.map((d) => d.getTime())))
    : new Date();
  const timelineMaxDate = allTimelineDates.length > 0
    ? new Date(Math.max(...allTimelineDates.map((d) => d.getTime())))
    : new Date();

  timelineMinDate.setHours(0, 0, 0, 0);
  timelineMaxDate.setHours(0, 0, 0, 0);

  const resolveChartRange = (preset, customStart, customEnd) => {
    const rangeEnd = new Date(timelineMaxDate);
    let rangeStart = new Date(timelineMaxDate);

    if (preset === 'all') {
      rangeStart = new Date(timelineMinDate);
    } else if (preset === 'custom') {
      rangeStart = getDateFromInput(customStart, timelineMinDate);
      const customRangeEnd = getDateFromInput(customEnd, timelineMaxDate);
      rangeEnd.setTime(customRangeEnd.getTime());
    } else {
      const presetOption = PRESET_OPTIONS.find((item) => item.id === preset);
      const days = presetOption?.days || 30;
      rangeStart.setDate(rangeStart.getDate() - (days - 1));
    }

    if (rangeStart > rangeEnd) {
      const temp = new Date(rangeStart);
      rangeStart.setTime(rangeEnd.getTime());
      rangeEnd.setTime(temp.getTime());
    }

    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);

    return {
      start: rangeStart,
      end: rangeEnd,
    };
  };

  const computedRangeEnd = new Date(timelineMaxDate);
  let computedRangeStart = new Date(timelineMaxDate);

  if (selectedPreset === 'all') {
    computedRangeStart = new Date(timelineMinDate);
  } else if (selectedPreset === 'custom') {
    computedRangeStart = getDateFromInput(customStartDate, timelineMinDate);
    const customEnd = getDateFromInput(customEndDate, timelineMaxDate);
    computedRangeEnd.setTime(customEnd.getTime());
  } else {
    const preset = PRESET_OPTIONS.find((item) => item.id === selectedPreset);
    const days = preset?.days || 30;
    computedRangeStart.setDate(computedRangeStart.getDate() - (days - 1));
  }

  if (computedRangeStart > computedRangeEnd) {
    const tmp = new Date(computedRangeStart);
    computedRangeStart.setTime(computedRangeEnd.getTime());
    computedRangeEnd.setTime(tmp.getTime());
  }

  computedRangeStart.setHours(0, 0, 0, 0);
  computedRangeEnd.setHours(23, 59, 59, 999);

  const isInRange = (dateObj) => dateObj && dateObj >= computedRangeStart && dateObj <= computedRangeEnd;

  const filteredOrders = orders.filter((order) => isInRange(parseDateSafe(order.date)));
  const filteredEvents = events.filter((event) => isInRange(parseDateSafe(event.timestamp)));
  const filteredUsers = users.filter((user) => isInRange(parseDateSafe(user.signupDate)));

  const userSearchTerm = userSearch.trim().toLowerCase();
  const now = new Date();
  const usersForList = filteredUsers.filter((user) => {
    const searchable = `${user.name || ''} ${user.email || ''}`.toLowerCase();
    const matchesSearch = userSearchTerm.length === 0 || searchable.includes(userSearchTerm);
    if (!matchesSearch) return false;

    const signupDate = parseDateSafe(user.signupDate);
    if (!signupDate) return false;

    if (userSignupFilter === '30d') {
      const since = new Date(now);
      since.setDate(since.getDate() - 30);
      return signupDate >= since;
    }

    if (userSignupFilter === '90d') {
      const since = new Date(now);
      since.setDate(since.getDate() - 90);
      return signupDate >= since;
    }

    if (userSignupFilter === 'this-year') {
      return signupDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  const totalUsersPages = Math.max(1, Math.ceil(usersForList.length / usersPerPage));
  const usersStartIndex = (currentUsersPage - 1) * usersPerPage;
  const visibleUsers = usersForList.slice(usersStartIndex, usersStartIndex + usersPerPage);

  useEffect(() => {
    setCurrentUsersPage(1);
  }, [userSearch, userSignupFilter, usersPerPage, selectedPreset, customStartDate, customEndDate]);

  useEffect(() => {
    if (currentUsersPage > totalUsersPages) {
      setCurrentUsersPage(totalUsersPages);
    }
  }, [currentUsersPage, totalUsersPages]);

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const uniqueBuyerCount = new Set(filteredOrders.map((order) => order.userId).filter(Boolean)).size;
  const conversionRate = filteredUsers.length > 0 ? (uniqueBuyerCount / filteredUsers.length) * 100 : 0;
  const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  const productOrderCount = {};
  filteredOrders.forEach((order) => {
    const product = order.product || 'Unknown';
    const quantity = order.quantity || 1;
    productOrderCount[product] = (productOrderCount[product] || 0) + quantity;
  });

  const sortedProducts = Object.entries(productOrderCount).sort((a, b) => b[1] - a[1]);
  const topProductName = sortedProducts[0]?.[0] || 'N/A';
  const topProductUnits = sortedProducts[0]?.[1] || 0;

  const toDateKey = (dateObj) => [
    dateObj.getFullYear(),
    String(dateObj.getMonth() + 1).padStart(2, '0'),
    String(dateObj.getDate()).padStart(2, '0'),
  ].join('-');

  const isWithinRange = (dateObj, range) => dateObj && dateObj >= range.start && dateObj <= range.end;

  const revenueChartRange = resolveChartRange(revenueChartPreset, revenueChartStartDate, revenueChartEndDate);
  const ordersChartRange = resolveChartRange(ordersChartPreset, ordersChartStartDate, ordersChartEndDate);
  const eventsChartRange = resolveChartRange(eventsChartPreset, eventsChartStartDate, eventsChartEndDate);
  const monthlyChartRange = resolveChartRange(monthlyChartPreset, monthlyChartStartDate, monthlyChartEndDate);

  const revenueChartStartDay = new Date(revenueChartRange.start);
  revenueChartStartDay.setHours(0, 0, 0, 0);
  const revenueChartEndDay = new Date(revenueChartRange.end);
  revenueChartEndDay.setHours(0, 0, 0, 0);

  const revenueDailyMapForChart = {};
  orders.forEach((order) => {
    const orderDate = parseDateSafe(order.date);
    if (!isWithinRange(orderDate, revenueChartRange)) return;

    const normalized = new Date(orderDate);
    normalized.setHours(0, 0, 0, 0);
    const dateKey = toDateKey(normalized);
    revenueDailyMapForChart[dateKey] = (revenueDailyMapForChart[dateKey] || 0) + (order.amount || 0);
  });

  const revenueChartDays = Math.max(
    1,
    Math.floor((revenueChartEndDay - revenueChartStartDay) / (1000 * 60 * 60 * 24)) + 1,
  );

  const revenueChartData = Array.from({ length: revenueChartDays }, (_, index) => {
    const current = new Date(revenueChartStartDay);
    current.setDate(revenueChartStartDay.getDate() + index);
    const dateKey = toDateKey(current);
    return {
      name: dateKey,
      revenue: revenueDailyMapForChart[dateKey] || 0,
    };
  });

  const ordersChartStartDay = new Date(ordersChartRange.start);
  ordersChartStartDay.setHours(0, 0, 0, 0);
  const ordersChartEndDay = new Date(ordersChartRange.end);
  ordersChartEndDay.setHours(0, 0, 0, 0);

  const dailyOrdersMapForChart = {};
  orders.forEach((order) => {
    const orderDate = parseDateSafe(order.date);
    if (!isWithinRange(orderDate, ordersChartRange)) return;

    const normalized = new Date(orderDate);
    normalized.setHours(0, 0, 0, 0);
    const dateKey = toDateKey(normalized);
    dailyOrdersMapForChart[dateKey] = (dailyOrdersMapForChart[dateKey] || 0) + 1;
  });

  const ordersChartDays = Math.max(
    1,
    Math.floor((ordersChartEndDay - ordersChartStartDay) / (1000 * 60 * 60 * 24)) + 1,
  );

  const ordersChartData = Array.from({ length: ordersChartDays }, (_, index) => {
    const current = new Date(ordersChartStartDay);
    current.setDate(ordersChartStartDay.getDate() + index);
    const dateKey = toDateKey(current);
    return {
      dateKey,
      dayLabel: new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      orders: dailyOrdersMapForChart[dateKey] || 0,
    };
  });

  const eventPalette = ['#0EA5E9', '#14B8A6', '#6366F1', '#F59E0B', '#F43F5E', '#8B5CF6'];
  const eventCountsForChart = {};
  events.forEach((event) => {
    const eventDate = parseDateSafe(event.timestamp);
    if (!isWithinRange(eventDate, eventsChartRange)) return;
    const type = event.type || 'unknown';
    eventCountsForChart[type] = (eventCountsForChart[type] || 0) + 1;
  });

  const eventsChartData = Object.keys(eventCountsForChart).map((key, index) => ({
    name: key,
    value: eventCountsForChart[key],
    color: eventPalette[index % eventPalette.length],
  }));

  const monthlyChartStartMonth = new Date(monthlyChartRange.start.getFullYear(), monthlyChartRange.start.getMonth(), 1);
  const monthlyChartEndMonth = new Date(monthlyChartRange.end.getFullYear(), monthlyChartRange.end.getMonth(), 1);

  const monthlyRevenueMapForChart = {};
  orders.forEach((order) => {
    const orderDate = parseDateSafe(order.date);
    if (!isWithinRange(orderDate, monthlyChartRange)) return;
    const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenueMapForChart[monthKey] = (monthlyRevenueMapForChart[monthKey] || 0) + (order.amount || 0);
  });

  const monthlyChartRangeLength =
    (monthlyChartEndMonth.getFullYear() - monthlyChartStartMonth.getFullYear()) * 12 +
    (monthlyChartEndMonth.getMonth() - monthlyChartStartMonth.getMonth()) +
    1;

  const monthlyRevenueChartData = Array.from({ length: Math.max(1, monthlyChartRangeLength) }, (_, index) => {
    const monthDate = new Date(monthlyChartStartMonth.getFullYear(), monthlyChartStartMonth.getMonth() + index, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

    return {
      name: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: monthlyRevenueMapForChart[monthKey] || 0,
    };
  });

  const revenueChartSubtitle = getRangeSubtitle(revenueChartStartDay, revenueChartEndDay);
  const ordersChartSubtitle = getRangeSubtitle(ordersChartStartDay, ordersChartEndDay);
  const eventsChartSubtitle = getRangeSubtitle(eventsChartRange.start, eventsChartRange.end);
  const monthlyChartSubtitle = getRangeSubtitle(monthlyChartStartMonth, monthlyChartRange.end);

  // 🔥 REVENUE CHART DATA (daily, aggregated)
  const dailyRevenueMap = {};
  let latestOrderDate = null;

  filteredOrders.forEach((order) => {
    const orderDate = new Date(order.date);
    if (Number.isNaN(orderDate.getTime())) return;

    const normalized = new Date(orderDate);
    normalized.setHours(0, 0, 0, 0);
    const dateKey = toDateKey(normalized);

    dailyRevenueMap[dateKey] = (dailyRevenueMap[dateKey] || 0) + (order.amount || 0);

    if (!latestOrderDate || normalized > latestOrderDate) {
      latestOrderDate = normalized;
    }
  });

  const rangeStartDay = new Date(computedRangeStart);
  rangeStartDay.setHours(0, 0, 0, 0);
  const rangeEndDay = new Date(computedRangeEnd);
  rangeEndDay.setHours(0, 0, 0, 0);

  const daysInRange = Math.max(1, Math.floor((rangeEndDay - rangeStartDay) / (1000 * 60 * 60 * 24)) + 1);

  const revenueData = Array.from({ length: daysInRange }, (_, index) => {
    const current = new Date(rangeStartDay);
    current.setDate(rangeStartDay.getDate() + index);
    const dateKey = toDateKey(current);

    return {
      name: dateKey,
      revenue: dailyRevenueMap[dateKey] || 0,
    };
  });

  const monthlyRevenueMap = {};
  filteredOrders.forEach((order) => {
    const orderDate = new Date(order.date);
    if (Number.isNaN(orderDate.getTime())) return;

    const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + (order.amount || 0);
  });

  const insightsStartMonth = new Date(rangeStartDay.getFullYear(), rangeStartDay.getMonth(), 1);
  const insightsEndMonth = new Date(rangeEndDay.getFullYear(), rangeEndDay.getMonth(), 1);
  const monthlyRangeLength =
    (insightsEndMonth.getFullYear() - insightsStartMonth.getFullYear()) * 12 +
    (insightsEndMonth.getMonth() - insightsStartMonth.getMonth()) +
    1;

  const monthlyRevenueData = Array.from({ length: monthlyRangeLength }, (_, index) => {
    const monthDate = new Date(insightsStartMonth.getFullYear(), insightsStartMonth.getMonth() + index, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

    return {
      name: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: monthlyRevenueMap[monthKey] || 0,
    };
  });

  const allTimeMonthlyRevenueMap = {};
  orders.forEach((order) => {
    const orderDate = new Date(order.date);
    if (Number.isNaN(orderDate.getTime())) return;

    const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    allTimeMonthlyRevenueMap[monthKey] = (allTimeMonthlyRevenueMap[monthKey] || 0) + (order.amount || 0);
  });

  const allTimeMonthlyStart = new Date(timelineMinDate.getFullYear(), timelineMinDate.getMonth(), 1);
  const allTimeMonthlyEnd = new Date(timelineMaxDate.getFullYear(), timelineMaxDate.getMonth(), 1);
  const allTimeMonthlyRangeLength =
    (allTimeMonthlyEnd.getFullYear() - allTimeMonthlyStart.getFullYear()) * 12 +
    (allTimeMonthlyEnd.getMonth() - allTimeMonthlyStart.getMonth()) +
    1;

  const insightsMonthlyRevenueData = Array.from({ length: allTimeMonthlyRangeLength }, (_, index) => {
    const monthDate = new Date(allTimeMonthlyStart.getFullYear(), allTimeMonthlyStart.getMonth() + index, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

    return {
      name: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: allTimeMonthlyRevenueMap[monthKey] || 0,
    };
  });

  const insightsRangeSubtitle = getRangeSubtitle(allTimeMonthlyStart, timelineMaxDate);

  const dailyOrdersMap = {};
  filteredOrders.forEach((order) => {
    const orderDate = new Date(order.date);
    if (Number.isNaN(orderDate.getTime())) return;

    const dateKey = toDateKey(orderDate);

    dailyOrdersMap[dateKey] = (dailyOrdersMap[dateKey] || 0) + 1;
  });

  const ordersData = Array.from({ length: daysInRange }, (_, index) => {
    const current = new Date(rangeStartDay);
    current.setDate(rangeStartDay.getDate() + index);
    const dateKey = toDateKey(current);

    return {
      dateKey,
      dayLabel: new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      orders: dailyOrdersMap[dateKey] || 0,
    };
  });

  // 🔥 AI INSIGHTS
  const insight = generateInsights(filteredUsers, filteredOrders, filteredEvents);

  const insightPriority = {
    critical: 0,
    warning: 1,
    healthy: 2,
    positive: 2,
    info: 3,
  };

  const keyInsightItems = [...insight]
    .filter((item) => item.id !== 'insight-key-takeaway')
    .sort((a, b) => (insightPriority[a.type] ?? 99) - (insightPriority[b.type] ?? 99))
    .slice(0, 3)
    .map((item) => {
      const actionPart = item.description?.includes('Action:')
        ? item.description.split('Action:')[1].trim()
        : item.description;

      const headline = actionPart
        ?.split('.')
        .map((part) => part.trim())
        .filter(Boolean)[0] || item.title;

      return {
        id: item.id,
        emoji: item.type === 'critical' ? '🚨' : item.type === 'warning' ? '⚠️' : '📈',
        text: `${item.title}: ${headline}`,
      };
    });

  const rangeSubtitle = getRangeSubtitle(rangeStartDay, rangeEndDay);

  const renderChartRangeControls = ({
    label,
    preset,
    onPresetChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
  }) => (
    <div className="rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-3 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{label}</p>
        <select
          value={preset}
          onChange={(e) => onPresetChange(e.target.value)}
          className="h-9 sm:max-w-[180px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200"
        >
          {PRESET_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.id === 'all' ? 'All Time' : option.label}
            </option>
          ))}
        </select>
      </div>

      {preset === 'custom' && (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="date"
            value={startDate}
            min={formatInputDate(timelineMinDate)}
            max={formatInputDate(timelineMaxDate)}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200"
          />
          <input
            type="date"
            value={endDate}
            min={formatInputDate(timelineMinDate)}
            max={formatInputDate(timelineMaxDate)}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen app-shell">
      {isSidebarOpen && (
        <button
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px] z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="min-h-screen w-full md:pl-60">
        <header className="sticky top-0 z-20 px-4 md:px-8 pt-4 md:pt-6">
          <div className="h-16 rounded-2xl border border-white/60 dark:border-slate-800 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md shadow-[0_8px_30px_rgba(15,23,42,0.08)] flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden h-10 w-10 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 font-semibold">Analytics workspace</p>
                <h1 className="text-lg md:text-xl font-semibold capitalize text-slate-900 dark:text-slate-100">
                  {activeNav === 'dashboard' ? 'Overview' : activeNav}
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-7">
          <section className="rounded-3xl border border-slate-300/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-700 via-slate-600 to-sky-700 px-5 py-6 md:px-8 md:py-8 text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] animate-fade-up">
            <p className="text-xs uppercase tracking-[0.2em] text-white/75 font-semibold">Performance snapshot</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">Live intelligence for your operations</h2>
            <p className="mt-2 text-sm md:text-base text-white/85 max-w-2xl">Track revenue, customer behavior, and order patterns in a streamlined executive view designed for fast decisions.</p>
          </section>

          <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/75 backdrop-blur-md p-4 md:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] animate-fade-up">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Time filter</p>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="h-10 sm:max-w-[220px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200"
                  aria-label="Time filter"
                >
                  {PRESET_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.id === 'all' ? 'All Time' : option.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPreset === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Start Date
                    <input
                      type="date"
                      value={customStartDate}
                      min={formatInputDate(timelineMinDate)}
                      max={formatInputDate(timelineMaxDate)}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    End Date
                    <input
                      type="date"
                      value={customEndDate}
                      min={formatInputDate(timelineMinDate)}
                      max={formatInputDate(timelineMaxDate)}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                    />
                  </label>
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400">Applied range: {rangeSubtitle}</p>
            </div>
          </section>

          <div className="space-y-6">
            {/* DASHBOARD */}
            {activeNav === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-5 animate-fade-up" style={{ animationDelay: '80ms' }}>
                  <MetricCard title="Users" value={filteredUsers.length.toLocaleString()} change="+8.2%" trend="up" icon="Users" color="blue" />
                  <MetricCard title="Orders" value={filteredOrders.length.toLocaleString()} change="+5.4%" trend="up" icon="ShoppingCart" color="indigo" />
                  <MetricCard title="Revenue" value={`$${totalRevenue.toLocaleString()}`} change="+11.7%" trend="up" icon="DollarSign" color="emerald" />
                  <MetricCard
                    title="Conversion Rate"
                    value={`${Math.round(conversionRate)}%`}
                    change={`${Math.round(conversionRate)}%`}
                    trend={conversionRate >= 35 ? 'up' : 'down'}
                    icon="TrendingUp"
                    color="blue"
                  />
                  <MetricCard
                    title="Avg Order Value"
                    value={`$${Math.round(averageOrderValue).toLocaleString()}`}
                    change={`$${Math.round(averageOrderValue).toLocaleString()}`}
                    trend={averageOrderValue >= 300 ? 'up' : 'down'}
                    icon="DollarSign"
                    color="emerald"
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5 animate-fade-up" style={{ animationDelay: '150ms' }}>
                  <div className="space-y-2">
                    {renderChartRangeControls({
                      label: 'Revenue Chart Range',
                      preset: revenueChartPreset,
                      onPresetChange: setRevenueChartPreset,
                      startDate: revenueChartStartDate,
                      onStartDateChange: setRevenueChartStartDate,
                      endDate: revenueChartEndDate,
                      onEndDateChange: setRevenueChartEndDate,
                    })}
                    <RevenueLineChart data={revenueChartData} subtitle={revenueChartSubtitle} />
                  </div>
                  <div className="space-y-2">
                    {renderChartRangeControls({
                      label: 'Orders Chart Range',
                      preset: ordersChartPreset,
                      onPresetChange: setOrdersChartPreset,
                      startDate: ordersChartStartDate,
                      onStartDateChange: setOrdersChartStartDate,
                      endDate: ordersChartEndDate,
                      onEndDateChange: setOrdersChartEndDate,
                    })}
                    <OrdersBarChart data={ordersChartData} subtitle={ordersChartSubtitle} />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5 animate-fade-up" style={{ animationDelay: '220ms' }}>
                  <div className="space-y-2">
                    {renderChartRangeControls({
                      label: 'Events Chart Range',
                      preset: eventsChartPreset,
                      onPresetChange: setEventsChartPreset,
                      startDate: eventsChartStartDate,
                      onStartDateChange: setEventsChartStartDate,
                      endDate: eventsChartEndDate,
                      onEndDateChange: setEventsChartEndDate,
                    })}
                    <EventPieChart data={eventsChartData} subtitle={eventsChartSubtitle} />
                  </div>
                </div>

                <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/75 backdrop-blur-md p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] animate-fade-up" style={{ animationDelay: '290ms' }}>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">⚡ Key Insight</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    {keyInsightItems.map((item) => (
                      <p key={item.id}>{item.emoji} {item.text}</p>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* USERS PAGE */}
            {activeNav === 'users' && (
              <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/75 dark:bg-slate-900/70 backdrop-blur-md p-5 md:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Users</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name or email"
                    className="md:col-span-2 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  />
                  <select
                    value={userSignupFilter}
                    onChange={(e) => setUserSignupFilter(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  >
                    <option value="all">All Signups</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="this-year">This Year</option>
                  </select>
                  <select
                    value={usersPerPage}
                    onChange={(e) => setUsersPerPage(Number(e.target.value))}
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                    aria-label="Users shown"
                  >
                    <option value={10}>Show 10</option>
                    <option value={25}>Show 25</option>
                    <option value={50}>Show 50</option>
                    <option value={100}>Show 100</option>
                  </select>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Showing {usersForList.length === 0 ? 0 : usersStartIndex + 1}
                  {' '}-{' '}
                  {Math.min(usersStartIndex + usersPerPage, usersForList.length)}
                  {' '}of {usersForList.length} users
                </p>

                <div className="space-y-3">
                  {usersForList.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No users found for this search/filter.</p>
                  )}

                  {visibleUsers.map((user, index) => (
                    <div key={index} className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-900/80">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Joined {new Date(user.signupDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>

                {usersForList.length > 0 && (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Page {currentUsersPage} of {totalUsersPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentUsersPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentUsersPage === 1}
                        className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentUsersPage((prev) => Math.min(totalUsersPages, prev + 1))}
                        disabled={currentUsersPage === totalUsersPages}
                        className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* INSIGHTS */}
            {activeNav === 'insights' && (
              <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/75 dark:bg-slate-900/70 backdrop-blur-md p-5 md:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Insights</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Conversion Rate, Funnel Drop-off, and all business signals in Metric - Interpretation - Action format.
                </p>
                <div className="mt-5">
                  <AIInsightsPanel insights={insight} />
                </div>
              </section>
            )}

            {/* SETTINGS */}
            {activeNav === 'settings' && (
              <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/75 dark:bg-slate-900/70 backdrop-blur-md p-5 md:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Settings</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Configure list behavior for the users page.
                </p>

                <div className="mt-5 max-w-md space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="default-users-page-size">
                    Default users shown per page
                  </label>
                  <select
                    id="default-users-page-size"
                    value={usersPerPage}
                    onChange={(e) => setUsersPerPage(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  >
                    <option value={10}>10 users</option>
                    <option value={25}>25 users</option>
                    <option value={50}>50 users</option>
                    <option value={100}>100 users</option>
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This value is used as the users page page-size and can still be changed there anytime.
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;