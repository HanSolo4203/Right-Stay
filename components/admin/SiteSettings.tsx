'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import {
  parseSiteFeatureFlags,
  type SiteFeatureFlags,
  type SiteSettingRow,
} from '@/lib/site-feature-flags';

export default function SiteSettings({
  onFeatureFlagsChange,
}: {
  onFeatureFlagsChange?: (flags: SiteFeatureFlags) => void;
} = {}) {
  const emitFeatureFlags = (toursEnabled: boolean, guideEnabled: boolean) => {
    onFeatureFlagsChange?.({ toursEnabled, guideEnabled });
  };

  const [settings, setSettings] = useState({
    site_name: '',
    site_email: '',
    site_phone: '',
    site_address: '',
    commission_rate: '',
    payment_processing_fee: '',
    default_cleaning_fee: '',
    default_welcome_pack_fee: '',
    ical_sync_schedule: '0 1 * * *',
    tours_enabled: false,
    guide_enabled: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [customCronExpression, setCustomCronExpression] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/site-settings');
      if (response.ok) {
        const data = await response.json();
        const rows: SiteSettingRow[] = Array.isArray(data) ? data : [];
        const flags = parseSiteFeatureFlags(rows);
        const settingsObj: Record<string, string> = {};

        rows.forEach((setting: SiteSettingRow) => {
          if (setting.key === 'tours_enabled' || setting.key === 'guide_enabled') {
            return;
          }
          if (setting.value !== null && setting.value !== undefined) {
            settingsObj[setting.key] = String(setting.value);
          } else if (setting.text_value !== null && setting.text_value !== undefined) {
            settingsObj[setting.key] = setting.text_value;
          }
        });

        setSettings(prevSettings => ({
          ...prevSettings,
          ...settingsObj,
          tours_enabled: flags.toursEnabled,
          guide_enabled: flags.guideEnabled,
        }));
        emitFeatureFlags(flags.toursEnabled, flags.guideEnabled);
        
        // Check if ical_sync_schedule is a custom value (not in predefined list)
        const predefinedSchedules = ['0 1 * * *', '0 */6 * * *', '0 * * * *', '*/30 * * * *', '*/10 * * * *'];
        if (settingsObj.ical_sync_schedule && !predefinedSchedules.includes(settingsObj.ical_sync_schedule)) {
          setCustomCronExpression(settingsObj.ical_sync_schedule);
          settingsObj.ical_sync_schedule = 'custom';
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Prepare settings for submission
      const settingsToSubmit = {
        ...settings,
        tours_enabled: settings.tours_enabled ? 1 : 0,
        guide_enabled: settings.guide_enabled ? 1 : 0,
      };
      if (settings.ical_sync_schedule === 'custom') {
        settingsToSubmit.ical_sync_schedule = customCronExpression || '0 1 * * *';
      }
      
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSubmit),
      });

      if (response.ok) {
        emitFeatureFlags(settings.tours_enabled, settings.guide_enabled);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleToursToggle = () => {
    const next = !settings.tours_enabled;
    setSettings((prev) => ({
      ...prev,
      tours_enabled: next,
    }));
    emitFeatureFlags(next, settings.guide_enabled);
  };

  const handleGuideToggle = () => {
    const next = !settings.guide_enabled;
    setSettings((prev) => ({
      ...prev,
      guide_enabled: next,
    }));
    emitFeatureFlags(settings.tours_enabled, next);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Site Name
            </label>
            <input
              type="text"
              name="site_name"
              value={settings.site_name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
              placeholder="Right Stay Africa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              name="site_email"
              value={settings.site_email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
              placeholder="info@right-stay.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              name="site_phone"
              value={settings.site_phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
              placeholder="+27 (0)21 000 0000"
            />
            <p className="mt-2 text-xs text-slate-500">
              Shown in the site footer and contact page. Use a local or international format, e.g. +27 (0)21 000 0000.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Address
            </label>
            <textarea
              name="site_address"
              value={settings.site_address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors resize-none"
              placeholder="Cape Town, South Africa"
            />
            <p className="mt-2 text-xs text-slate-500">
              Shown in the site footer and contact page.
            </p>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Financial Settings</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Default Commission Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="commission_rate"
                value={settings.commission_rate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Payment Processing Fee (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="payment_processing_fee"
                value={settings.payment_processing_fee}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Default Cleaning Fee (ZAR)
              </label>
              <input
                type="number"
                step="0.01"
                name="default_cleaning_fee"
                value={settings.default_cleaning_fee}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Default Welcome Pack Fee (ZAR)
              </label>
              <input
                type="number"
                step="0.01"
                name="default_welcome_pack_fee"
                value={settings.default_welcome_pack_fee}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Website Features */}
        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Website Features</h3>

          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">Enable Tours Page</p>
              <p className="mt-1 text-sm text-slate-500">
                Show Tours in the website menu and allow visitors to access the Tours page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToursToggle}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                settings.tours_enabled ? 'bg-right-stay-500' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={settings.tours_enabled}
              aria-label="Enable Tours Page"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  settings.tours_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">Things To Do Guide</p>
              <p className="mt-1 text-sm text-slate-500">
                Show the Cape Town things-to-do map in the main nav
              </p>
            </div>
            <button
              type="button"
              onClick={handleGuideToggle}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                settings.guide_enabled ? 'bg-right-stay-500' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={settings.guide_enabled}
              aria-label="Things To Do Guide"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  settings.guide_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Calendar Sync Settings */}
        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Calendar Sync Settings</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              iCal Sync Frequency
            </label>
            <select
              name="ical_sync_schedule"
              value={settings.ical_sync_schedule}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors"
            >
              <option value="0 1 * * *">Once per day (1 AM UTC)</option>
              <option value="0 */6 * * *">Every 6 hours</option>
              <option value="0 * * * *">Every hour</option>
              <option value="*/30 * * * *">Every 30 minutes</option>
              <option value="*/10 * * * *">Every 10 minutes</option>
              <option value="custom">Custom cron expression</option>
            </select>
            {settings.ical_sync_schedule === 'custom' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customCronExpression}
                  onChange={(e) => setCustomCronExpression(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors font-mono text-sm"
                  placeholder="0 1 * * *"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Format: minute hour day month weekday (e.g., &quot;0 1 * * *&quot; for daily at 1 AM)
                </p>
              </div>
            )}
            <p className="mt-2 text-xs text-slate-500">
              <span className="text-amber-700">Note:</span> Schedule changes require updating vercel.json and redeploying the application. This setting is for documentation purposes.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-right-stay-500 hover:bg-right-stay-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

