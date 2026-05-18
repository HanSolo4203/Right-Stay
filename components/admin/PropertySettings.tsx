'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, Loader2, CheckCircle, AlertCircle, X, Save, Upload, Image as ImageIcon, Star, RefreshCw, Download } from 'lucide-react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import type { Property, PropertyFormValues } from '@/types/property';
import { PricingSection } from './PricingSection';
import { extractLocationFromAttributes } from '@/lib/property-location';
import {
  propertyPhotoSrc,
  shouldBypassImageOptimizer,
  type PropertyPhotoVariant,
} from '@/lib/listing-image';
import PropertyLocationPicker from './PropertyLocationPicker';

function PropertyPhoto({
  src,
  alt,
  variant = 'thumb',
  sizes,
  className = 'object-cover',
  priority,
}: {
  src: string;
  alt: string;
  variant?: PropertyPhotoVariant;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const displaySrc = propertyPhotoSrc(src, variant);

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
        <ImageIcon className="w-10 h-10 text-gray-600" />
      </div>
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={shouldBypassImageOptimizer(src)}
      onError={() => setFailed(true)}
    />
  );
}

interface PropertyPhoto {
  id: string;
  property_id: string;
  photo_id: string;
  url: string;
  caption: string | null;
  position: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
}

const emptyLocationFields = {
  location_address: '',
  location_display: '',
  latitude: '',
  longitude: '',
};

function locationFieldsFromProperty(property?: Property | null) {
  if (!property) return { ...emptyLocationFields };
  const fromData = extractLocationFromAttributes(
    (property as Property & { data?: { attributes?: Record<string, unknown> } }).data
      ?.attributes
  );
  return {
    location_address:
      property.location_address ?? fromData.location_address ?? '',
    location_display:
      property.location_display ?? fromData.location_display ?? '',
    latitude:
      property.latitude != null
        ? String(property.latitude)
        : fromData.latitude != null
          ? String(fromData.latitude)
          : '',
    longitude:
      property.longitude != null
        ? String(property.longitude)
        : fromData.longitude != null
          ? String(fromData.longitude)
          : '',
  };
}

