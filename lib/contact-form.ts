export const PROPERTY_LOCATION = 'Cape Town, South Africa';

export const PROPERTY_HOSTING_SUBJECTS = ['list-property'] as const;

export type PropertyHostingSubject = (typeof PROPERTY_HOSTING_SUBJECTS)[number];

export const CONTACT_SUBJECT_OPTIONS = [
  { value: 'booking', label: 'Booking Enquiry' },
  { value: 'list-property', label: 'List My Property' },
  { value: 'tours', label: 'Tours' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Other' },
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  'Studio Apartment',
  '1 Bedroom Apartment',
  '2 Bedroom Apartment',
  '3 Bedroom Apartment',
  'House',
  'Villa',
  'Other',
] as const;

export const BEDROOM_OPTIONS = ['Studio', '1', '2', '3', '4+'] as const;

export const BATHROOM_OPTIONS = ['1', '1.5', '2', '2.5', '3+'] as const;

export const PARKING_OPTIONS = ['Yes', 'No'] as const;

export const FURNISHING_OPTIONS = [
  'Fully Furnished',
  'Partially Furnished',
  'Unfurnished',
] as const;

export const CURRENTLY_LISTED_OPTIONS = [
  'Yes, Airbnb',
  'Yes, Booking.com',
  'Yes, both',
  'No',
  'Other',
] as const;

export const PROPERTY_CONDITION_OPTIONS = [
  'Guest Ready',
  'Needs Minor Improvements',
  'Needs Furniture / Styling',
  'Needs Maintenance',
  'Not Sure',
] as const;

export const YES_NO_OPTIONS = ['Yes', 'No'] as const;

export interface PropertyHostingDetails {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  location: string;
  areaSuburb: string;
  buildingName: string;
  unitNumber: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  furnishingStatus: string;
  currentlyListed: string;
  preferredStartDate: string;
  monthlyRentalIncome: string;
  propertyCondition: string;
  hasWifi: string;
  hasWashingMachine: string;
  hasAirConditioning: string;
  hasBackupPower: string;
  propertyDescription: string;
  additionalNotes: string;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  propertyHosting?: PropertyHostingDetails;
}

export function createEmptyPropertyHostingDetails(): PropertyHostingDetails {
  return {
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    location: PROPERTY_LOCATION,
    areaSuburb: '',
    buildingName: '',
    unitNumber: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    furnishingStatus: '',
    currentlyListed: '',
    preferredStartDate: '',
    monthlyRentalIncome: '',
    propertyCondition: '',
    hasWifi: '',
    hasWashingMachine: '',
    hasAirConditioning: '',
    hasBackupPower: '',
    propertyDescription: '',
    additionalNotes: '',
  };
}

export function isPropertyHostingSubject(subject: string): subject is PropertyHostingSubject {
  return (PROPERTY_HOSTING_SUBJECTS as readonly string[]).includes(subject);
}

export function getContactSubjectLabel(subject: string): string {
  return CONTACT_SUBJECT_OPTIONS.find((option) => option.value === subject)?.label ?? subject;
}

export function validateContactFormPayload(payload: ContactFormPayload): string | null {
  if (!payload.name.trim()) return 'Full name is required.';
  if (!payload.email.trim()) return 'Email address is required.';
  if (!payload.subject.trim()) return 'Subject is required.';

  if (isPropertyHostingSubject(payload.subject)) {
    const property = payload.propertyHosting;
    if (!property) return 'Property hosting information is required.';

    if (!property.ownerName.trim()) return 'Owner full name is required.';
    if (!property.ownerEmail.trim()) return 'Owner email address is required.';
    if (!property.ownerPhone.trim()) return 'Owner phone number is required.';
    if (!property.areaSuburb.trim()) return 'Area / suburb is required.';
    if (!property.propertyType.trim()) return 'Property type is required.';
    if (!property.bedrooms.trim()) return 'Number of bedrooms is required.';
    if (!property.bathrooms.trim()) return 'Number of bathrooms is required.';
    if (!property.furnishingStatus.trim()) return 'Furnishing status is required.';
    if (!property.currentlyListed.trim()) return 'Currently listed status is required.';
    if (!property.preferredStartDate.trim()) return 'Preferred management start date is required.';
    if (!property.propertyCondition.trim()) return 'Property condition is required.';
    if (!property.propertyDescription.trim()) return 'Short property description is required.';

    return null;
  }

  if (!payload.message.trim()) return 'Message is required.';
  return null;
}
