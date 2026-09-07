import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Plus, Trash2, X } from 'lucide-react';
import { createResource, deleteResource, fetchDistricts, fetchStates, updateResource } from '../api/client.js';

export default function AdminModal({ isOpen, onClose, editingResource, onRefresh }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: 'hospitals',
    category: 'Hospitals',
    orgType: 'Government',
    state: 'Punjab',
    district: 'Ludhiana',
    city: 'Ludhiana',
    addr: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    hours: 'Open 24/7',
    eligibility: 'Open to all citizens',
    availableServices: 'Emergency Ward, General OPD',
    emergency: false,
    verificationStatus: 'Verified',
    lat: 30.9085,
    lng: 75.856
  });

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStates().then(({ states }) => setStates(states || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.state) {
      fetchDistricts(form.state).then(({ districts }) => setDistricts(districts || [])).catch(() => setDistricts([]));
    }
  }, [form.state]);

  useEffect(() => {
    if (editingResource) {
      setForm({
        ...editingResource,
        availableServices: Array.isArray(editingResource.availableServices)
          ? editingResource.availableServices.join(', ')
          : editingResource.availableServices || ''
      });
    }
  }, [editingResource]);

  if (!isOpen) return null;

  function handleChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [e.target.name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        availableServices: typeof form.availableServices === 'string'
          ? form.availableServices.split(',').map((s) => s.trim()).filter(Boolean)
          : form.availableServices
      };

      if (editingResource) {
        await updateResource(editingResource.id || editingResource._id, payload);
        setSuccess('Resource updated successfully!');
      } else {
        await createResource(payload);
        setSuccess('New resource created successfully!');
      }

      onRefresh();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!editingResource) return;
    if (!window.confirm(`Are you sure you want to delete "${editingResource.name}"?`)) return;
    setLoading(true);
    try {
      await deleteResource(editingResource.id || editingResource._id);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-[#111124] border border-white/10 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-1">
          {editingResource ? 'Edit Resource' : 'Add Community Resource'}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Manage India-wide verified resources across healthcare, education, NGOs, and public services.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Resource Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl p-2.5 bg-white/5 border border-white/10 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Category *</label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={(e) => {
                  const selText = e.target.options[e.target.selectedIndex].text;
                  setForm((f) => ({ ...f, categoryId: e.target.value, category: selText }));
                }}
                className="w-full rounded-xl p-2.5 bg-[#1a1a36] border border-white/10 text-white outline-none"
              >
                <option value="hospitals">Hospitals</option>
                <option value="education">Education</option>
                <option value="scholarships">Scholarships</option>
                <option value="employment">Employment</option>
                <option value="skill_development">Skill Development</option>
                <option value="government_schemes">Government Schemes</option>
                <option value="food_assistance">Food Assistance</option>
                <option value="housing">Housing</option>
                <option value="legal_aid">Legal Aid</option>
                <option value="women_support">Women Support</option>
                <option value="child_support">Child Support</option>
                <option value="senior_citizen_services">Senior Services</option>
                <option value="disability_support">Disability Support</option>
                <option value="mental_health">Mental Health</option>
                <option value="ngos">NGOs</option>
                <option value="emergency_services">Emergency Services</option>
                <option value="blood_banks">Blood Banks</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">State / UT *</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full rounded-xl p-2.5 bg-[#1a1a36] border border-white/10 text-white outline-none"
              >
                {states.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">District</label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                className="w-full rounded-xl p-2.5 bg-[#1a1a36] border border-white/10 text-white outline-none"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">City / Town *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full rounded-xl p-2.5 bg-white/5 border border-white/10 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Address *</label>
              <input
                name="addr"
                value={form.addr}
                onChange={handleChange}
                required
                className="w-full rounded-xl p-2.5 bg-white/5 border border-white/10 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">PIN Code</label>
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                maxLength={6}
                className="w-full rounded-xl p-2.5 bg-white/5 border border-white/10 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl p-2.5 bg-white/5 border border-white/10 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl p-2.5 bg-white/5 border border-white/10 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Organization Type</label>
              <select
                name="orgType"
                value={form.orgType}
                onChange={handleChange}
                className="w-full rounded-xl p-2.5 bg-[#1a1a36] border border-white/10 text-white outline-none"
              >
                <option value="Government">Government</option>
                <option value="NGO">NGO</option>
                <option value="Private">Private</option>
                <option value="Trust">Trust</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-xl p-2.5 bg-white/5 border border-white/10 text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="emergency"
                checked={form.emergency}
                onChange={handleChange}
                className="rounded text-brand-500"
              />
              <span>Emergency 24x7 Facility</span>
            </label>
            <div className="ml-auto flex items-center gap-2">
              {editingResource && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="rounded-xl px-4 py-2.5 bg-rose-500/20 text-rose-300 font-semibold"
                >
                  Delete
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white shadow-glow"
              >
                {loading ? 'Saving...' : editingResource ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
