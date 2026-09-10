import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Shield,
  Database,
  Cloud,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Save,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { settingsService } from '../api/services';

export const Settings = () => {
  const { user, changePassword } = useAuth();

  // Business Info State
  const [businessInfo, setBusinessInfo] = useState({
    site_name: '',
    phone: '',
    phone_secondary: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    region: '',
    tagline: '',
  });
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [businessError, setBusinessError] = useState('');
  const [businessSuccess, setBusinessSuccess] = useState('');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch Business Settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsService.get();
        if (res.success && res.settings) {
          setBusinessInfo({
            site_name: res.settings.site_name || '',
            phone: res.settings.phone || '',
            phone_secondary: res.settings.phone_secondary || '',
            whatsapp: res.settings.whatsapp || '',
            email: res.settings.email || '',
            address: res.settings.address || '',
            city: res.settings.city || '',
            region: res.settings.region || '',
            tagline: res.settings.tagline || '',
          });
        }
      } catch (err) {
        console.error('Failed to load business settings:', err);
      } finally {
        setLoadingBusiness(false);
      }
    };

    fetchSettings();
  }, []);

  const handleBusinessInfoChange = (field, value) => {
    setBusinessInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBusinessInfo = async (e) => {
    e.preventDefault();
    setBusinessError('');
    setBusinessSuccess('');
    setSavingBusiness(true);

    try {
      const res = await settingsService.update(businessInfo);
      if (res.success) {
        setBusinessSuccess('Business information updated successfully! Changes are live on the main website.');
      } else {
        setBusinessError(res.message || 'Failed to update business settings.');
      }
    } catch (err) {
      setBusinessError(err.response?.data?.message || err.message || 'Failed to update business settings.');
    } finally {
      setSavingBusiness(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      setSuccess(res.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          Admin Settings & Security
        </h2>
        <p className="text-sm text-stone-500 mt-0.5">
          Manage your credentials, system configurations, and connected storage
        </p>
      </div>

      {/* Business Information Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-50 text-gold-700 border border-gold-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Business & Contact Information</h3>
              <p className="text-xs text-stone-500">
                Update phone numbers, WhatsApp, address, and email displayed on the public website
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gold-50 text-gold-800 border border-gold-200">
            <Globe className="w-3.5 h-3.5 text-gold-600" />
            <span>Publicly Visible</span>
          </span>
        </div>

        {businessError && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{businessError}</span>
          </div>
        )}

        {businessSuccess && (
          <div className="flex items-center gap-2 p-3 text-sm text-gold-900 bg-gold-50 border border-gold-300 rounded-xl">
            <CheckCircle className="w-4 h-4 shrink-0 text-gold-600" />
            <span>{businessSuccess}</span>
          </div>
        )}

        {loadingBusiness ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-gold-600" />
            <span>Loading business profile...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveBusinessInfo} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Business / Brand Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={businessInfo.site_name}
                    onChange={(e) => handleBusinessInfoChange('site_name', e.target.value)}
                    placeholder="e.g. ස්වස්තික Floral Decor"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={businessInfo.tagline}
                  onChange={(e) => handleBusinessInfoChange('tagline', e.target.value)}
                  placeholder="e.g. Bespoke Wedding & Event Floral Styling"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
                />
              </div>

              {/* Primary Phone */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Primary Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={businessInfo.phone}
                    onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Secondary Phone */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Secondary Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={businessInfo.phone_secondary}
                    onChange={(e) => handleBusinessInfoChange('phone_secondary', e.target.value)}
                    placeholder="+94 71 987 6543"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  WhatsApp Number *
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={businessInfo.whatsapp}
                    onChange={(e) => handleBusinessInfoChange('whatsapp', e.target.value)}
                    placeholder="+94 77 123 4567 (with country code)"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Used for 1-click customer chat & photo inquiry links.</p>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Contact Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={businessInfo.email}
                    onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                    placeholder="info@swasthikaflorals.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  City / Base
                </label>
                <input
                  type="text"
                  value={businessInfo.city}
                  onChange={(e) => handleBusinessInfoChange('city', e.target.value)}
                  placeholder="e.g. Colombo"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
                />
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Province / Service Region
                </label>
                <input
                  type="text"
                  value={businessInfo.region}
                  onChange={(e) => handleBusinessInfoChange('region', e.target.value)}
                  placeholder="e.g. Western Province & Islandwide"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Physical Address / Workshop Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <textarea
                  rows={2}
                  value={businessInfo.address}
                  onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                  placeholder="e.g. No. 45, Flower Road, Colombo 07, Sri Lanka"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingBusiness}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gold-600 hover:bg-gold-700 active:bg-gold-800 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {savingBusiness ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Information...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Business Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security: Change Password Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Change Password</h3>
            <p className="text-xs text-stone-500">Update your administrative access password</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter existing password"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      </div>

      {/* Environment & Integration Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Backend Integrations & Architecture</h3>
            <p className="text-xs text-stone-500">Overview of configured cloud services and database</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-stone-800">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>PostgreSQL Database</span>
            </div>
            <p className="text-stone-500 leading-relaxed">
              Stores relational tables: <code>admins</code>, <code>categories</code>, and <code>decoration_images</code> with foreign key cascades and indexing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-stone-800">
              <Cloud className="w-4 h-4 text-teal-600" />
              <span>Sharp WebP & Cloudinary</span>
            </div>
            <p className="text-stone-500 leading-relaxed">
              Converts all uploaded decoration images to WebP format at high quality (quality: 92) before uploading to Cloudinary, ensuring crisp detail and ultra-fast page speeds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
