'use client';

import {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  CURRENTLY_LISTED_OPTIONS,
  FURNISHING_OPTIONS,
  PARKING_OPTIONS,
  PROPERTY_CONDITION_OPTIONS,
  PROPERTY_LOCATION,
  PROPERTY_TYPE_OPTIONS,
  YES_NO_OPTIONS,
  type PropertyHostingDetails,
} from '@/lib/contact-form';

const inputClassName =
  'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 backdrop-blur focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20';

const selectClassName =
  'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20';

const labelClassName = 'block text-sm font-medium text-white/90 mb-2';

const groupHeadingClassName =
  'text-xs font-semibold uppercase tracking-[0.14em] text-white/55 border-b border-white/10 pb-2 mb-4';

interface PropertyHostingFieldsProps {
  data: PropertyHostingDetails;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

function YesNoRadioGroup({
  name,
  label,
  value,
  onChange,
}: {
  name: keyof PropertyHostingDetails;
  label: string;
  value: string;
  onChange: PropertyHostingFieldsProps['onChange'];
}) {
  return (
    <fieldset>
      <legend className={labelClassName}>{label}</legend>
      <div className="flex flex-wrap gap-3">
        {YES_NO_OPTIONS.map((option) => {
          const id = `${String(name)}-${option.toLowerCase()}`;
          const checked = value === option;

          return (
            <label
              key={option}
              htmlFor={id}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                checked
                  ? 'border-emerald-400/40 bg-emerald-400/10 text-white'
                  : 'border-white/15 bg-white/5 text-white/75 hover:border-white/25'
              }`}
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={option}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 border-white/30 bg-white/10 text-emerald-400 focus:ring-emerald-400/30"
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function PropertyHostingFields({ data, onChange }: PropertyHostingFieldsProps) {
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-5 sm:p-6 space-y-8">
      <div>
        <h3 className="text-lg font-medium text-white tracking-tight">Property Hosting Information</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          Tell us more about your Cape Town property so we can assess whether it&apos;s the right fit
          for Right Stay Africa management.
        </p>
      </div>

      <div className="space-y-5">
        <h4 className={groupHeadingClassName}>Owner Details</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="ownerName" className={labelClassName}>
              Owner Full Name *
            </label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              required
              value={data.ownerName}
              onChange={onChange}
              className={inputClassName}
              placeholder="Property owner name"
            />
          </div>

          <div>
            <label htmlFor="ownerEmail" className={labelClassName}>
              Email Address *
            </label>
            <input
              type="email"
              id="ownerEmail"
              name="ownerEmail"
              required
              value={data.ownerEmail}
              onChange={onChange}
              className={inputClassName}
              placeholder="owner@email.com"
            />
          </div>

          <div>
            <label htmlFor="ownerPhone" className={labelClassName}>
              Phone Number *
            </label>
            <input
              type="tel"
              id="ownerPhone"
              name="ownerPhone"
              required
              value={data.ownerPhone}
              onChange={onChange}
              className={inputClassName}
              placeholder="+27 ..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h4 className={groupHeadingClassName}>Property Basics</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="propertyLocation" className={labelClassName}>
              Property Location *
            </label>
            <input
              type="text"
              id="propertyLocation"
              name="location"
              readOnly
              value={PROPERTY_LOCATION}
              className={`${inputClassName} cursor-not-allowed text-white/80`}
            />
            <p className="mt-2 text-xs leading-relaxed text-white/55">
              At this stage, Right Stay Africa is only onboarding properties located in Cape Town.
            </p>
          </div>

          <div>
            <label htmlFor="areaSuburb" className={labelClassName}>
              Area / Suburb *
            </label>
            <input
              type="text"
              id="areaSuburb"
              name="areaSuburb"
              required
              value={data.areaSuburb}
              onChange={onChange}
              className={inputClassName}
              placeholder="e.g. Sea Point, Camps Bay"
            />
          </div>

          <div>
            <label htmlFor="propertyType" className={labelClassName}>
              Property Type *
            </label>
            <select
              id="propertyType"
              name="propertyType"
              required
              value={data.propertyType}
              onChange={onChange}
              className={selectClassName}
            >
              <option value="" className="bg-black">
                Select property type
              </option>
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-black">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="buildingName" className={labelClassName}>
              Building Name
            </label>
            <input
              type="text"
              id="buildingName"
              name="buildingName"
              value={data.buildingName}
              onChange={onChange}
              className={inputClassName}
              placeholder="Building or estate name"
            />
          </div>

          <div>
            <label htmlFor="unitNumber" className={labelClassName}>
              Unit Number / Apartment Number
            </label>
            <input
              type="text"
              id="unitNumber"
              name="unitNumber"
              value={data.unitNumber}
              onChange={onChange}
              className={inputClassName}
              placeholder="Unit or apartment number"
            />
          </div>

          <div>
            <label htmlFor="bedrooms" className={labelClassName}>
              Number of Bedrooms *
            </label>
            <select
              id="bedrooms"
              name="bedrooms"
              required
              value={data.bedrooms}
              onChange={onChange}
              className={selectClassName}
            >
              <option value="" className="bg-black">
                Select bedrooms
              </option>
              {BEDROOM_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-black">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bathrooms" className={labelClassName}>
              Number of Bathrooms *
            </label>
            <select
              id="bathrooms"
              name="bathrooms"
              required
              value={data.bathrooms}
              onChange={onChange}
              className={selectClassName}
            >
              <option value="" className="bg-black">
                Select bathrooms
              </option>
              {BATHROOM_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-black">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="parking" className={labelClassName}>
              Parking Available
            </label>
            <select
              id="parking"
              name="parking"
              value={data.parking}
              onChange={onChange}
              className={selectClassName}
            >
              <option value="" className="bg-black">
                Select option
              </option>
              {PARKING_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-black">
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h4 className={groupHeadingClassName}>Property Features</h4>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="furnishingStatus" className={labelClassName}>
              Current Furnishing Status *
            </label>
            <select
              id="furnishingStatus"
              name="furnishingStatus"
              required
              value={data.furnishingStatus}
              onChange={onChange}
              className={selectClassName}
            >
              <option value="" className="bg-black">
                Select furnishing status
              </option>
              {FURNISHING_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-black">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="currentlyListed" className={labelClassName}>
              Currently Listed on Airbnb / Booking.com? *
            </label>
            <select
              id="currentlyListed"
              name="currentlyListed"
              required
              value={data.currentlyListed}
              onChange={onChange}
              className={selectClassName}
            >
              <option value="" className="bg-black">
                Select listing status
              </option>
              {CURRENTLY_LISTED_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-black">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="propertyCondition" className={labelClassName}>
              Property Condition *
            </label>
            <select
              id="propertyCondition"
              name="propertyCondition"
              required
              value={data.propertyCondition}
              onChange={onChange}
              className={selectClassName}
            >
              <option value="" className="bg-black">
                Select condition
              </option>
              {PROPERTY_CONDITION_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-black">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <YesNoRadioGroup
            name="hasWifi"
            label="Does the property have WiFi?"
            value={data.hasWifi}
            onChange={onChange}
          />

          <YesNoRadioGroup
            name="hasWashingMachine"
            label="Does the property have a washing machine?"
            value={data.hasWashingMachine}
            onChange={onChange}
          />

          <YesNoRadioGroup
            name="hasAirConditioning"
            label="Does the property have air conditioning?"
            value={data.hasAirConditioning}
            onChange={onChange}
          />

          <YesNoRadioGroup
            name="hasBackupPower"
            label="Does the property have backup power or inverter?"
            value={data.hasBackupPower}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="space-y-5">
        <h4 className={groupHeadingClassName}>Management Details</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="preferredStartDate" className={labelClassName}>
              Preferred Management Start Date *
            </label>
            <input
              type="date"
              id="preferredStartDate"
              name="preferredStartDate"
              required
              value={data.preferredStartDate}
              onChange={onChange}
              className={`${inputClassName} [color-scheme:dark]`}
            />
          </div>

          <div>
            <label htmlFor="monthlyRentalIncome" className={labelClassName}>
              Current Average Monthly Rental Income
            </label>
            <input
              type="text"
              id="monthlyRentalIncome"
              name="monthlyRentalIncome"
              value={data.monthlyRentalIncome}
              onChange={onChange}
              className={inputClassName}
              placeholder="If applicable (ZAR)"
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h4 className={groupHeadingClassName}>Notes</h4>
        <div className="space-y-4">
          <div>
            <label htmlFor="propertyDescription" className={labelClassName}>
              Short Description of the Property *
            </label>
            <textarea
              id="propertyDescription"
              name="propertyDescription"
              required
              value={data.propertyDescription}
              onChange={onChange}
              rows={4}
              className={`${inputClassName} resize-none`}
              placeholder="Tell us about the property, views, amenities, and what makes it special..."
            />
          </div>

          <div>
            <label htmlFor="additionalNotes" className={labelClassName}>
              Any Questions or Additional Notes
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={data.additionalNotes}
              onChange={onChange}
              rows={3}
              className={`${inputClassName} resize-none`}
              placeholder="Optional questions or extra details..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
