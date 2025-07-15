const crypto = require('crypto');

const INSTALLATION_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

// NOTE: We can create a UUID field avoid exposing the ID value.
const installations = [
  {
    id: 1,
    date: '2025-05-15',
    address: 'San Francisco',
    state: 'CA',
    status: INSTALLATION_STATUS.SCHEDULED,
    estimatedCostSavings: 12500
  },
  {
    id: 2,
    date: '2025-05-20',
    address: 'Los Angeles',
    state: 'CA',
    status: INSTALLATION_STATUS.COMPLETED,
    estimatedCostSavings: 15000
  },
  {
    id: 3,
    date: '2025-05-25',
    address: 'San Diego',
    state: 'CA',
    status: INSTALLATION_STATUS.CANCELLED,
    estimatedCostSavings: 10000,
    
  },
  {
    id: 4,
    date: '2025-05-26',
    address: 'San Diego',
    state: 'CA',
    status: INSTALLATION_STATUS.SCHEDULED,
    estimatedCostSavings: 12000
  },
  {
    id: 5,
    date: '2025-05-26',
    address: 'Chicago',
    state: 'IL',
    status: INSTALLATION_STATUS.COMPLETED,
    estimatedCostSavings: 11000
  },
  {
    id: 6,
    date: '2025-06-01',
    address: 'New York',
    state: 'NY',
    status: INSTALLATION_STATUS.SCHEDULED,
    estimatedCostSavings: 13000
  },
  {
    id: 7,
    date: '2025-06-02',
    address: 'Chicago',
    state: 'IL',
    status: INSTALLATION_STATUS.CANCELLED,
    estimatedCostSavings: 9000
  },
  {
    id: 8,
    date: '2025-06-03',
    address: 'Houston',
    state: 'TX',
    status: INSTALLATION_STATUS.COMPLETED,
    estimatedCostSavings: 20000
  },
  {
    id: 9,
    date: '2025-06-04',
    address: 'Phoenix',
    state: 'AZ',
    status: INSTALLATION_STATUS.SCHEDULED,
    estimatedCostSavings: 15000
  },
  {
    id: 10,
    date: '2025-06-05',
    address: 'Philadelphia',
    state: 'PA',
    status: INSTALLATION_STATUS.COMPLETED,
    estimatedCostSavings: 11000
  },
  {
    id: 11,
    date: '2025-06-06',
    address: 'San Antonio',
    state: 'TX',
    status: INSTALLATION_STATUS.SCHEDULED,
    estimatedCostSavings: 17000
  },
  {
    id: 12,
    date: '2025-06-07',
    address: 'Dallas',
    state: 'TX',
    status: INSTALLATION_STATUS.CANCELLED,
    estimatedCostSavings: 8000
  },
  {
    id: 13,
    date: '2025-06-08',
    address: 'San Jose',
    state: 'CA',
    status: INSTALLATION_STATUS.SCHEDULED,
    estimatedCostSavings: 14000
  },
  {
    id: 14,
    date: '2025-06-09',
    address: 'Austin',
    state: 'TX',
    status: INSTALLATION_STATUS.SCHEDULED,
    estimatedCostSavings: 12500
  },
  {
    id: 15,
    date: '2025-06-10',
    address: 'Jacksonville',
    state: 'FL',
    status: INSTALLATION_STATUS.COMPLETED,
    estimatedCostSavings: 16000
  },
  {
    id: 16,
    date: '2025-06-11',
    address: 'Fort Worth',
    state: 'TX',
    status: INSTALLATION_STATUS.CANCELLED,
    estimatedCostSavings: 10000
  },
  {
    id: 17,
    date: '2025-06-12',
    address: 'Columbus',
    state: 'OH',
    status: INSTALLATION_STATUS.SCHEDULED,
    estimatedCostSavings: 13500
  },
  {
    id: 18,
    date: '2025-06-13',
    address: 'Charlotte',
    state: 'NC',
    status: INSTALLATION_STATUS.COMPLETED,
    estimatedCostSavings: 14500
  },
  {
    id: 19,
    date: '2025-06-14',
    address: 'Indianapolis',
    state: 'IN',
    status: INSTALLATION_STATUS.SCHEDULED,
    estimatedCostSavings: 15500
  },
  {
    id: 20,
    date: '2025-06-15',
    address: 'Seattle',
    state: 'WA',
    status: INSTALLATION_STATUS.CANCELLED,
    estimatedCostSavings: 18000
  },
  {
    id: 21,
    date: '2025-06-16',
    address: 'Denver',
    state: 'CO',
    status: INSTALLATION_STATUS.COMPLETED,
    estimatedCostSavings: 19000
  }
];

const installationsWithUUID = installations.map(installation => ({
  ...installation,
  uuid: crypto.randomUUID(),
  // Random createdAt to order by it.
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString()
}))

module.exports = { installations: installationsWithUUID, INSTALLATION_STATUS }