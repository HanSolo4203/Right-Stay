'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, CheckCircle, AlertCircle, X, Save, Building2, MapPin } from 'lucide-react';

interface PropertyMapping {
  id: string;
  uplisting_property_id: string;
  apartment_id: string;
  apartments: {
    apartment_number: string;
    address: string;
  };
  created_at: string;
}

interface Apartment {
  id: string;
  apartment_number: string;
  address: string;
}

export default function PropertyMapping() {
  const [mappings, setMappings] = useState<PropertyMapping[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<PropertyMapping | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    uplisting_property_id: '',
    apartment_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mappingsResponse, apartmentsResponse] = await Promise.all([
        fetch('/api/admin/property-mappings'),
        fetch('/api/admin/properties')
      ]);

      if (mappingsResponse.ok) {
        const mappingsData = await mappingsResponse.json();
        setMappings(Array.isArray(mappingsData) ? mappingsData : []);
      } else {
        setMappings([]);
      }

      if (apartmentsResponse.ok) {
        const apartmentsData = await apartmentsResponse.json();
        // Transform cached_properties to apartments format if needed
        if (Array.isArray(apartmentsData)) {
          const transformedApartments = apartmentsData.map((prop: any) => ({
            id: prop.id,
            apartment_number: prop.uplisting_id,
            address: prop.name || 'N/A'
          }));
          setApartments(transformedApartments);
        } else {
          setApartments([]);
        }
      } else {
        setApartments([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMappings([]);
      setApartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mapping?: PropertyMapping) => {
    if (mapping) {
      setEditingMapping(mapping);
      setFormData({
        uplisting_property_id: mapping.uplisting_property_id,
        apartment_id: mapping.apartment_id,
      });
    } else {
      setEditingMapping(null);
      setFormData({
        uplisting_property_id: '',
        apartment_id: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMapping(null);
    setFormData({
      uplisting_property_id: '',
      apartment_id: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingMapping 
        ? `/api/admin/property-mappings?id=${editingMapping.id}`
        : '/api/admin/property-mappings';
      
      const response = await fetch(url, {
        method: editingMapping ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save property mapping');
      }

      setMessage({ 
        type: 'success', 
        text: `Property mapping ${editingMapping ? 'updated' : 'created'} successfully!` 
      });
      handleCloseModal();
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error saving property mapping' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property mapping?')) return;

    try {
      const response = await fetch(`/api/admin/property-mappings?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete property mapping');
      }

      setMessage({ type: 'success', text: 'Property mapping deleted successfully!' });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error deleting property mapping' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <h2 className="text-2xl font-bold text-white mb-2">Property Mapping</h2>
          <p className="text-gray-400">Map Uplisting properties to internal apartments</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Mapping</span>
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

      {/* Mappings Grid */}
      <div className="grid gap-4">
        {mappings.map((mapping) => (
          <div
            key={mapping.id}
            className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">Uplisting: {mapping.uplisting_property_id}</span>
                  </div>
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-green-400" />
                    <span className="text-white">Apartment: {mapping.apartments.apartment_number}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400">
                  <p>Address: {mapping.apartments.address || 'No address provided'}</p>
                  <p>Created: {new Date(mapping.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleOpenModal(mapping)}
                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(mapping.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {mappings.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No property mappings found. Add mappings to link Uplisting properties to apartments.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingMapping ? 'Edit Property Mapping' : 'Add New Property Mapping'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Uplisting Property ID *
                </label>
                <input
                  type="text"
                  name="uplisting_property_id"
                  value={formData.uplisting_property_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., 135133"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The property ID from Uplisting (e.g., 135133)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apartment *
                </label>
                <select
                  name="apartment_id"
                  value={formData.apartment_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select an apartment...</option>
                  {apartments.map((apartment) => (
                    <option key={apartment.id} value={apartment.id}>
                      {apartment.apartment_number} - {apartment.address || 'No address'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  The internal apartment that corresponds to this Uplisting property
                </p>
              </div>

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
                  <span>{editingMapping ? 'Update' : 'Create'} Mapping</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
