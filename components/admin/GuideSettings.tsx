'use client';

import { useState, useEffect, useCallback, type ComponentType, type ReactNode } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { useDropzone } from 'react-dropzone';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  ChevronUp,
  ChevronDown,
  Utensils,
  Camera,
  Mountain,
  Waves,
  Martini,
  Users,
  ShoppingBag,
  TreePine,
  Sun,
  Compass,
  Palette,
  Music,
  Ship,
  Bike,
  Coffee,
  Image as ImageIcon,
  Star,
  Search,
  Upload,
  Download,
} from 'lucide-react';
import type {
  GuideCategory,
  GuideItemAdmin,
  GuideItemPhoto,
  GuidePriceLevel,
} from '@/types/guide';
import { hasValidMapCoordinates, parseCoordinate } from '@/lib/property-location';
import PropertyLocationPicker from './PropertyLocationPicker';
import AddressSearchInput, { type AddressSearchResult } from './AddressSearchInput';
import { GuideListRowsSkeleton, GuideSettingsSkeleton } from '@/components/admin/AdminTabSkeletons';

const CATEGORY_ICONS = {
  Utensils,
  Camera,
  Mountain,
  Waves,
  Martini,
  Users,
  ShoppingBag,
  TreePine,
  Sun,
  Compass,
  Palette,
  Music,
  Ship,
  Bike,
  Coffee,
} as const;

type CategoryIconName = keyof typeof CATEGORY_ICONS;

const CATEGORY_ICON_OPTIONS = Object.entries(CATEGORY_ICONS) as [
  CategoryIconName,
  ComponentType<{ className?: string }>,
][];

const COLOR_PRESETS = [
  '#c2410c',
  '#1d4ed8',
  '#3f6212',
  '#0e7490',
  '#6d28d9',
  '#a16207',
  '#9f1239',
  '#2f8f5b',
  '#be185d',
  '#0f766e',
];

const PRICE_LEVELS: { value: GuidePriceLevel; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: '$', label: '$' },
  { value: '$$', label: '$$' },
  { value: '$$$', label: '$$$' },
];

const INPUT_CLASS =
  'w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors';

const DEFAULT_CATEGORY_FORM = {
  name: '',
  slug: '',
  icon: 'Utensils' as CategoryIconName,
  color: '#2f8f5b',
  is_active: true,
};

const DEFAULT_PLACE_FORM = {
  name: '',
  slug: '',
  category_id: '',
  short_description: '',
  description: '',
  address: '',
  latitude: '',
  longitude: '',
  price_level: '$$' as GuidePriceLevel,
  website_url: '',
  booking_url: '',
  phone: '',
  tags: '',
  is_featured: false,
  is_active: true,
  google_place_id: '',
};

interface GuideCategoryRow extends GuideCategory {
  item_count: number;
}

type SectionTab = 'categories' | 'places';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isCategoryIconName(value: string): value is CategoryIconName {
  return value in CATEGORY_ICONS;
}

function CategoryGlyph({ name, className }: { name: string; className?: string }) {
  const Icon = isCategoryIconName(name) ? CATEGORY_ICONS[name] : Compass;
  return <Icon className={className} />;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    if (data && typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  } catch {
    // Use the fallback when the body is empty or not JSON.
  }
  return fallback;
}

function formatTags(tags: string[] | null | undefined) {
  return (tags || []).join(', ');
}

function applyGooglePlaceToForm(
  prev: typeof DEFAULT_PLACE_FORM,
  result: AddressSearchResult,
  slugLocked: boolean
) {
  const nextName = prev.name.trim() ? prev.name : result.name || prev.name;
  return {
    ...prev,
    address: result.address,
    latitude: result.lat,
    longitude: result.lng,
    google_place_id: result.googlePlaceId || prev.google_place_id,
    name: nextName,
    slug: slugLocked || prev.slug.trim() ? prev.slug : slugify(nextName),
    short_description: prev.short_description.trim()
      ? prev.short_description
      : result.shortDescription || prev.short_description,
    description: prev.description.trim()
      ? prev.description
      : result.description || prev.description,
    website_url: prev.website_url.trim() ? prev.website_url : result.websiteUrl || prev.website_url,
    phone: prev.phone.trim() ? prev.phone : result.phone || prev.phone,
    price_level: result.priceLevel || prev.price_level,
  };
}