export default function PropertySettings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);
  const [syncingCalendarPropertyId, setSyncingCalendarPropertyId] = useState<string | null>(null);
  const [syncingUplistingPropertyId, setSyncingUplistingPropertyId] = useState<string | null>(null);
  const [syncingFromUplisting, setSyncingFromUplisting] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);
  const [geocodingLocation, setGeocodingLocation] = useState(false);
  const [mapPickerSession, setMapPickerSession] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [propertyPrimaryPhotos, setPropertyPrimaryPhotos] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<PropertyFormValues>({
    uplisting_id: '',
    name: '',
    type: '',
    bedrooms: '',
    bathrooms: '',
    beds: '',
    maximum_capacity: '',
    currency: 'ZAR',
    description: '',
    check_in_time: '15',
    check_out_time: '11',
    ical_url: '',
    pricingEnabled: false,
    minPrice: '',
    basePrice: '',
    maxPrice: '',
    cleaningFee: '450',
    serviceFeePercent: '5',
    pricelabsListingId: '',
    pricelabsPms: '',
    pricelabsSyncEnabled: true,
    ...emptyLocationFields,
  });
  const [pricingErrors, setPricingErrors] = useState<{
    minPrice?: string;
    basePrice?: string;
    maxPrice?: string;
    cleaningFee?: string;
    serviceFeePercent?: string;
  }>({});

  const fetchPrimaryPhotosForProperties = async (properties: Property[]) => {
    const photoMap: Record<string, string> = {};
    
    // Fetch primary photos for each property
    const photoPromises = properties.map(async (property) => {
      try {
        const response = await fetch(`/api/admin/properties/photos?propertyId=${property.uplisting_id}`);
        if (response.ok) {
          const data = await response.json();
          const primaryPhoto = data.photos?.find((p: PropertyPhoto) => p.is_primary);
          if (primaryPhoto) {
            photoMap[property.uplisting_id] = primaryPhoto.url;
          }
        }
      } catch (error) {
        console.error(`Error fetching primary photo for property ${property.uplisting_id}:`, error);
      }
    });

    await Promise.all(photoPromises);
    setPropertyPrimaryPhotos(photoMap);
  };

  const fetchProperties = useCallback(async () => {
    try {
      console.log('Fetching properties from API...');
      const response = await fetch('/api/admin/properties');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Properties data:', data);
        setProperties(data);
        
        // Fetch primary photos for all properties
        await fetchPrimaryPhotosForProperties(data);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setMessage({ 
          type: 'error', 
          text: `Failed to fetch properties: ${errorData.error || 'Unknown error'}` 
        });
      }
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      setMessage({ 
        type: 'error', 
        text: `Network error: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Auto-sync iCal calendars every 10 minutes
  useEffect(() => {
    const syncAllICalProperties = async () => {
      // Fetch current properties to check for iCal URLs
      try {
        const response = await fetch('/api/admin/properties');
        if (!response.ok) {
          console.error('Failed to fetch properties for auto-sync check');
          return;
        }
        
        const currentProperties = await response.json();
        const propertiesWithICal = currentProperties.filter((p: Property) => p.ical_url);
        
        if (propertiesWithICal.length === 0) {
          console.log('No properties with iCal URLs found, skipping auto-sync');
          return;
        }

        console.log(`Auto-syncing ${propertiesWithICal.length} properties with iCal URLs...`);
        
        // Sync all properties with iCal URLs
        const syncResponse = await fetch('/api/sync-availability', {
          method: 'GET',
        });

        if (syncResponse.ok) {
          const data = await syncResponse.json();
          console.log(`Auto-sync completed: ${data.message}`);
          // Refresh properties to update last_synced timestamps
          fetchProperties();
        } else {
          console.error('Auto-sync failed:', await syncResponse.text());
        }
      } catch (error) {
        console.error('Error during auto-sync:', error);
      }
    };

    // Wait 2 seconds after mount, then sync immediately (if properties have iCal URLs)
    const initialSyncTimeout = setTimeout(() => {
      syncAllICalProperties();
    }, 2000);
    
    // Set up interval for every 10 minutes (600,000 ms)
    const syncInterval = setInterval(() => {
      syncAllICalProperties();
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      clearTimeout(initialSyncTimeout);
      clearInterval(syncInterval);
    };
  }, [fetchProperties]); // Include fetchProperties in dependencies

  const handleOpenModal = async (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        uplisting_id: property.uplisting_id || '',
        name: property.name || '',
        type: property.type || '',
        bedrooms: property.bedrooms !== null ? property.bedrooms.toString() : '',
        bathrooms: property.bathrooms !== null ? property.bathrooms.toString() : '',
        beds: property.beds !== null ? property.beds.toString() : '',
        maximum_capacity: property.maximum_capacity !== null ? property.maximum_capacity.toString() : '',
        currency: property.currency || 'ZAR',
        description: property.description || '',
        check_in_time: property.check_in_time !== null ? property.check_in_time.toString() : '15',
        check_out_time: property.check_out_time !== null ? property.check_out_time.toString() : '11',
        ical_url: property.ical_url || '',
        pricingEnabled: property.pricing?.pricingEnabled ?? false,
        minPrice: property.pricing?.minPrice != null ? property.pricing.minPrice.toString() : '',
        basePrice: property.pricing?.basePrice != null ? property.pricing.basePrice.toString() : '',
        maxPrice: property.pricing?.maxPrice != null ? property.pricing.maxPrice.toString() : '',
        cleaningFee:
          property.pricing?.cleaningFee != null ? property.pricing.cleaningFee.toString() : '450',
        serviceFeePercent:
          property.pricing?.serviceFeePercent != null
            ? property.pricing.serviceFeePercent.toString()
            : '5',
        pricelabsListingId: property.pricelabsMapping?.pricelabsListingId || '',
        pricelabsPms: property.pricelabsMapping?.pricelabsPms || '',
        pricelabsSyncEnabled: property.pricelabsMapping?.syncEnabled ?? true,
        ...locationFieldsFromProperty(property),
      });
      setPricingErrors({});
      // Fetch photos for this property
      await fetchPhotos(property.uplisting_id);
    } else {
      setEditingProperty(null);
      setFormData({
        uplisting_id: '',
        name: '',
        type: '',
        bedrooms: '',
        bathrooms: '',
        beds: '',
        maximum_capacity: '',
        currency: 'ZAR',
        description: '',
        check_in_time: '15',
        check_out_time: '11',
        ical_url: '',
        pricingEnabled: false,
        minPrice: '',
        basePrice: '',
        maxPrice: '',
        cleaningFee: '450',
        serviceFeePercent: '5',
        pricelabsListingId: '',
        pricelabsPms: '',
        pricelabsSyncEnabled: true,
        ...emptyLocationFields,
      });
      setPhotos([]);
      setPricingErrors({});
    }
    setMapPickerSession((session) => session + 1);
    setShowModal(true);
  };

  const fetchPhotos = async (propertyId: string) => {
    try {
      console.log('Fetching photos for property:', propertyId);
      const response = await fetch(`/api/admin/properties/photos?propertyId=${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Photos fetched:', data.photos?.length || 0);
        setPhotos(data.photos || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch photos' }));
        console.error('Error fetching photos:', errorData);
        setPhotos([]); // Reset photos on error
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]); // Reset photos on error
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProperty(null);
    setPhotos([]);
    setFormData({
      uplisting_id: '',
      name: '',
      type: '',
      bedrooms: '',
      bathrooms: '',
      beds: '',
      maximum_capacity: '',
      currency: 'ZAR',
      description: '',
      check_in_time: '15',
      check_out_time: '11',
      ical_url: '',
      pricingEnabled: false,
      minPrice: '',
      basePrice: '',
      maxPrice: '',
      cleaningFee: '450',
      serviceFeePercent: '5',
      pricelabsListingId: '',
      pricelabsPms: '',
      pricelabsSyncEnabled: true,
      ...emptyLocationFields,
    });
    setPricingErrors({});
  };

  const handleGeocodeAddress = async () => {
    const query = formData.location_address.trim();
    if (query.length < 3) {
      setMessage({
        type: 'error',
        text: 'Enter a property address (at least 3 characters) to find on map.',
      });
      return;
    }

    setGeocodingLocation(true);
    try {
      const response = await fetch(
        `/api/admin/geocode?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.error || 'Could not find that address.',
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        latitude: String(data.lat),
        longitude: String(data.lng),
        location_address: data.displayName || prev.location_address,
        location_display:
          prev.location_display.trim() ||
          data.displayName?.split(',').slice(-2).join(',').trim() ||
          prev.location_display,
      }));
    } catch {
      setMessage({ type: 'error', text: 'Geocoding request failed.' });
    } finally {
      setGeocodingLocation(false);
    }
  };

  const handleCoordinatesChange = useCallback((lat: string, lng: string) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  const compressImage = async (file: File): Promise<File> => {
    // Only compress if file is larger than 2MB
    if (file.size <= 2 * 1024 * 1024) {
      console.log('File is already under 2MB, skipping compression');
      return file;
    }

    const options = {
      maxSizeMB: 2, // Target file size in MB
      maxWidthOrHeight: 1920, // Max width or height (maintains aspect ratio)
      useWebWorker: true, // Use web worker for better performance
      fileType: file.type, // Keep original file type
      initialQuality: 0.85, // Initial quality (0-1)
    };

    try {
      console.log('Compressing image... Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      const compressedFile = await imageCompression(file, options);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      console.log('Compressed size:', compressedSize, 'MB');
      
      // If compression didn't reduce size enough, try more aggressive compression
      if (compressedFile.size > 2.5 * 1024 * 1024) {
        console.log('First compression not sufficient, trying more aggressive compression...');
        const aggressiveOptions = {
          ...options,
          maxSizeMB: 2,
          initialQuality: 0.7,
          maxWidthOrHeight: 1600,
        };
        const moreCompressed = await imageCompression(file, aggressiveOptions);
        console.log('Aggressively compressed size:', (moreCompressed.size / 1024 / 1024).toFixed(2), 'MB');
        return moreCompressed;
      }
      
      return compressedFile;
    } catch (error) {
      console.error('Compression error:', error);
      // If compression fails, return original file
      return file;
    }
  };

  const handlePhotoUpload = async (file: File) => {
    console.log('handlePhotoUpload called with file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB', 'editingProperty:', editingProperty);
    
    if (!file) {
      console.error('No file provided');
      setMessage({ type: 'error', text: 'No file selected' });
      return;
    }

    if (!editingProperty) {
      console.error('No property selected');
      setMessage({ type: 'error', text: 'Please select a property first' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    // Validate file size (max 15MB before compression)
    if (file.size > 15 * 1024 * 1024) {
      console.error('File too large:', file.size);
      setMessage({ type: 'error', text: 'Image size must be less than 15MB' });
      return;
    }

    setUploadingPhoto(true);
    setUploadingPhotoId(null);

    try {
      // Compress the image before uploading
      console.log('Compressing image before upload...');
      const compressedFile = await compressImage(file);
      
      console.log('Creating FormData for upload...');
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('propertyId', editingProperty.uplisting_id);
      formData.append('isPrimary', photos.length === 0 ? 'true' : 'false');

      console.log('Uploading to /api/admin/properties/upload-photo...');
      const response = await fetch('/api/admin/properties/upload-photo', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload successful, data:', data);
        await fetchPhotos(editingProperty.uplisting_id);
        // Refresh primary photos for properties list
        await fetchPrimaryPhotosForProperties(properties);
        const originalSize = (file.size / 1024 / 1024).toFixed(2);
        const finalSize = (compressedFile.size / 1024 / 1024).toFixed(2);
        setMessage({ type: 'success', text: `Photo uploaded successfully! (Compressed from ${originalSize}MB to ${finalSize}MB)` });
        setTimeout(() => setMessage(null), 5000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to upload photo' }));
        console.error('Upload failed:', errorData);
        const errorMessage = errorData.error || errorData.details || 'Failed to upload photo';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload photo. Please check the console for details.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handlePhotoUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!editingProperty) {
      setMessage({ type: 'error', text: 'Please select a property first' });
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setMessage({ type: 'error', text: 'Please drop image files only' });
      return;
    }

    // Upload files sequentially
    for (const file of imageFiles) {
      await handlePhotoUpload(file);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`/api/admin/properties/photos?id=${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok && editingProperty) {
        await fetchPhotos(editingProperty.uplisting_id);
        // Refresh primary photos for properties list
        await fetchPrimaryPhotosForProperties(properties);
        setMessage({ type: 'success', text: 'Photo deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to delete photo');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting photo. Please try again.' });
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      const response = await fetch(`/api/admin/properties/photos?id=${photoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_primary: true }),
      });

      if (response.ok && editingProperty) {
        await fetchPhotos(editingProperty.uplisting_id);
        // Refresh primary photos for properties list
        await fetchPrimaryPhotosForProperties(properties);
        setMessage({ type: 'success', text: 'Primary photo updated!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to update primary photo');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating primary photo. Please try again.' });
    }
  };

  const validatePricing = (values: PropertyFormValues) => {
    const errors: {
      minPrice?: string;
      basePrice?: string;
      maxPrice?: string;
      cleaningFee?: string;
      serviceFeePercent?: string;
    } = {};

    if (!values.pricingEnabled) {
      return errors;
    }

    const min = parseFloat(values.minPrice || '');
    const base = parseFloat(values.basePrice || '');
    const max = parseFloat(values.maxPrice || '');
    const cleaningFee = parseFloat(values.cleaningFee || '');
    const serviceFeePercent = parseFloat(values.serviceFeePercent || '');

    if (Number.isNaN(min) || Number.isNaN(base) || Number.isNaN(max)) {
      if (Number.isNaN(min)) {
        errors.minPrice = 'Minimum price must be set';
      }
      if (Number.isNaN(base)) {
        errors.basePrice = 'Base price must be set';
      }
      if (Number.isNaN(max)) {
        errors.maxPrice = 'Maximum price must be set';
      }
      return errors;
    }

    if (!(min < base)) {
      errors.minPrice = 'Minimum price must be less than base price';
    }

    if (!(base < max)) {
      errors.basePrice = 'Base price must be less than maximum price';
      errors.maxPrice = 'Maximum price must be greater than base price';
    }

    if (Number.isNaN(cleaningFee) || cleaningFee < 0) {
      errors.cleaningFee = 'Cleaning fee must be 0 or greater';
    }

    if (Number.isNaN(serviceFeePercent) || serviceFeePercent < 0 || serviceFeePercent > 100) {
      errors.serviceFeePercent = 'Service fee % must be between 0 and 100';
    }

    return errors;
  };

  const handlePricingChange = (
    field: keyof Pick<
      PropertyFormValues,
      | 'pricingEnabled'
      | 'minPrice'
      | 'basePrice'
      | 'maxPrice'
      | 'cleaningFee'
      | 'serviceFeePercent'
    >,
    value: string | boolean
  ) => {
    setFormData(prev => {
      const next: PropertyFormValues = {
        ...prev,
        [field]: value,
      };
      setPricingErrors(validatePricing(next));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (savingProperty) return; // Prevent double submission

    const pricingValidation = validatePricing(formData);
    setPricingErrors(pricingValidation);
    const hasPricingErrors = Object.values(pricingValidation).some(Boolean);

    if (hasPricingErrors) {
      setMessage({
        type: 'error',
        text: 'Please fix pricing errors before saving.',
      });
      return;
    }
    
    setSavingProperty(true);
    
    try {
      const url = editingProperty 
        ? `/api/admin/properties?id=${editingProperty.id}`
        : '/api/admin/properties';
      
      const payload = {
        ...formData,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
        cleaningFee: formData.cleaningFee ? parseFloat(formData.cleaningFee) : 450,
        serviceFeePercent: formData.serviceFeePercent ? parseFloat(formData.serviceFeePercent) : 5,
        pricingEnabled: formData.pricingEnabled,
        pricelabsListingId: formData.pricelabsListingId.trim(),
        pricelabsPms: formData.pricelabsPms.trim(),
        pricelabsSyncEnabled: formData.pricelabsSyncEnabled,
      };

      const response = await fetch(url, {
        method: editingProperty ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Refresh photos after saving property
        if (editingProperty) {
          await fetchPhotos(editingProperty.uplisting_id);
        }
        
        setMessage({ 
          type: 'success', 
          text: `Property ${editingProperty ? 'updated' : 'created'} successfully!` 
        });
        handleCloseModal();
        fetchProperties();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save property' }));
        throw new Error(errorData.error || 'Failed to save property');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error saving property. Please try again.' });
    } finally {
      setSavingProperty(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(`/api/admin/properties?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Property deleted successfully!' });
        fetchProperties();
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to delete property');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting property. Please try again.' });
    }
  };

  const handleSyncCalendar = async (propertyId: string) => {
    setSyncingCalendarPropertyId(propertyId);
    try {
      const response = await fetch('/api/sync-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Successfully synced ${data.blockedDates} blocked dates for this property.`,
        });
        fetchProperties();
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to sync calendar');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `Error syncing calendar: ${error.message || 'Please try again.'}`,
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSyncingCalendarPropertyId(null);
    }
  };

  const handleSyncPropertyFromUplisting = async (propertyId: string) => {
    setSyncingUplistingPropertyId(propertyId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/sync`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        const apiCount = data.photos_in_uplisting_api ?? data.photos_synced;
        setMessage({
          type: 'success',
          text: `Synced "${data.property_name}" from Uplisting with ${data.photos_synced} photo${data.photos_synced === 1 ? '' : 's'} (Uplisting API reports ${apiCount} listing photo${apiCount === 1 ? '' : 's'}).`,
        });
        await fetchProperties();
        setTimeout(() => setMessage(null), 5000);
      } else {
        const errorMsg = data.error || 'Failed to sync from Uplisting';
        const detailsMsg =
          data.details && data.details !== errorMsg && !errorMsg.includes(data.details)
            ? ` ${data.details}`
            : '';
        throw new Error(`${errorMsg}${detailsMsg}`);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `Error syncing from Uplisting: ${error.message || 'Please try again.'}`,
      });
      setTimeout(() => setMessage(null), 8000);
    } finally {
      setSyncingUplistingPropertyId(null);
    }
  };

  const handleSyncFromUplisting = async () => {
    setSyncingFromUplisting(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/properties/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, try to get text
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText}. ${text.substring(0, 200)}`);
      }

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Successfully synced ${data.properties_synced} properties and ${data.photos_synced} photos from Uplisting.` 
        });
        fetchProperties(); // Refresh properties list
        setTimeout(() => setMessage(null), 5000);
      } else {
        // Combine error and details for better user feedback, but avoid duplication
        const errorMsg = data.error || 'Failed to sync from Uplisting';
        let detailsMsg = '';
        
        // Only add details if they're different from the error message
        if (data.details && data.details !== errorMsg && !errorMsg.includes(data.details)) {
          detailsMsg = ` ${data.details}`;
        }
        
        throw new Error(`${errorMsg}${detailsMsg}`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Please try again.';
      setMessage({ 
        type: 'error', 
        text: `Error syncing from Uplisting: ${errorMessage}` 
      });
      setTimeout(() => setMessage(null), 8000); // Show error longer so user can read it
    } finally {
      setSyncingFromUplisting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-right-stay-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <button
            onClick={handleSyncFromUplisting}
            disabled={syncingFromUplisting}
            className="flex items-center space-x-2 px-4 py-2 bg-right-stay-600 hover:bg-right-stay-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncingFromUplisting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Sync from Uplisting</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-right-stay-500 hover:bg-right-stay-600 text-white font-medium rounded-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid gap-4">
        {properties.map((property) => {
          const primaryPhotoUrl = propertyPrimaryPhotos[property.uplisting_id];
          return (
            <div
              key={property.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="flex">
                {/* Primary Image */}
                {primaryPhotoUrl && (
                  <div className="w-48 h-48 flex-shrink-0 relative bg-gray-800">
                    <PropertyPhoto
                      src={primaryPhotoUrl}
                      alt={property.name}
                      variant="thumb"
                      sizes="192px"
                    />
                  </div>
                )}
                
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-slate-900">
                          {property.name}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-right-stay-600 border border-blue-500/20">
                          {property.type}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-slate-500 border border-gray-500/20">
                          ID: {property.uplisting_id}
                        </span>
                      </div>
                      
                      {property.description && (
                        <p className="text-slate-500 mb-4 text-sm line-clamp-2">{property.description}</p>
                      )}
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Bedrooms:</span>
                    <p className="text-slate-900">{property.bedrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Bathrooms:</span>
                    <p className="text-slate-900">{property.bathrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Max Capacity:</span>
                    <p className="text-slate-900">{property.maximum_capacity || 'N/A'} guests</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Check-in:</span>
                    <p className="text-slate-900">{property.check_in_time ? `${property.check_in_time}:00` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Check-out:</span>
                    <p className="text-slate-900">{property.check_out_time ? `${property.check_out_time}:00` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Currency:</span>
                    <p className="text-slate-900">{property.currency}</p>
                  </div>
                  {property.pricing?.pricingEnabled && (
                    <div className="md:col-span-3">
                      <span className="text-slate-500">Dynamic Pricing:</span>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-baseline gap-1">
                          <span className="text-orange-700 font-medium">Min</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-900">
                            {property.currency === 'ZAR' ? 'R' : property.currency}
                            {property.pricing.minPrice?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-amber-700 font-medium">Base</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-900">
                            {property.currency === 'ZAR' ? 'R' : property.currency}
                            {property.pricing.basePrice?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-emerald-400 font-medium">Max</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-900">
                            {property.currency === 'ZAR' ? 'R' : property.currency}
                            {property.pricing.maxPrice?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sky-400 font-medium">Cleaning</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-900">
                            {property.currency === 'ZAR' ? 'R' : property.currency}
                            {property.pricing.cleaningFee?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-violet-400 font-medium">Service</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-900">
                            {property.pricing.serviceFeePercent?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {property.pricelabsMapping && (
                    <div className="md:col-span-3">
                      <span className="text-slate-500">PriceLabs:</span>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                        <span className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                          ID {property.pricelabsMapping.pricelabsListingId}
                        </span>
                        <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                          PMS {property.pricelabsMapping.pricelabsPms}
                        </span>
                        <span className={`px-2 py-1 rounded border ${
                          property.pricelabsMapping.syncEnabled
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : 'bg-gray-500/10 border-gray-500/20 text-slate-600'
                        }`}>
                          Sync {property.pricelabsMapping.syncEnabled ? 'enabled' : 'disabled'}
                        </span>
                        {property.pricelabsMapping.lastSyncedAt && (
                          <span className="text-slate-500">
                            Last sync {new Date(property.pricelabsMapping.lastSyncedAt).toLocaleString()}
                          </span>
                        )}
                        {property.pricelabsMapping.lastSyncError && (
                          <span className="text-red-300">
                            Error: {property.pricelabsMapping.lastSyncError}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {property.ical_url && (
                    <div className="md:col-span-3">
                      <span className="text-slate-500">iCal URL:</span>
                      <p className="text-slate-700 text-xs break-all">{property.ical_url}</p>
                    </div>
                  )}
                  {property.last_synced && (
                    <div className="md:col-span-3">
                      <span className="text-slate-500">Last synced:</span>
                      <p className="text-slate-700 text-xs">
                        {new Date(property.last_synced).toLocaleString()}
                      </p>
                    </div>
                  )}
                    </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleSyncPropertyFromUplisting(property.uplisting_id)}
                        disabled={syncingUplistingPropertyId === property.uplisting_id}
                        className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Sync property and photos from Uplisting"
                      >
                        {syncingUplistingPropertyId === property.uplisting_id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </button>
                      {property.ical_url && (
                        <button
                          onClick={() => handleSyncCalendar(property.uplisting_id)}
                          disabled={syncingCalendarPropertyId === property.uplisting_id}
                          className="p-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Sync calendar availability"
                        >
                          {syncingCalendarPropertyId === property.uplisting_id ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(property)}
                        className="p-2 text-right-stay-600 hover:bg-right-stay-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {properties.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No properties found. Add your first property to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6">
          <div className="min-h-full flex items-start justify-center pt-4 sm:pt-8">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Primary Image Display at Top of Modal */}
            {editingProperty && (() => {
              const primaryPhoto = photos.find(p => p.is_primary);
              const primaryPhotoUrl = primaryPhoto?.url || propertyPrimaryPhotos[editingProperty.uplisting_id];
              return primaryPhotoUrl ? (
                <div className="w-full h-64 relative bg-gray-800">
                  <PropertyPhoto
                    src={primaryPhotoUrl}
                    alt={editingProperty.name}
                    variant="hero"
                    sizes="(max-width: 1024px) 100vw, 640px"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-slate-900 text-sm font-medium">{editingProperty.name}</p>
                  </div>
                </div>
              ) : null;
            })()}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Uplisting ID *
                  </label>
                  <input
                    type="text"
                    name="uplisting_id"
                    value={formData.uplisting_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                    placeholder="e.g., 135133"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Property Type *
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                    placeholder="e.g., Villa, Apartment, Lodge"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Property Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                  placeholder="e.g., Cape Town Luxury Villa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors resize-none"
                  placeholder="Property description..."
                />
              </div>

              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Property location</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Display location
                  </label>
                  <input
                    type="text"
                    name="location_display"
                    value={formData.location_display}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                    placeholder="e.g., Cape Town, South Africa"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Short label shown on the booking page header.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Property address
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="location_address"
                      value={formData.location_address}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                      placeholder="Full street address or area"
                    />
                    <button
                      type="button"
                      onClick={handleGeocodeAddress}
                      disabled={geocodingLocation}
                      className="shrink-0 px-4 py-2 bg-right-stay-500 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {geocodingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Find on map
                    </button>
                  </div>
                </div>

                <PropertyLocationPicker
                  key={`map-${editingProperty?.id ?? 'new'}-${mapPickerSession}`}
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onCoordinatesChange={handleCoordinatesChange}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      readOnly
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-default"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      readOnly
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-default"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    name="maximum_capacity"
                    value={formData.maximum_capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                  >
                    <option value="ZAR">ZAR (South African Rand)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Check-in Time
                  </label>
                  <input
                    type="number"
                    name="check_in_time"
                    value={formData.check_in_time}
                    onChange={handleChange}
                    min="0"
                    max="23"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Check-out Time
                  </label>
                  <input
                    type="number"
                    name="check_out_time"
                    value={formData.check_out_time}
                    onChange={handleChange}
                    min="0"
                    max="23"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                    placeholder="11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  iCal URL (for availability sync)
                </label>
                <input
                  type="url"
                  name="ical_url"
                  value={formData.ical_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                  placeholder="https://..."
                />
              </div>

              <PricingSection
                values={{
                  pricingEnabled: formData.pricingEnabled,
                  minPrice: formData.minPrice,
                  basePrice: formData.basePrice,
                  maxPrice: formData.maxPrice,
                  cleaningFee: formData.cleaningFee,
                  serviceFeePercent: formData.serviceFeePercent,
                }}
                currency={formData.currency}
                errors={pricingErrors}
                onChange={handlePricingChange}
              />

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    PriceLabs Listing ID
                  </label>
                  <input
                    type="text"
                    name="pricelabsListingId"
                    value={formData.pricelabsListingId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                    placeholder="e.g., 834874"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    PriceLabs PMS
                  </label>
                  <input
                    type="text"
                    name="pricelabsPms"
                    value={formData.pricelabsPms}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                    placeholder="e.g., airbnb"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg w-full">
                    <input
                      type="checkbox"
                      name="pricelabsSyncEnabled"
                      checked={formData.pricelabsSyncEnabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pricelabsSyncEnabled: e.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-200">Enable PriceLabs sync</span>
                  </label>
                </div>
              </div>

              {/* Photo Management Section */}
              {editingProperty && (
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Property Photos
                    </h4>
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm text-right-stay-600">Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadingPhoto && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-right-stay-600" />
                      <span className="text-sm text-right-stay-600">Compressing and uploading photo...</span>
                    </div>
                  )}

                  {/* Drag and Drop Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Drag area clicked, fileInputRef:', fileInputRef.current);
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      } else {
                        console.error('File input ref is null');
                      }
                    }}
                    className={`mb-4 p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                      dragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-200 bg-slate-50 hover:border-blue-500/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 mb-1">
                        Drag and drop images here, or click to browse
                      </p>
                      <p className="text-xs text-slate-500">
                        Supports multiple images (max 15MB each, auto-compressed to ~2MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        console.log('File input changed, files:', e.target.files);
                        const files = Array.from(e.target.files || []);
                        console.log('Processing', files.length, 'files');
                        for (const file of files) {
                          await handlePhotoUpload(file);
                        }
                        e.target.value = ''; // Reset input
                      }}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </div>

                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group bg-slate-50 rounded-lg overflow-hidden border border-slate-200"
                        >
                          <div className="aspect-video relative">
                            <PropertyPhoto
                              src={photo.url}
                              alt={photo.caption || 'Property photo'}
                              variant="gallery"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                            {photo.is_primary && (
                              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                Primary
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {!photo.is_primary && (
                                <button
                                  onClick={() => handleSetPrimary(photo.id)}
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-slate-700 text-xs rounded transition-colors"
                                  title="Set as primary"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-slate-700 text-xs rounded transition-colors"
                                title="Delete photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {photo.caption && (
                            <p className="p-2 text-xs text-slate-500 truncate">{photo.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                      <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 mb-4">No photos uploaded yet</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm text-right-stay-600">Upload First Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProperty}
                  className="flex items-center space-x-2 px-6 py-2 bg-right-stay-500 hover:bg-right-stay-600 text-slate-900 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProperty ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editingProperty ? 'Update' : 'Create'} Property</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

