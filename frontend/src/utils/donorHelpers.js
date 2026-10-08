import { BLOOD_GROUP_COLORS, defaultGroupColor } from './inventoryHelpers';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Standard ABO/Rh transfusion compatibility mapping
export const BLOOD_COMPATIBILITY = {
  'O-': {
    giveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['O-'],
    universal: 'Universal Red Cell Donor',
  },
  'O+': {
    giveTo: ['O+', 'A+', 'B+', 'AB+'],
    receiveFrom: ['O+', 'O-'],
  },
  'A-': {
    giveTo: ['A-', 'A+', 'AB-', 'AB+'],
    receiveFrom: ['A-', 'O-'],
  },
  'A+': {
    giveTo: ['A+', 'AB+'],
    receiveFrom: ['A+', 'A-', 'O+', 'O-'],
  },
  'B-': {
    giveTo: ['B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['B-', 'O-'],
  },
  'B+': {
    giveTo: ['B+', 'AB+'],
    receiveFrom: ['B+', 'B-', 'O+', 'O-'],
  },
  'AB-': {
    giveTo: ['AB-', 'AB+'],
    receiveFrom: ['AB-', 'A-', 'B-', 'O-'],
  },
  'AB+': {
    giveTo: ['AB+'],
    receiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    universal: 'Universal Recipient',
  },
};

/**
 * Evaluates donor status based strictly on verified backend constraints:
 * - Age 18–65 is an explicit backend constraint enforced by donor.controller.js.
 * - Last donation date tracks intake history.
 * - The backend does NOT expose clinical 90-day cooldown or >1 year inactive state.
 */
export function getDonorEligibility(donor) {
  if (!donor) {
    return {
      status: 'Unknown',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
      reason: 'No donor data available',
    };
  }

  // 1. Age constraint (explicitly enforced in backend POST /api/donors and PUT /api/donors/:id)
  if (donor.age < 18 || donor.age > 65) {
    return {
      status: 'Age Ineligible',
      badgeClass: 'bg-rose-50 text-brand-blood border-rose-200',
      reason: `Age ${donor.age} is outside the allowed 18–65 donation age range`,
      isAgeRestricted: true,
    };
  }

  // 2. Donor with no donation intake recorded
  if (!donor.last_donation_date) {
    return {
      status: 'New Donor',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      reason: 'Registered donor (No donation history recorded)',
      isNew: true,
    };
  }

  // 3. Active donor with donation history
  return {
    status: 'Active',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reason: `Active donor (Last donation recorded on ${donor.last_donation_date})`,
    isNew: false,
  };
}

/**
 * Format phone with readable spacing if standard 10-digit
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '—';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}