function priceLevelLabel(level: GuidePriceLevel | null | undefined) {
  if (!level) return '—';
  if (level === 'free') return 'Free';
  return level;
}

function AdminEmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-right-stay-100 text-right-stay-700">
        <Icon className="h-6 w-6" />
      </div>
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

async function compressImage(file: File): Promise<File> {
  if (file.size <= 2 * 1024 * 1024) return file;

  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type,
    initialQuality: 0.85,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    if (compressedFile.size > 2.5 * 1024 * 1024) {
      return imageCompression(file, {
        ...options,
        initialQuality: 0.7,
        maxWidthOrHeight: 1600,
      });
    }
    return compressedFile;
  } catch (error) {
    console.error('Compression error:', error);
    return file;
  }
}

function PlaceThumb({
  src,
  alt,
  sizes = '80px',
}: {
  src?: string | null;
  alt: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
        <ImageIcon className="h-6 w-6 text-slate-400" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes={sizes}
      onError={() => setFailed(true)}
    />
  );
}

function GuideItemPhotoManager({
  itemId,
  photos,
  onPhotosChange,
  onMessage,
  onPlaceImported,
}: {
  itemId: string;
  photos: GuideItemPhoto[];
  onPhotosChange: (photos: GuideItemPhoto[]) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
  onPlaceImported?: (item: GuideItemAdmin) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [importingGoogle, setImportingGoogle] = useState(false);

  const refreshPhotos = async () => {
    const response = await fetch(`/api/admin/guide-items/photos?guideItemId=${itemId}`);
    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Failed to load photos'));
    }
    const data = await response.json();
    onPhotosChange(Array.isArray(data.photos) ? data.photos : []);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onMessage('error', 'Please upload an image file');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      onMessage('error', 'Image size must be less than 15MB');
      return;
    }

    setUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('guideItemId', itemId);
      formData.append('isPrimary', photos.length === 0 ? 'true' : 'false');

      const response = await fetch('/api/admin/guide-items/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to upload photo'));
      }

      await refreshPhotos();
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const finalSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      onMessage(
        'success',
        `Photo uploaded successfully! (Compressed from ${originalSize}MB to ${finalSize}MB)`
      );
    } catch (error) {
      onMessage('error', error instanceof Error ? error.message : 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/gif': [],
    },
    multiple: true,
    disabled: uploading || importingGoogle,
    maxSize: 15 * 1024 * 1024,
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        await handlePhotoUpload(file);
      }
    },
  });

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`/api/admin/guide-items/photos?id=${photoId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to delete photo'));
      }
      await refreshPhotos();
      onMessage('success', 'Photo deleted successfully!');
    } catch (error) {
      onMessage('error', error instanceof Error ? error.message : 'Error deleting photo.');
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      const response = await fetch(`/api/admin/guide-items/photos?id=${photoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_primary: true }),
      });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to update primary photo'));
      }
      await refreshPhotos();
      onMessage('success', 'Primary photo updated!');
    } catch (error) {
      onMessage('error', error instanceof Error ? error.message : 'Error updating primary photo.');
    }
  };

  const handleImportGoogle = async () => {
    setImportingGoogle(true);
    try {
      const response = await fetch('/api/admin/guide-items/import-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideItemId: itemId, overwriteCopy: true }),
      });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to import from Google'));
      }
      const data = await response.json();
      if (data.item) {
        onPlaceImported?.(data.item as GuideItemAdmin);
        onPhotosChange(Array.isArray(data.item.photos) ? data.item.photos : []);
      } else {
        await refreshPhotos();
      }
      const imported = Number(data.importedPhotos ?? 0);
      onMessage(
        'success',
        imported > 0
          ? `Imported ${imported} Google photo${imported === 1 ? '' : 's'} and description.`
          : 'Google description updated. No new photos to import.'
      );
    } catch (error) {
      onMessage('error', error instanceof Error ? error.message : 'Failed to import from Google.');
    } finally {
      setImportingGoogle(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-3">
        <label className="block text-sm font-medium text-slate-600">Photos</label>
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-400">Primary photo is used on cards and map popups</p>
          <button
            type="button"
            onClick={() => void handleImportGoogle()}
            disabled={uploading || importingGoogle}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {importingGoogle ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {importingGoogle ? 'Importing…' : 'Import Google photos'}
          </button>
        </div>
      </div>

      {(uploading || importingGoogle) && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-right-stay-600" />
          <span className="text-sm text-right-stay-600">
            {importingGoogle
              ? 'Downloading Google profile photos…'
              : 'Compressing and uploading photo...'}
          </span>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`mb-4 p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-200 bg-slate-50 hover:border-blue-500/50 hover:bg-slate-50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-1">
            Drag and drop images here, or click to browse
          </p>
          <p className="text-xs text-slate-500">
            Supports multiple images (max 15MB each, auto-compressed to ~2MB)
          </p>
        </div>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group bg-slate-50 rounded-lg overflow-hidden border border-slate-200"
            >
              <div className="aspect-video relative">
                <PlaceThumb
                  src={photo.url}
                  alt="Guide place photo"
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
                      type="button"
                      onClick={() => handleSetPrimary(photo.id)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
          <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-4">No photos uploaded yet</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-right-stay-600">
            <Upload className="w-4 h-4" />
            <span>Drop or click above to add the first photo</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuideSettings() {
  const [section, setSection] = useState<SectionTab>('categories');
  const [categories, setCategories] = useState<GuideCategoryRow[]>([]);
  const [items, setItems] = useState<GuideItemAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GuideCategoryRow | null>(null);
  const [editingItem, setEditingItem] = useState<GuideItemAdmin | null>(null);
  const [placePhotos, setPlacePhotos] = useState<GuideItemPhoto[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [placeSlugManuallyEdited, setPlaceSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [mapPickerSession, setMapPickerSession] = useState(0);
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeCategoryFilter, setPlaceCategoryFilter] = useState('');
  const [importingGoogle, setImportingGoogle] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState(DEFAULT_CATEGORY_FORM);
  const [placeForm, setPlaceForm] = useState(DEFAULT_PLACE_FORM);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchCategories = async () => {
    try {
      setLoadError(null);
      const response = await fetch('/api/admin/guide-categories');
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to load categories'));
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching guide categories:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (categoryId?: string) => {
    try {
      setItemsError(null);
      const query = categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : '';
      const response = await fetch(`/api/admin/guide-items${query}`);
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to load places'));
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching guide items:', error);
      setItemsError(error instanceof Error ? error.message : 'Failed to load places');
    } finally {
      setItemsLoading(false);
    }
  };

  const handlePlacePhotosChange = useCallback(
    (photos: GuideItemPhoto[]) => {
      setPlacePhotos(photos);
      fetchItems(placeCategoryFilter || undefined);
    },
    [placeCategoryFilter]
  );

  const handleOpenModal = (category?: GuideCategoryRow) => {
    if (category) {
      setEditingCategory(category);
      setSlugManuallyEdited(true);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        icon: isCategoryIconName(category.icon) ? category.icon : 'Compass',
        color: category.color || '#2f8f5b',
        is_active: category.is_active !== null ? category.is_active : true,
      });
    } else {
      setEditingCategory(null);
      setSlugManuallyEdited(false);
      setFormData(DEFAULT_CATEGORY_FORM);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setSlugManuallyEdited(false);
    setFormData(DEFAULT_CATEGORY_FORM);
  };

  const handleOpenPlaceModal = (item?: GuideItemAdmin) => {
    setMapPickerSession((current) => current + 1);
    if (item) {
      setEditingItem(item);
      setPlaceSlugManuallyEdited(true);
      setPlacePhotos(item.photos || []);
      setPlaceForm({
        name: item.name || '',
        slug: item.slug || '',
        category_id: item.category_id || '',
        short_description: item.short_description || '',
        description: item.description || '',
        address: item.address || '',
        latitude: item.latitude != null ? String(item.latitude) : '',
        longitude: item.longitude != null ? String(item.longitude) : '',
        price_level: item.price_level || '$$',
        website_url: item.website_url || '',
        booking_url: item.booking_url || '',
        phone: item.phone || '',
        tags: formatTags(item.tags),
        is_featured: Boolean(item.is_featured),
        is_active: item.is_active !== null ? item.is_active : true,
        google_place_id: item.google_place_id || '',
      });
    } else {
      setEditingItem(null);
      setPlaceSlugManuallyEdited(false);
      setPlacePhotos([]);
      setPlaceForm({
        ...DEFAULT_PLACE_FORM,
        category_id: placeCategoryFilter || categories[0]?.id || '',
      });
    }
    setShowPlaceModal(true);
  };

  const handleClosePlaceModal = () => {
    setShowPlaceModal(false);
    setEditingItem(null);
    setPlacePhotos([]);
    setPlaceSlugManuallyEdited(false);
    setPlaceForm(DEFAULT_PLACE_FORM);
    setImportingGoogle(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingCategory
        ? `/api/admin/guide-categories?id=${editingCategory.id}`
        : '/api/admin/guide-categories';

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || slugify(formData.name),
        }),
      });

      if (response.ok) {
        showMessage(
          'success',
          `Category ${editingCategory ? 'updated' : 'created'} successfully!`
        );
        handleCloseModal();
        fetchCategories();
      } else {
        showMessage('error', await readErrorMessage(response, 'Failed to save category'));
      }
    } catch (error) {
      showMessage('error', 'Error saving category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseCoordinate(placeForm.latitude);
    const lng = parseCoordinate(placeForm.longitude);
    if (!hasValidMapCoordinates(lat, lng)) {
      showMessage('error', 'Drop a pin on the map to set the place location.');
      return;
    }

    setSaving(true);

    try {
      const url = editingItem
        ? `/api/admin/guide-items?id=${editingItem.id}`
        : '/api/admin/guide-items';

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...placeForm,
          slug: placeForm.slug || slugify(placeForm.name),
          latitude: lat,
          longitude: lng,
        }),
      });

      if (response.ok) {
        const saved: GuideItemAdmin = await response.json();
        const googlePlaceId = placeForm.google_place_id || saved.google_place_id;
        const shouldImportGoogle =
          Boolean(googlePlaceId) &&
          (!editingItem || editingItem.google_place_id !== googlePlaceId);

        if (shouldImportGoogle) {
          setImportingGoogle(true);
          try {
            const importResponse = await fetch('/api/admin/guide-items/import-google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                guideItemId: saved.id,
                placeId: googlePlaceId,
                overwriteCopy: false,
              }),
            });
            if (importResponse.ok) {
              const imported = await importResponse.json();
              const importedItem = (imported.item || saved) as GuideItemAdmin;
              const photoCount = Number(imported.importedPhotos ?? 0);
              showMessage(
                'success',
                photoCount > 0
                  ? `Place saved. Imported ${photoCount} Google photo${photoCount === 1 ? '' : 's'}.`
                  : editingItem
                    ? 'Place updated successfully!'
                    : 'Place created successfully. Add photos below.'
              );
              fetchItems(placeCategoryFilter || undefined);
              fetchCategories();
              if (editingItem) {
                handleClosePlaceModal();
              } else {
                setEditingItem(importedItem);
                setPlacePhotos(importedItem.photos || []);
                setPlaceForm((prev) => ({
                  ...prev,
                  short_description: importedItem.short_description || prev.short_description,
                  description: importedItem.description || prev.description,
                  website_url: importedItem.website_url || prev.website_url,
                  phone: importedItem.phone || prev.phone,
                  google_place_id: importedItem.google_place_id || prev.google_place_id,
                }));
                setPlaceSlugManuallyEdited(true);
                setMapPickerSession((current) => current + 1);
              }
              return;
            }
          } finally {
            setImportingGoogle(false);
          }
        }

        showMessage(
          'success',
          editingItem
            ? 'Place updated successfully!'
            : 'Place created successfully. Add photos below.'
        );
        fetchItems(placeCategoryFilter || undefined);
        fetchCategories();
        if (editingItem) {
          handleClosePlaceModal();
        } else {
          setEditingItem(saved);
          setPlacePhotos(saved.photos || []);
          setPlaceSlugManuallyEdited(true);
          setMapPickerSession((current) => current + 1);
        }
      } else {
        showMessage('error', await readErrorMessage(response, 'Failed to save place'));
      }
    } catch (error) {
      showMessage('error', 'Error saving place. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: GuideCategoryRow) => {
    if (!confirm(`Are you sure you want to delete “${category.name}”?`)) return;

    setUpdatingId(category.id);
    try {
      const response = await fetch(`/api/admin/guide-categories?id=${category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Category deleted successfully!');
        fetchCategories();
      } else {
        showMessage('error', await readErrorMessage(response, 'Failed to delete category'));
      }
    } catch (error) {
      showMessage('error', 'Error deleting category. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeletePlace = async (item: GuideItemAdmin) => {
    if (!confirm(`Are you sure you want to delete “${item.name}”?`)) return;

    setUpdatingId(item.id);
    try {
      const response = await fetch(`/api/admin/guide-items?id=${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Place deleted successfully!');
        fetchItems(placeCategoryFilter || undefined);
        fetchCategories();
      } else {
        showMessage('error', await readErrorMessage(response, 'Failed to delete place'));
      }
    } catch (error) {
      showMessage('error', 'Error deleting place. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (category: GuideCategoryRow) => {
    const nextActive = !category.is_active;
    setUpdatingId(category.id);
    setCategories((prev) =>
      prev.map((row) => (row.id === category.id ? { ...row, is_active: nextActive } : row))
    );

    try {
      const response = await fetch(`/api/admin/guide-categories?id=${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to update category'));
      }
    } catch (error) {
      setCategories((prev) =>
        prev.map((row) =>
          row.id === category.id ? { ...row, is_active: category.is_active } : row
        )
      );
      showMessage('error', error instanceof Error ? error.message : 'Error updating category.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTogglePlaceActive = async (item: GuideItemAdmin) => {
    const nextActive = !item.is_active;
    setUpdatingId(item.id);
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, is_active: nextActive } : row))
    );

    try {
      const response = await fetch(`/api/admin/guide-items?id=${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to update place'));
      }
    } catch (error) {
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, is_active: item.is_active } : row))
      );
      showMessage('error', error instanceof Error ? error.message : 'Error updating place.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const current = categories[index];
    const neighbor = categories[targetIndex];
    setUpdatingId(current.id);

    try {
      const [currentResponse, neighborResponse] = await Promise.all([
        fetch(`/api/admin/guide-categories?id=${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: neighbor.sort_order }),
        }),
        fetch(`/api/admin/guide-categories?id=${neighbor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: current.sort_order }),
        }),
      ]);

      if (!currentResponse.ok || !neighborResponse.ok) {
        const failed = currentResponse.ok ? neighborResponse : currentResponse;
        throw new Error(await readErrorMessage(failed, 'Failed to reorder categories'));
      }

      await fetchCategories();
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Error reordering categories.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCoordinatesChange = useCallback((lat: string, lng: string) => {
    setPlaceForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  const handleCategoryFilterChange = (categoryId: string) => {
    setPlaceCategoryFilter(categoryId);
    setItemsLoading(true);
    fetchItems(categoryId || undefined);
  };

  const filteredItems = items.filter((item) => {
    const query = placeSearch.trim().toLowerCase();
    if (!query) return true;
    const haystack = [
      item.name,
      item.short_description,
      item.address || '',
      ...(item.tags || []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });

  if (loading) {
    return <GuideSettingsSkeleton />;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Things To Do Guide</h2>
        <p className="text-slate-500">
          Manage categories and places for the Cape Town guide.
        </p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => setSection('categories')}
          className={`px-4 py-2 -mb-px border-b-2 text-sm font-medium transition-colors ${
            section === 'categories'
              ? 'border-right-stay-500 text-right-stay-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Categories
        </button>
        <button
          type="button"
          onClick={() => setSection('places')}
          className={`px-4 py-2 -mb-px border-b-2 text-sm font-medium transition-colors ${
            section === 'places'
              ? 'border-right-stay-500 text-right-stay-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Places
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
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

      {section === 'categories' && (
        <>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Categories</h3>
              <p className="text-sm text-slate-500">
                Icons and colors appear on map pins and filter chips.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-right-stay-500 hover:bg-right-stay-600 text-slate-900 font-medium rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add New</span>
            </button>
          </div>

          {loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <p className="text-red-700 font-medium mb-1">Couldn’t load categories</p>
              <p className="text-sm text-red-600 mb-4">{loadError}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  fetchCategories();
                }}
                className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {categories.map((category, index) => {
                const busy = updatingId === category.id;
                return (
                  <div
                    key={category.id}
                    className="bg-white rounded-lg px-4 py-3 border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMove(index, -1)}
                          disabled={index === 0 || busy}
                          className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                          aria-label={`Move ${category.name} up`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 1)}
                          disabled={index === categories.length - 1 || busy}
                          className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                          aria-label={`Move ${category.name} down`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        <CategoryGlyph name={category.icon} className="w-5 h-5" />
                      </div>

                      <span
                        className="h-6 w-6 shrink-0 rounded-full border border-slate-200"
                        style={{ backgroundColor: category.color }}
                        title={category.color}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 truncate">{category.name}</h3>
                          <span className="hidden sm:inline text-xs text-slate-400 truncate">
                            /{category.slug}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {category.item_count} {category.item_count === 1 ? 'item' : 'items'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(category)}
                          disabled={busy}
                          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                            category.is_active ? 'bg-right-stay-500' : 'bg-slate-300'
                          } disabled:opacity-60`}
                          role="switch"
                          aria-checked={category.is_active}
                          aria-label={`${category.is_active ? 'Deactivate' : 'Activate'} ${category.name}`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                              category.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="p-2 text-right-stay-600 hover:bg-right-stay-50 rounded-lg transition-colors"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          disabled={busy}
                          className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          aria-label={`Delete ${category.name}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {categories.length === 0 && (
                <AdminEmptyState
                  icon={Compass}
                  title="No categories yet"
                  body="Add a category first so places can be grouped on the guest guide."
                  action={
                    <button
                      type="button"
                      onClick={() => handleOpenModal()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-right-stay-500 hover:bg-right-stay-600 text-slate-900 font-medium rounded-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add category
                    </button>
                  }
                />
              )}
            </div>
          )}
        </>
      )}

      {section === 'places' && (
        <>
          <div className="flex justify-between items-start mb-6 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Places</h3>
              <p className="text-sm text-slate-500">
                Add restaurants, sights, and experiences that appear on the guest guide map.
              </p>
            </div>
            <button
              onClick={() => handleOpenPlaceModal()}
              disabled={categories.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-right-stay-500 hover:bg-right-stay-600 text-slate-900 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span>Add Place</span>
            </button>
          </div>

          {categories.length === 0 && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Add a category first, then you can create places.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                value={placeSearch}
                onChange={(e) => setPlaceSearch(e.target.value)}
                placeholder="Search places..."
                className={`${INPUT_CLASS} pl-10`}
              />
            </div>
            <select
              value={placeCategoryFilter}
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
              className={`${INPUT_CLASS} sm:w-56`}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {itemsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <p className="text-red-700 font-medium mb-1">Couldn’t load places</p>
              <p className="text-sm text-red-600 mb-4">{itemsError}</p>
              <button
                type="button"
                onClick={() => {
                  setItemsLoading(true);
                  fetchItems(placeCategoryFilter || undefined);
                }}
                className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Try again
              </button>
            </div>
          ) : itemsLoading ? (
            <GuideListRowsSkeleton rows={5} />
          ) : (
            <div className="grid gap-3">
              {filteredItems.map((item) => {
                const busy = updatingId === item.id;
                const category = item.category;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg px-4 py-3 border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        <PlaceThumb src={item.primary_photo_url} alt={item.name} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                          {item.is_featured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.is_active
                                ? 'bg-green-500/10 text-green-700 border border-green-500/20'
                                : 'bg-gray-500/10 text-slate-500 border border-gray-500/20'
                            }`}
                          >
                            {item.is_active ? 'Published' : 'Unpublished'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          {category && (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                              style={{ backgroundColor: category.color }}
                            >
                              <CategoryGlyph name={category.icon} className="w-3 h-3" />
                              {category.name}
                            </span>
                          )}
                          <span className="text-slate-400">
                            {priceLevelLabel(item.price_level)}
                          </span>
                          {item.address && (
                            <span className="truncate hidden sm:inline">{item.address}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePlaceActive(item)}
                          disabled={busy}
                          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                            item.is_active ? 'bg-right-stay-500' : 'bg-slate-300'
                          } disabled:opacity-60`}
                          role="switch"
                          aria-checked={item.is_active}
                          aria-label={`${item.is_active ? 'Unpublish' : 'Publish'} ${item.name}`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                              item.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleOpenPlaceModal(item)}
                          className="p-2 text-right-stay-600 hover:bg-right-stay-50 rounded-lg transition-colors"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlace(item)}
                          disabled={busy}
                          className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <AdminEmptyState
                  icon={items.length === 0 ? Compass : Search}
                  title={
                    items.length === 0
                      ? placeCategoryFilter
                        ? 'No places in this category'
                        : 'No places published yet'
                      : 'No places match your search'
                  }
                  body={
                    items.length === 0
                      ? placeCategoryFilter
                        ? 'Add a place to this category, or switch filters to see the rest of the shortlist.'
                        : 'Add restaurants, sights, and neighbourhood spots for the guest map.'
                      : 'Try a different search, or clear the category filter.'
                  }
                  action={
                    items.length === 0 && categories.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleOpenPlaceModal()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-right-stay-500 hover:bg-right-stay-600 text-slate-900 font-medium rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Add place
                      </button>
                    ) : undefined
                  }
                />
              )}
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: slugManuallyEdited ? prev.slug : slugify(name),
                    }));
                  }}
                  required
                  className={INPUT_CLASS}
                  placeholder="e.g., Food & Drink"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    }));
                  }}
                  required
                  className={INPUT_CLASS}
                  placeholder="food-drink"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Auto-generated from the name; you can edit it before saving.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Icon *</label>
                <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                  {CATEGORY_ICON_OPTIONS.map(([name, Icon]) => {
                    const selected = formData.icon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, icon: name }))}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[11px] transition-colors ${
                          selected
                            ? 'border-right-stay-500 bg-right-stay-50 text-right-stay-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        aria-pressed={selected}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="truncate w-full text-center">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Color *</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="h-10 w-12 cursor-pointer rounded border border-slate-200 bg-white p-1"
                    aria-label="Custom category color"
                  />
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((color) => {
                      const selected = formData.color.toLowerCase() === color.toLowerCase();
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, color }))}
                          className={`h-8 w-8 rounded-full border-2 transition-transform ${
                            selected
                              ? 'border-slate-900 scale-110'
                              : 'border-white shadow-[0_0_0_1px_rgba(15,23,42,0.15)]'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Use color ${color}`}
                          aria-pressed={selected}
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm font-mono text-slate-500">{formData.color}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-200 rounded focus:ring-right-stay-500 focus:ring-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-600">
                  Active (visible to customers)
                </label>
              </div>

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
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-2 bg-right-stay-500 hover:bg-right-stay-600 text-slate-900 font-medium rounded-lg transition-all disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{editingCategory ? 'Update' : 'Create'} Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPlaceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6">
          <div className="min-h-full flex items-start justify-center pt-4 sm:pt-8">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingItem ? 'Edit Place' : 'Add New Place'}
                </h3>
                <button
                  onClick={handleClosePlaceModal}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handlePlaceSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Name *</label>
                  <input
                    type="text"
                    value={placeForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setPlaceForm((prev) => ({
                        ...prev,
                        name,
                        slug: placeSlugManuallyEdited ? prev.slug : slugify(name),
                      }));
                    }}
                    required
                    className={INPUT_CLASS}
                    placeholder="e.g., Kloof Street House"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Slug *</label>
                    <input
                      type="text"
                      value={placeForm.slug}
                      onChange={(e) => {
                        setPlaceSlugManuallyEdited(true);
                        setPlaceForm((prev) => ({
                          ...prev,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                        }));
                      }}
                      required
                      className={INPUT_CLASS}
                      placeholder="kloof-street-house"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Category *
                    </label>
                    <select
                      value={placeForm.category_id}
                      onChange={(e) =>
                        setPlaceForm((prev) => ({ ...prev, category_id: e.target.value }))
                      }
                      required
                      className={INPUT_CLASS}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Short description *
                  </label>
                  <input
                    type="text"
                    value={placeForm.short_description}
                    onChange={(e) =>
                      setPlaceForm((prev) => ({ ...prev, short_description: e.target.value }))
                    }
                    required
                    maxLength={160}
                    className={INPUT_CLASS}
                    placeholder="One-line copy for map popups and cards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={placeForm.description}
                    onChange={(e) =>
                      setPlaceForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    required
                    rows={4}
                    className={`${INPUT_CLASS} resize-none`}
                    placeholder="Full detail panel copy..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Address</label>
                  <AddressSearchInput
                    value={placeForm.address}
                    onChange={(address) =>
                      setPlaceForm((prev) => ({ ...prev, address }))
                    }
                    onResolved={(result) =>
                      setPlaceForm((prev) =>
                        applyGooglePlaceToForm(prev, result, placeSlugManuallyEdited)
                      )
                    }
                    enrichPlace
                    inputClassName={INPUT_CLASS}
                    placeholder="Search Google Maps for a street, venue, or neighbourhood"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Choosing a Google place fills the description and imports profile photos after you save.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Location *
                  </label>
                  <PropertyLocationPicker
                    key={`guide-map-${editingItem?.id ?? 'new'}-${mapPickerSession}`}
                    latitude={placeForm.latitude}
                    longitude={placeForm.longitude}
                    onCoordinatesChange={handleCoordinatesChange}
                  />
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <input
                      type="text"
                      value={placeForm.latitude}
                      readOnly
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-default"
                      placeholder="Latitude"
                      aria-label="Latitude"
                    />
                    <input
                      type="text"
                      value={placeForm.longitude}
                      readOnly
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-default"
                      placeholder="Longitude"
                      aria-label="Longitude"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Price level
                  </label>
                  <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                    {PRICE_LEVELS.map((level) => {
                      const selected = placeForm.price_level === level.value;
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() =>
                            setPlaceForm((prev) => ({ ...prev, price_level: level.value }))
                          }
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            selected
                              ? 'bg-right-stay-500 text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          aria-pressed={selected}
                        >
                          {level.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={placeForm.website_url}
                      onChange={(e) =>
                        setPlaceForm((prev) => ({ ...prev, website_url: e.target.value }))
                      }
                      className={INPUT_CLASS}
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Booking URL
                    </label>
                    <input
                      type="url"
                      value={placeForm.booking_url}
                      onChange={(e) =>
                        setPlaceForm((prev) => ({ ...prev, booking_url: e.target.value }))
                      }
                      className={INPUT_CLASS}
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={placeForm.phone}
                      onChange={(e) =>
                        setPlaceForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className={INPUT_CLASS}
                      placeholder="+27 ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Tags</label>
                    <input
                      type="text"
                      value={placeForm.tags}
                      onChange={(e) =>
                        setPlaceForm((prev) => ({ ...prev, tags: e.target.value }))
                      }
                      className={INPUT_CLASS}
                      placeholder="brunch, views, family"
                    />
                    <p className="mt-1 text-xs text-slate-400">Comma-separated list</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="place_is_featured"
                      checked={placeForm.is_featured}
                      onChange={(e) =>
                        setPlaceForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                      }
                      className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-200 rounded focus:ring-right-stay-500 focus:ring-2"
                    />
                    <label htmlFor="place_is_featured" className="text-sm font-medium text-slate-600">
                      Featured
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="place_is_active"
                      checked={placeForm.is_active}
                      onChange={(e) =>
                        setPlaceForm((prev) => ({ ...prev, is_active: e.target.checked }))
                      }
                      className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-200 rounded focus:ring-right-stay-500 focus:ring-2"
                    />
                    <label htmlFor="place_is_active" className="text-sm font-medium text-slate-600">
                      Published (visible to customers)
                    </label>
                  </div>
                </div>

                {editingItem ? (
                  <GuideItemPhotoManager
                    itemId={editingItem.id}
                    photos={placePhotos}
                    onPhotosChange={handlePlacePhotosChange}
                    onMessage={showMessage}
                    onPlaceImported={(item) => {
                      setEditingItem(item);
                      setPlaceForm((prev) => ({
                        ...prev,
                        short_description: item.short_description || prev.short_description,
                        description: item.description || prev.description,
                        website_url: item.website_url || prev.website_url || '',
                        phone: item.phone || prev.phone || '',
                        address: item.address || prev.address,
                        google_place_id: item.google_place_id || prev.google_place_id,
                      }));
                    }}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Save this place first, then you can upload photos.
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClosePlaceModal}
                    className="px-6 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {editingItem ? 'Done' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving || importingGoogle}
                    className="flex items-center space-x-2 px-6 py-2 bg-right-stay-500 hover:bg-right-stay-600 text-slate-900 font-medium rounded-lg transition-all disabled:opacity-60"
                  >
                    {saving || importingGoogle ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>
                      {importingGoogle
                        ? 'Importing Google photos…'
                        : `${editingItem ? 'Update' : 'Create'} Place`}
                    </span>
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
