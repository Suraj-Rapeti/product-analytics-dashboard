export const metrics = [
  {
    id: 1,
    title: 'Total Users',
    value: '84,291',
    change: '+12.5%',
    trend: 'up',
    icon: 'Users',
    color: 'blue',
  },
  {
    id: 2,
    title: 'Total Orders',
    value: '23,847',
    change: '+8.2%',
    trend: 'up',
    icon: 'ShoppingCart',
    color: 'indigo',
  },
  {
    id: 3,
    title: 'Total Revenue',
    value: '$1.24M',
    change: '+18.7%',
    trend: 'up',
    icon: 'DollarSign',
    color: 'emerald',
  },
];

export const revenueData = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 53000 },
  { month: 'Mar', revenue: 61000 },
  { month: 'Apr', revenue: 57000 },
  { month: 'May', revenue: 71000 },
  { month: 'Jun', revenue: 88000 },
  { month: 'Jul', revenue: 95000 },
  { month: 'Aug', revenue: 103000 },
  { month: 'Sep', revenue: 98000 },
  { month: 'Oct', revenue: 117000 },
  { month: 'Nov', revenue: 131000 },
  { month: 'Dec', revenue: 148000 },
];

export const ordersData = [
  { day: 'Mon', orders: 310 },
  { day: 'Tue', orders: 452 },
  { day: 'Wed', orders: 389 },
  { day: 'Thu', orders: 521 },
  { day: 'Fri', orders: 610 },
  { day: 'Sat', orders: 743 },
  { day: 'Sun', orders: 482 },
];

export const eventData = [
  { name: 'Page View',    value: 4320, color: '#3B82F6' },
  { name: 'Click',        value: 2810, color: '#6366F1' },
  { name: 'Purchase',     value: 1540, color: '#22C55E' },
  { name: 'Sign Up',      value: 980,  color: '#F59E0B' },
  { name: 'Share',        value: 620,  color: '#EC4899' },
];

export const insights = [
  {
    id: 1,
    title: 'Revenue Spike Detected',
    description: 'Revenue jumped 26% in October vs September. Likely driven by the fall campaign launch.',
    type: 'positive',
  },
  {
    id: 2,
    title: 'Peak Order Day — Saturday',
    description: 'Saturday consistently records the highest order volume (743 orders/day on avg). Consider scaling infra.',
    type: 'info',
  },
  {
    id: 3,
    title: 'User Growth Trending Up',
    description: 'New user acquisition has grown 12.5% MoM. Retention rate is stable at 78%.',
    type: 'positive',
  },
  {
    id: 4,
    title: 'Low Share Event Rate',
    description: 'Share events account for only 6% of total events. Consider adding share prompts post-purchase.',
    type: 'warning',
  },
];
