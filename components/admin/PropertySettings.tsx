'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, CheckCircle, AlertCircle, X, Save, Upload, Image as ImageIcon, Star } from 'lucide-react';
import Image from 'next/image';

interface Property {
  id: string;
  uplisting_id: string;
  name: string;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  beds: number | null;
  maximum_capacity: number | null;
  currency: string;
  description: string;
  check_in_time: number | null;
  check_out_time: number | null;
  ical_url: string | null;
  last_synced: string | null;
  created_at: string;
  updated_at: string;
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

export default function PropertySettings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      console.log('Fetching properties from API...');
      const response = await fetch('/api/admin/properties');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Properties data:', data);
        setProperties(data);
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
  };

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
      });
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
      });
      setPhotos([]);
    }
    setShowModal(true);
  };

  const fetchPhotos = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/admin/properties/photos?propertyId=${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
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
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProperty) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setUploadingPhoto(true);
    setUploadingPhotoId(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('propertyId', editingProperty.uplisting_id);
      formData.append('isPrimary', photos.length === 0 ? 'true' : 'false');

      const response = await fetch('/api/admin/properties/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        await fetchPhotos(editingProperty.uplisting_id);
        setMessage({ type: 'success', text: 'Photo uploaded successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload photo');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload photo' });
    } finally {
      setUploadingPhoto(false);
      e.target.value = ''; // Reset input
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
        setMessage({ type: 'success', text: 'Primary photo updated!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to update primary photo');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating primary photo. Please try again.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProperty 
        ? `/api/admin/properties?id=${editingProperty.id}`
        : '/api/admin/properties';
      
      const response = await fetch(url, {
        method: editingProperty ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Property ${editingProperty ? 'updated' : 'created'} successfully!` 
        });
        handleCloseModal();
        fetchProperties();
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to save property');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving property. Please try again.' });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Property Management</h2>
          <p className="text-gray-400">Manage all your rental properties</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Property</span>
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid gap-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-semibold text-white">
                    {property.name}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {property.type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                    ID: {property.uplisting_id}
                  </span>
                </div>
                
                {property.description && (
                  <p className="text-gray-400 mb-4 text-sm line-clamp-2">{property.description}</p>
                )}
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Bedrooms:</span>
                    <p className="text-white">{property.bedrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Bathrooms:</span>
                    <p className="text-white">{property.bathrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Max Capacity:</span>
                    <p className="text-white">{property.maximum_capacity || 'N/A'} guests</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Check-in:</span>
                    <p className="text-white">{property.check_in_time ? `${property.check_in_time}:00` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Check-out:</span>
                    <p className="text-white">{property.check_out_time ? `${property.check_out_time}:00` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Currency:</span>
                    <p className="text-white">{property.currency}</p>
                  </div>
                  {property.ical_url && (
                    <div className="md:col-span-3">
                      <span className="text-gray-400">iCal URL:</span>
                      <p className="text-white text-xs break-all">{property.ical_url}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleOpenModal(property)}
                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {properties.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No properties found. Add your first property to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Uplisting ID *
                  </label>
                  <input
                    type="text"
                    name="uplisting_id"
                    value={formData.uplisting_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g., 135133"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Property Type *
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g., Villa, Apartment, Lodge"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Property Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., Cape Town Luxury Villa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Property description..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    name="maximum_capacity"
                    value={formData.maximum_capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="ZAR">ZAR (South African Rand)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Check-in Time
                  </label>
                  <input
                    type="number"
                    name="check_in_time"
                    value={formData.check_in_time}
                    onChange={handleChange}
                    min="0"
                    max="23"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Check-out Time
                  </label>
                  <input
                    type="number"
                    name="check_out_time"
                    value={formData.check_out_time}
                    onChange={handleChange}
                    min="0"
                    max="23"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  iCal URL (for availability sync)
                </label>
                <input
                  type="url"
                  name="ical_url"
                  value={formData.ical_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://..."
                />
              </div>

              {/* Photo Management Section */}
              {editingProperty && (
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Property Photos
                    </h4>
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm text-blue-400">Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadingPhoto && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span className="text-sm text-blue-400">Uploading photo...</span>
                    </div>
                  )}

                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group bg-white/5 rounded-lg overflow-hidden border border-white/10"
                        >
                          <div className="aspect-video relative">
                            <Image
                              src={photo.url}
                              alt={photo.caption || 'Property photo'}
                              fill
                              className="object-cover"
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
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                                  title="Set as primary"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                                title="Delete photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {photo.caption && (
                            <p className="p-2 text-xs text-gray-400 truncate">{photo.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                      <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 mb-4">No photos uploaded yet</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm text-blue-400">Upload First Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
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
                  className="px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingProperty ? 'Update' : 'Create'} Property</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

