// Realistic mock dataset designed to seamlessly map to future REST API responses:
// GET /api/dashboard/stats, GET /api/inventory, GET /api/donations, GET /api/requests, GET /api/issues

export const dashboardStats = {
  totalInventory: {
    value: 2850,
    unit: 'Units',
    label: 'Total Blood Inventory',
    change: '+8.4%',
    period: 'this month',
    trend: 'up',
  },
  recentDonations: {
    value: 115,
    unit: 'Donations',
    label: 'Recent Donations',
    change: '+12%',
    period: 'vs last week',
    trend: 'up',
  },
  pendingRequests: {
    value: 22,
    unit: 'Requests',
    label: 'Pending Requests',
    change: '4 urgent',
    period: 'requiring review',
    trend: 'neutral',
  },
  criticalLowAlerts: {
    value: 3,
    unit: 'Groups',
    label: 'Critical Low Alerts',
    change: 'O-, AB-, B-',
    period: 'below safety buffer',
    trend: 'down',
  },
};

export const bloodGroupInventory = [
  { group: 'A+', available: 420, reserved: 35, total: 455, percentage: 15, status: 'Optimal', color: '#D95364' },
  { group: 'A-', available: 150, reserved: 20, total: 170, percentage: 6, status: 'Adequate', color: '#C84859' },
  { group: 'B+', available: 380, reserved: 45, total: 425, percentage: 14, status: 'Optimal', color: '#BC3A4D' },
  { group: 'B-', available: 120, reserved: 15, total: 135, percentage: 5, status: 'Low', color: '#A92F41' },
  { group: 'AB+', available: 210, reserved: 18, total: 228, percentage: 8, status: 'Adequate', color: '#9B1D30' },
  { group: 'AB-', available: 80, reserved: 12, total: 92, percentage: 3, status: 'Critical', color: '#881829' },
  { group: 'O+', available: 550, reserved: 65, total: 615, percentage: 22, status: 'High Demand', color: '#681120' },
  { group: 'O-', available: 170, reserved: 30, total: 200, percentage: 7, status: 'Critical', color: '#4D0A16' },
];

export const donutData = [
  { name: 'O+', value: 550, color: '#4D0A16' },
  { name: 'A+', value: 420, color: '#681120' },
  { name: 'B+', value: 380, color: '#881829' },
  { name: 'AB+', value: 210, color: '#9B1D30' },
  { name: 'O-', value: 170, color: '#A92F41' },
  { name: 'A-', value: 150, color: '#BC3A4D' },
  { name: 'B-', value: 120, color: '#C84859' },
  { name: 'AB-', value: 80, color: '#D95364' },
];

export const criticalBloodRequests = [
  {
    id: 101,
    hospital: 'Apollo Hospital',
    bloodGroup: 'O-',
    unitsRequired: 6,
    urgency: 'Critical',
    timeAgo: '8 min ago',
    contact: 'Dr. Ramesh (ER)',
  },
  {
    id: 102,
    hospital: 'Fortis Healthcare',
    bloodGroup: 'AB-',
    unitsRequired: 2,
    urgency: 'Critical',
    timeAgo: '24 min ago',
    contact: 'Blood Bank Desk',
  },
  {
    id: 103,
    hospital: 'Manipal Hospital',
    bloodGroup: 'B-',
    unitsRequired: 4,
    urgency: 'Critical',
    timeAgo: '42 min ago',
    contact: 'Emergency Ward',
  },
];

export const recentDonationsList = [
  {
    id: 201,
    donorName: 'Rahul Sharma',
    bloodGroup: 'O+',
    amount: '450 ml',
    status: 'Approved',
    timeAgo: '18 min ago',
  },
  {
    id: 202,
    donorName: 'Priya Nair',
    bloodGroup: 'A+',
    amount: '450 ml',
    status: 'Approved',
    timeAgo: '35 min ago',
  },
  {
    id: 203,
    donorName: 'Vikram Mehta',
    bloodGroup: 'B+',
    amount: '450 ml',
    status: 'Pending Lab',
    timeAgo: '1 hour ago',
  },
  {
    id: 204,
    donorName: 'Ananya Sen',
    bloodGroup: 'AB-',
    amount: '350 ml',
    status: 'Approved',
    timeAgo: '2 hours ago',
  },
];

export const donationActivityTrends = {
  '7D': [
    { day: 'Mon', donations: 14, collected: 14, approved: 13, rejected: 1 },
    { day: 'Tue', donations: 18, collected: 18, approved: 16, rejected: 2 },
    { day: 'Wed', donations: 12, collected: 12, approved: 11, rejected: 1 },
    { day: 'Thu', donations: 24, collected: 24, approved: 22, rejected: 2 },
    { day: 'Fri', donations: 19, collected: 19, approved: 18, rejected: 1 },
    { day: 'Sat', donations: 28, collected: 28, approved: 26, rejected: 2 },
    { day: 'Sun', donations: 16, collected: 16, approved: 15, rejected: 1 },
  ],
  '30D': [
    { day: 'W1', donations: 95, collected: 95, approved: 88, rejected: 7 },
    { day: 'W2', donations: 120, collected: 120, approved: 112, rejected: 8 },
    { day: 'W3', donations: 110, collected: 110, approved: 104, rejected: 6 },
    { day: 'W4', donations: 135, collected: 135, approved: 128, rejected: 7 },
  ],
  '90D': [
    { day: 'Jul', donations: 420, collected: 420, approved: 395, rejected: 25 },
    { day: 'Aug', donations: 480, collected: 480, approved: 455, rejected: 25 },
    { day: 'Sep', donations: 510, collected: 510, approved: 485, rejected: 25 },
  ],
};

export const inventoryHealthSummary = {
  available: 2120,
  reserved: 340,
  issued: 390,
  expiringSoon: 13,
  healthScore: 94,
  status: 'Healthy',
};

export const hospitalDemandList = [
  { group: 'O+', requests: 38, percentage: 85, trend: '+14%' },
  { group: 'A+', requests: 24, percentage: 65, trend: '+8%' },
  { group: 'B+', requests: 19, percentage: 50, trend: '+5%' },
  { group: 'O-', requests: 12, percentage: 32, trend: '+18%' },
  { group: 'AB+', requests: 9, percentage: 24, trend: '-2%' },
];

export const expiringUnitsList = [
  { group: 'O+', count: 4, daysLeft: 2, batch: 'BCH-8902', urgent: true },
  { group: 'A+', count: 3, daysLeft: 4, batch: 'BCH-8941', urgent: false },
  { group: 'B+', count: 2, daysLeft: 6, batch: 'BCH-8988', urgent: false },
  { group: 'AB+', count: 1, daysLeft: 7, batch: 'BCH-9003', urgent: false },
];
