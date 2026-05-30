import { NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/contact-email';
import {
  createEmptyPropertyHostingDetails,
  isPropertyHostingSubject,
  PROPERTY_LOCATION,
  validateContactFormPayload,
  type ContactFormPayload,
  type PropertyHostingDetails,
} from '@/lib/contact-form';
import {
  markContactSubmissionEmailSent,
  saveContactSubmission,
} from '@/lib/contact-submissions';

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePropertyHostingDetails(raw: unknown): PropertyHostingDetails {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  return {
    ...createEmptyPropertyHostingDetails(),
    ownerName: asTrimmedString(source.ownerName),
    ownerEmail: asTrimmedString(source.ownerEmail),
    ownerPhone: asTrimmedString(source.ownerPhone),
    location: PROPERTY_LOCATION,
    areaSuburb: asTrimmedString(source.areaSuburb),
    buildingName: asTrimmedString(source.buildingName),
    unitNumber: asTrimmedString(source.unitNumber),
    propertyType: asTrimmedString(source.propertyType),
    bedrooms: asTrimmedString(source.bedrooms),
    bathrooms: asTrimmedString(source.bathrooms),
    parking: asTrimmedString(source.parking),
    furnishingStatus: asTrimmedString(source.furnishingStatus),
    currentlyListed: asTrimmedString(source.currentlyListed),
    preferredStartDate: asTrimmedString(source.preferredStartDate),
    monthlyRentalIncome: asTrimmedString(source.monthlyRentalIncome),
    propertyCondition: asTrimmedString(source.propertyCondition),
    hasWifi: asTrimmedString(source.hasWifi),
    hasWashingMachine: asTrimmedString(source.hasWashingMachine),
    hasAirConditioning: asTrimmedString(source.hasAirConditioning),
    hasBackupPower: asTrimmedString(source.hasBackupPower),
    propertyDescription: asTrimmedString(source.propertyDescription),
    additionalNotes: asTrimmedString(source.additionalNotes),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subject = asTrimmedString(body.subject);

    const payload: ContactFormPayload = {
      name: asTrimmedString(body.name),
      email: asTrimmedString(body.email),
      company: asTrimmedString(body.company),
      subject,
      message: asTrimmedString(body.message),
      propertyHosting: isPropertyHostingSubject(subject)
        ? parsePropertyHostingDetails(body.propertyHosting)
        : undefined,
    };

    const validationError = validateContactFormPayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const saved = await saveContactSubmission(payload);
    if (!saved) {
      return NextResponse.json(
        { error: 'Unable to save your message right now. Please try again or email us directly.' },
        { status: 503 }
      );
    }

    const emailSent = await sendContactFormEmail(payload);
    if (emailSent) {
      await markContactSubmissionEmailSent(saved.id);
    } else {
      console.warn(`Contact submission ${saved.id} saved but notification email was not sent`);
    }

    return NextResponse.json({ success: true, id: saved.id });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
