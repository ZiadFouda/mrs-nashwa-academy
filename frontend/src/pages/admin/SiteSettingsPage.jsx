import React, { useState } from 'react';
import platformDb from '../../utils/platformDb';
import { useAuth } from '../../contexts/AuthContext';
import {
  Sliders,
  Sparkles,
  Save,
  Globe,
  Bell,
  Shield,
  Smartphone,
  PhoneCall,
  Video,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SiteSettingsPage() {
  const { siteSettings, updateSiteSettings } = useAuth();
  const [formData, setFormData] = useState(() => ({
    ...platformDb.getSiteSettings(),
  }));
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateSiteSettings(formData);
      setIsSaving(false);
    } catch (err) {
      toast.error('Failed to save settings: ' + err.message);
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all site texts and configurations back to academy factory defaults?')) {
      const defaults = {
        academy_name: 'Mrs. Nashwa Abdelhalim',
        tagline: 'SAT & EST English Academic Platform',
        target_subheading: 'Official Portal for Grades 10, 11, and 12 American Diploma Scholars',
        announcement_enabled: true,
        announcement_text: '🚨 Official Digital SAT & EST Diagnostic Exams are now live. Remember: Accounts are locked to 1 authorized device.',
        announcement_badge: 'ACADEMY NOTICE',
        announcement_style: 'gold',
        whatsapp_number: '+20 1030924286',
        zoom_url: 'https://zoom.us',
        support_email: 'support@nashwa-academy.com',
        homepage_hero_title: 'Master the Digital SAT & EST English with Distinction',
        homepage_hero_subtitle: 'Specialized Reading & Writing programs for Grades 10, 11, and 12. Pacing frameworks, grammar conventions, and adaptive Module 2 strategies curated by Mrs. Nashwa Abdelhalim.',
        sat_target_score: '760+',
        device_lock_enabled_globally: true,
        tab_switch_limit: 3,
        notice_board_title: 'Academic Notice & Exam Registration',
        notice_board_text: 'Registration for the upcoming EST English exam and December Digital SAT is now active. Please ensure all student ID numbers and diagnostic quiz logs are updated in your profile.',
        theme_accent: '#c9a96e',
      };
      setFormData(defaults);
      updateSiteSettings(defaults);
      toast.success('Restored default site configuration.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1c1611] via-[#241c14] to-[#14100c] border border-[#c9a96e]/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#d4b87a] text-xs font-semibold mb-3 border border-[#c9a96e]/25">
              <Sliders className="w-3.5 h-3.5 text-[#c9a96e]" />
              <span>Direct In-Site Content & Platform Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8]">
              Live Site Editor & System Customizer
            </h1>
            <p className="text-[#a09787] text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Change headlines, announcements, contact numbers, exam policies, and security settings directly on the site for everyone — no code editing required.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2.5 rounded-xl bg-[#1c1611] hover:bg-[#282018] text-[#a09787] hover:text-[#f5f0e8] text-xs font-semibold border border-[#c9a96e]/20 transition flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition hover:brightness-105 active:scale-95 shadow-lg shadow-[#c9a96e]/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Applying Live...' : 'Apply Live to Site'}</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Global Announcement Banner */}
        <div className="p-6 rounded-2xl sm:rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#c9a96e]/15">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-[#c9a96e]" />
              <h3 className="font-serif font-bold text-base text-[#f5f0e8]">
                Global Top Announcement Banner
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcement_enabled}
                onChange={(e) => handleChange('announcement_enabled', e.target.checked)}
                className="w-4 h-4 rounded bg-[#1c1611] border-[#c9a96e]/30 text-[#c9a96e]"
              />
              <span className="text-xs text-[#d8cfc4] font-medium">Display on Site</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
                Badge Label
              </label>
              <input
                type="text"
                value={formData.announcement_badge}
                onChange={(e) => handleChange('announcement_badge', e.target.value)}
                placeholder="e.g. ACADEMY NOTICE"
                className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
                Banner Announcement Text
              </label>
              <input
                type="text"
                value={formData.announcement_text}
                onChange={(e) => handleChange('announcement_text', e.target.value)}
                placeholder="Message displayed across the top of all pages"
                className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
              Banner Accent Style
            </label>
            <div className="flex items-center gap-3">
              {[
                { id: 'gold', label: 'Gold Luxury' },
                { id: 'red', label: 'Urgent Red' },
                { id: 'emerald', label: 'Success Emerald' },
              ].map((style) => (
                <label key={style.id} className="flex items-center gap-2 cursor-pointer text-xs text-[#d8cfc4]">
                  <input
                    type="radio"
                    name="announcement_style"
                    checked={formData.announcement_style === style.id}
                    onChange={() => handleChange('announcement_style', style.id)}
                    className="text-[#c9a96e]"
                  />
                  <span>{style.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Branding & Platform Identity */}
        <div className="p-6 rounded-2xl sm:rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#c9a96e]/15">
            <Globe className="w-5 h-5 text-[#c9a96e]" />
            <h3 className="font-serif font-bold text-base text-[#f5f0e8]">
              Platform Branding & Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
                Academy Platform Name
              </label>
              <input
                type="text"
                value={formData.academy_name}
                onChange={(e) => handleChange('academy_name', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
                Header Tagline / Specialty
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
              Portal Target Subheading
            </label>
            <input
              type="text"
              value={formData.target_subheading}
              onChange={(e) => handleChange('target_subheading', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
            />
          </div>
        </div>

        {/* Section 3: Homepage Hero & Notice Board */}
        <div className="p-6 rounded-2xl sm:rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#c9a96e]/15">
            <FileText className="w-5 h-5 text-[#c9a96e]" />
            <h3 className="font-serif font-bold text-base text-[#f5f0e8]">
              Homepage Hero & Student Notice Board
            </h3>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
              Home Page Hero Headline
            </label>
            <input
              type="text"
              value={formData.homepage_hero_title}
              onChange={(e) => handleChange('homepage_hero_title', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
              Home Page Hero Description
            </label>
            <textarea
              rows={2}
              value={formData.homepage_hero_subtitle}
              onChange={(e) => handleChange('homepage_hero_subtitle', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
                Notice Board Title
              </label>
              <input
                type="text"
                value={formData.notice_board_title}
                onChange={(e) => handleChange('notice_board_title', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
                SAT Target Benchmark
              </label>
              <input
                type="text"
                value={formData.sat_target_score}
                onChange={(e) => handleChange('sat_target_score', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
              Notice Board Content (Shown on all Dashboards)
            </label>
            <textarea
              rows={2}
              value={formData.notice_board_text}
              onChange={(e) => handleChange('notice_board_text', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
            />
          </div>
        </div>

        {/* Section 4: Communication & Classroom Links */}
        <div className="p-6 rounded-2xl sm:rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#c9a96e]/15">
            <PhoneCall className="w-5 h-5 text-[#c9a96e]" />
            <h3 className="font-serif font-bold text-base text-[#f5f0e8]">
              Helpline & Virtual Classroom Links
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
                WhatsApp Academic Helpline Phone
              </label>
              <input
                type="text"
                value={formData.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="+2010..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#a09787] uppercase mb-1">
                Zoom Live Classroom URL
              </label>
              <input
                type="url"
                value={formData.zoom_url}
                onChange={(e) => handleChange('zoom_url', e.target.value)}
                placeholder="https://zoom.us/..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Academic Security & Single-Device Policy */}
        <div className="p-6 rounded-2xl sm:rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#c9a96e]/15">
            <Shield className="w-5 h-5 text-[#c9a96e]" />
            <h3 className="font-serif font-bold text-base text-[#f5f0e8]">
              Security, Tab Switching & Single-Device Lockdown
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#1c1611] border border-[#c9a96e]/20 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.device_lock_enabled_globally}
                onChange={(e) => handleChange('device_lock_enabled_globally', e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded bg-[#14100c] border-[#c9a96e]/30 text-[#c9a96e]"
              />
              <div>
                <span className="font-bold text-[#f5f0e8] text-xs block">
                  Enforce Single-Device & Browser Lockdown Globally
                </span>
                <span className="text-[11px] text-[#a09787] block mt-0.5">
                  When enabled, any student logging in is automatically bound to their specific device/browser.
                  Attempting to log in from another browser or device will be blocked until the Manager resets it.
                </span>
              </div>
            </label>

            <div className="p-3.5 rounded-2xl bg-[#1c1611] border border-[#c9a96e]/20 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#f5f0e8] text-xs block">
                  Exam Tab Switch Violation Limit
                </span>
                <span className="text-[11px] text-[#a09787] block mt-0.5">
                  Maximum permitted tab switches during timed SAT & EST mock tests before auto-submission.
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.tab_switch_limit}
                onChange={(e) => handleChange('tab_switch_limit', parseInt(e.target.value, 10) || 3)}
                className="w-16 px-3 py-1.5 rounded-xl bg-[#14100c] border border-[#c9a96e]/30 text-center font-bold text-sm text-[#c9a96e]"
              />
            </div>
          </div>
        </div>

        {/* Floating Apply Bar */}
        <div className="p-4 rounded-2xl bg-[#14100c] border border-[#c9a96e]/30 flex items-center justify-between sticky bottom-4 shadow-2xl z-20">
          <span className="text-xs text-[#a09787]">
            Changes saved here update the live interface for all scholars immediately.
          </span>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition hover:brightness-105 active:scale-95 shadow-lg shadow-[#c9a96e]/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
