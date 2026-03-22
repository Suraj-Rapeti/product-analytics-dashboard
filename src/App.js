import React, { useState } from 'react';
import './App.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import RevenueLineChart from './components/RevenueLineChart';
import OrdersBarChart from './components/OrdersBarChart';
import EventPieChart from './components/EventPieChart';
import AIInsightsPanel from './components/AIInsightsPanel';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { metrics, revenueData, ordersData, eventData, insights } from './data/mockData';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function Dashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const mockUsers = [
    { id: 1, name: 'Alex Kim', email: 'alex@analytica.ai', signupDate: '2025-10-21' },
    { id: 2, name: 'Priya Shah', email: 'priya@analytica.ai', signupDate: '2025-11-03' },
    { id: 3, name: 'Jordan Lee', email: 'jordan@analytica.ai', signupDate: '2025-11-12' },
    { id: 4, name: 'Sam Carter', email: 'sam@analytica.ai', signupDate: '2025-12-01' },
    { id: 5, name: 'Taylor Ng', email: 'taylor@analytica.ai', signupDate: '2025-12-15' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Main content */}
      <main className="flex-1 ml-60 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 transition-colors duration-200">
          <div>
            <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100 capitalize">
              {activeNav === 'dashboard' ? 'Overview' : activeNav}
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-1.5 w-48 transition-colors duration-200">
              <Search size={13} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search…"
                className="bg-transparent text-xs text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 outline-none w-full"
              />
            </div>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notification bell */}
            <button className="relative w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
            </button>

            {/* Avatar */}
            <img
              src="https://i.pravatar.cc/32?u=alex-dashboard"
              alt="Alex Kim"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-700"
            />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 space-y-5">
          {/* Page content by active nav */}
          <>
              {activeNav === 'dashboard' && (
                <>
                  {/* Metric cards */}
                  <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {metrics.map((m) => (
                        <MetricCard key={m.id} {...m} />
                      ))}
                    </div>
                  </section>

                  {/* Charts grid */}
                  <section>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <RevenueLineChart data={revenueData} />
                      </div>
                      <div className="lg:col-span-1">
                        <EventPieChart data={eventData} />
                      </div>
                    </div>
                  </section>

                  {/* Orders bar chart */}
                  <section>
                    <OrdersBarChart data={ordersData} />
                  </section>

                  {/* AI Insights */}
                  <section>
                    <AIInsightsPanel insights={insights} />
                  </section>
                </>
              )}

              {activeNav === 'users' && (
                <>
                  <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <MetricCard
                        title="Total Users"
                        value="84,291"
                        change="+0.0%"
                        trend="up"
                        icon="Users"
                        color="blue"
                      />
                      <MetricCard
                        title="Users With Orders"
                        value="23,847"
                        change="+0.0%"
                        trend="up"
                        icon="ShoppingCart"
                        color="indigo"
                      />
                      <MetricCard
                        title="Avg Revenue / User"
                        value="$14.7"
                        change="+0.0%"
                        trend="up"
                        icon="DollarSign"
                        color="emerald"
                      />
                    </div>
                  </section>

                  <section>
                    <div className="bg-white dark:bg-slate-800/80 dark:ring-1 dark:ring-slate-700/50 rounded-xl shadow-card dark:shadow-none px-5 py-5 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Recent Users</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Showing latest 10</p>
                      </div>
                      <div className="space-y-2">
                        {mockUsers.map((user) => (
                          <div
                            key={user.id || user.email || user.name}
                            className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900/50 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name || 'Unknown User'}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">{user.email || 'No email'}</p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {user.signupDate ? new Date(user.signupDate).toLocaleDateString('en-US') : 'N/A'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </>
              )}

              {activeNav === 'insights' && (
                <>
                  <section>
                    <AIInsightsPanel insights={insights} />
                  </section>

                  <section>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <RevenueLineChart data={revenueData} />
                      </div>
                      <div className="lg:col-span-1">
                        <EventPieChart data={eventData} />
                      </div>
                    </div>
                  </section>
                </>
              )}

              {activeNav === 'settings' && (
                <section>
                  <div className="bg-white dark:bg-slate-800/80 dark:ring-1 dark:ring-slate-700/50 rounded-xl shadow-card dark:shadow-none px-5 py-6 transition-colors duration-200">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Settings</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Settings page is ready for Firebase config, profile, and notification preferences.
                    </p>
                  </div>
                </section>
              )}
          </>
        </div>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            AnalyticaAI · Dashboard · Data refreshed as of{' '}
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </footer>
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
