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

  const toDateKey = (dateObj) => [
    dateObj.getFullYear(),
    String(dateObj.getMonth() + 1).padStart(2, '0'),
    String(dateObj.getDate()).padStart(2, '0'),
  ].join('-');

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

  // 🔥 EVENTS PIE CHART (GROUPED)
  const eventCounts = {};
  filteredEvents.forEach(e => {
    const type = e.type || "unknown";
    eventCounts[type] = (eventCounts[type] || 0) + 1;
  });

  const eventPalette = ['#0EA5E9', '#14B8A6', '#6366F1', '#F59E0B', '#F43F5E', '#8B5CF6'];
  const eventData = Object.keys(eventCounts).map((key, index) => ({
    name: key,
    value: eventCounts[key],
    color: eventPalette[index % eventPalette.length],
  }));

  // 🔥 AI INSIGHTS
  const insight = generateInsights(filteredUsers, filteredOrders);

  const rangeSubtitle = getRangeSubtitle(rangeStartDay, rangeEndDay);

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
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Chart range</p>
                {PRESET_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedPreset(option.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedPreset === option.id
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-fade-up" style={{ animationDelay: '80ms' }}>
                  <MetricCard title="Users" value={filteredUsers.length.toLocaleString()} change="+8.2%" trend="up" icon="Users" color="blue" />
                  <MetricCard title="Orders" value={filteredOrders.length.toLocaleString()} change="+5.4%" trend="up" icon="ShoppingCart" color="indigo" />
                  <MetricCard title="Revenue" value={`$${totalRevenue.toLocaleString()}`} change="+11.7%" trend="up" icon="DollarSign" color="emerald" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5 animate-fade-up" style={{ animationDelay: '150ms' }}>
                  <RevenueLineChart data={revenueData} subtitle={rangeSubtitle} />
                  <EventPieChart data={eventData} subtitle={rangeSubtitle} />
                </div>

                <div className="animate-fade-up" style={{ animationDelay: '220ms' }}>
                  <OrdersBarChart data={ordersData} subtitle={rangeSubtitle} />
                </div>

                <div className="animate-fade-up" style={{ animationDelay: '290ms' }}>
                  <AIInsightsPanel insights={insight} />
                </div>
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
              <div className="space-y-5">
                <MonthlyRevenueAreaChart data={monthlyRevenueData} subtitle={rangeSubtitle} />

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                  <MetricCard title="12M Revenue" value={`$${monthlyRevenueData.reduce((sum, m) => sum + m.revenue, 0).toLocaleString()}`} change="+9.4%" trend="up" icon="DollarSign" color="emerald" />
                  <MetricCard title="Avg Monthly" value={`$${Math.round(monthlyRevenueData.reduce((sum, m) => sum + m.revenue, 0) / (monthlyRevenueData.length || 1)).toLocaleString()}`} change="+3.1%" trend="up" icon="TrendingUp" color="blue" />
                  <MetricCard title="Best Month" value={monthlyRevenueData.reduce((best, item) => (item.revenue > best.revenue ? item : best), { name: '-', revenue: -1 }).name} change="Top" trend="up" icon="ShoppingCart" color="indigo" />
                </div>

                <AIInsightsPanel insights={insight} />
              </div>
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