'use client'

import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Clock, Save } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Clinic {
  id: number;
  clinic_name: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postal_code: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  is_primary: boolean;
  hours: Array<{
    id: number;
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }>;
}

export default function DoctorClinicManagement() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [availability, setAvailability] = useState({
    telemedicineAvailable: false,
    inPersonAvailable: true,
    emergencyAvailable: false,
    insuranceAccepted: [] as string[],
    acceptsAllInsurance: false
  });

  const [newClinic, setNewClinic] = useState({
    clinicName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    latitude: 0,
    longitude: 0,
    phone: '',
    isPrimary: false,
    hours: Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: i === 0 || i === 6 // Sunday and Saturday closed by default
    }))
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchClinics();
    fetchAvailability();
  }, []);

  const fetchClinics = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/api/doctors/clinics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setClinics(response.data.data.clinics);
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/api/doctors/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && response.data.data.availability) {
        const avail = response.data.data.availability;
        setAvailability({
          telemedicineAvailable: avail.telemedicine_available,
          inPersonAvailable: avail.in_person_available,
          emergencyAvailable: avail.emergency_available,
          insuranceAccepted: avail.insurance_accepted || [],
          acceptsAllInsurance: avail.accepts_all_insurance
        });
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleAddClinic = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${API_URL}/api/doctors/clinics`,
        newClinic,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        alert('Clinic added successfully!');
        setShowAddForm(false);
        fetchClinics();
        // Reset form
        setNewClinic({
          clinicName: '',
          address: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          latitude: 0,
          longitude: 0,
          phone: '',
          isPrimary: false,
          hours: Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            openTime: '09:00',
            closeTime: '17:00',
            isClosed: i === 0 || i === 6
          }))
        });
      }
    } catch (error: any) {
      console.error('Error adding clinic:', error);
      alert(error.response?.data?.error || 'Failed to add clinic');
    }
  };

  const handleUpdateAvailability = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.put(
        `${API_URL}/api/doctors/availability`,
        availability,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        alert('Availability updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating availability:', error);
      alert(error.response?.data?.error || 'Failed to update availability');
    }
  };

  const geocodeAddress = async () => {
    // Simple geocoding using browser's geolocation as fallback
    // In production, use Google Maps Geocoding API or similar
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewClinic({
            ...newClinic,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          alert('Using your current location. Please adjust if needed.');
        },
        (error) => {
          alert('Please enter latitude and longitude manually');
        }
      );
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clinic Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Clinic
        </button>
      </div>

      {/* Availability Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Availability Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="telemedicine"
              checked={availability.telemedicineAvailable}
              onChange={(e) => setAvailability({ ...availability, telemedicineAvailable: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="telemedicine" className="font-medium">Telemedicine Available</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="inPerson"
              checked={availability.inPersonAvailable}
              onChange={(e) => setAvailability({ ...availability, inPersonAvailable: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="inPerson" className="font-medium">In-Person Consultation Available</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="emergency"
              checked={availability.emergencyAvailable}
              onChange={(e) => setAvailability({ ...availability, emergencyAvailable: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="emergency" className="font-medium">Emergency Availability</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allInsurance"
              checked={availability.acceptsAllInsurance}
              onChange={(e) => setAvailability({ ...availability, acceptsAllInsurance: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="allInsurance" className="font-medium">Accept All Major Insurance</label>
          </div>

          <div>
            <label className="block font-medium mb-2">Insurance Providers Accepted (comma-separated)</label>
            <input
              type="text"
              value={availability.insuranceAccepted.join(', ')}
              onChange={(e) => setAvailability({
                ...availability,
                insuranceAccepted: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="e.g., Blue Cross, Aetna, United Healthcare"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>

          <button
            onClick={handleUpdateAvailability}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Availability
          </button>
        </div>
      </div>

      {/* Add Clinic Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Clinic</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Clinic Name *</label>
              <input
                type="text"
                value={newClinic.clinicName}
                onChange={(e) => setNewClinic({ ...newClinic, clinicName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Address *</label>
              <input
                type="text"
                value={newClinic.address}
                onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">City *</label>
                <input
                  type="text"
                  value={newClinic.city}
                  onChange={(e) => setNewClinic({ ...newClinic, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">State</label>
                <input
                  type="text"
                  value={newClinic.state}
                  onChange={(e) => setNewClinic({ ...newClinic, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Country *</label>
                <input
                  type="text"
                  value={newClinic.country}
                  onChange={(e) => setNewClinic({ ...newClinic, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={newClinic.phone}
                  onChange={(e) => setNewClinic({ ...newClinic, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Latitude *</label>
                <input
                  type="number"
                  step="0.000001"
                  value={newClinic.latitude}
                  onChange={(e) => setNewClinic({ ...newClinic, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Longitude *</label>
                <input
                  type="number"
                  step="0.000001"
                  value={newClinic.longitude}
                  onChange={(e) => setNewClinic({ ...newClinic, longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <button
              onClick={geocodeAddress}
              className="text-sm text-blue-600 hover:underline"
            >
              Use my current location
            </button>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrimary"
                checked={newClinic.isPrimary}
                onChange={(e) => setNewClinic({ ...newClinic, isPrimary: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isPrimary" className="font-medium">Set as primary clinic</label>
            </div>

            {/* Clinic Hours */}
            <div>
              <h4 className="font-semibold mb-2">Clinic Hours</h4>
              <div className="space-y-2">
                {newClinic.hours.map((hour, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">{dayNames[hour.dayOfWeek]}</span>
                    <input
                      type="checkbox"
                      checked={!hour.isClosed}
                      onChange={(e) => {
                        const updatedHours = [...newClinic.hours];
                        updatedHours[index].isClosed = !e.target.checked;
                        setNewClinic({ ...newClinic, hours: updatedHours });
                      }}
                      className="mr-2"
                    />
                    {!hour.isClosed && (
                      <>
                        <input
                          type="time"
                          value={hour.openTime}
                          onChange={(e) => {
                            const updatedHours = [...newClinic.hours];
                            updatedHours[index].openTime = e.target.value;
                            setNewClinic({ ...newClinic, hours: updatedHours });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={hour.closeTime}
                          onChange={(e) => {
                            const updatedHours = [...newClinic.hours];
                            updatedHours[index].closeTime = e.target.value;
                            setNewClinic({ ...newClinic, hours: updatedHours });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      </>
                    )}
                    {hour.isClosed && <span className="text-gray-500">Closed</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddClinic}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Clinic
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Clinics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Clinics</h3>
        {clinics.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No clinics added yet. Add your first clinic to get started.
          </div>
        ) : (
          clinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{clinic.clinic_name}</h4>
                  {clinic.is_primary && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold mt-1">
                      Primary Clinic
                    </span>
                  )}
                  <p className="text-gray-600 mt-2">{clinic.address}</p>
                  <p className="text-gray-600">{clinic.city}, {clinic.state} {clinic.country}</p>
                  {clinic.phone && <p className="text-gray-600 mt-1">Phone: {clinic.phone}</p>}
                  
                  {/* Hours */}
                  {clinic.hours && clinic.hours.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-semibold text-sm mb-1">Hours:</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        {clinic.hours.map((hour) => (
                          <div key={hour.id}>
                            {dayNames[hour.day_of_week]}: {hour.is_closed ? 'Closed' : `${hour.open_time} - ${hour.close_time}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
