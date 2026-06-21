'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, LayoutTemplate } from 'lucide-react';
import {
  AdminShell,
  AdminPanel,
  adminInputClasses,
  adminTextareaClasses,
  adminPrimaryButtonClasses,
} from '../components/AdminShell';
import { useToast } from '@/context/ToastContext';

const EMPTY_FORM = {
  heroHeading: '',
  heroSubheading: '',
  primaryCta: '',
  secondaryCta: '',
  executiveTitle: '',
  executiveDescription: '',
  sportTitle: '',
  sportDescription: '',
  brandSpotlightTitle: '',
  brandSpotlightDescription: '',
  trust1Title: '',
  trust1Description: '',
  trust2Title: '',
  trust2Description: '',
  trust3Title: '',
  trust3Description: '',
};

const PLACEHOLDERS = {
  heroHeading: 'Timeless Design. Modern Presence.',
  heroSubheading: 'Experience visual and mechanical perfection. We curate an elite catalog of certified luxury watches…',
  primaryCta: 'Explore Collection',
  secondaryCta: 'Watch Houses',
  executiveTitle: 'The Mark of Leadership. Refined Boardroom Chronometers.',
  executiveDescription: 'Exude authority in every setting. Our Executive Collection brings together exceptional automatic models…',
  sportTitle: 'Engineered for Adventure. Robust Outdoor Chronographs.',
  sportDescription: 'Built to resist the elements without compromising on aesthetic prestige…',
  brandSpotlightTitle: 'Luxury Watch Houses',
  brandSpotlightDescription: 'Optional subtitle shown below the brand spotlight heading.',
  trust1Title: 'Certified Authenticity',
  trust1Description: 'Every timepiece in our selection is backed by absolute serial-number credentials…',
  trust2Title: 'Insured Free Transit',
  trust2Description: 'We provide free secure shipping across Kuwait and the GCC region…',
  trust3Title: 'Concierge Assurances',
  trust3Description: 'Direct consultations on watch specifications are available 24/7 via our WhatsApp concierge line.',
};

export default function HomepageContentPage() {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/api/admin/settings');
        setForm({ ...EMPTY_FORM, ...(res.data.homepageContent || {}) });
      } catch {
        toast({ message: 'Failed to load homepage content', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function save() {
    setSaving(true);
    try {
      await axios.patch('/api/admin/settings', { homepageContent: form });
      toast({ message: 'Homepage content saved', type: 'success' });
    } catch {
      toast({ message: 'Failed to save homepage content', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell eyebrow="Merchandising" title="Homepage Content" description="Manage editorial text shown on the homepage.">
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Loading…</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      eyebrow="Merchandising"
      title="Homepage Content"
      description="Override default editorial text. Leave a field empty to use the built-in default."
      actions={
        <button onClick={save} disabled={saving} className={adminPrimaryButtonClasses}>
          <Save size={15} />
          {saving ? 'Saving…' : 'Save All'}
        </button>
      }
    >
      <div className="space-y-6">

        {/* Hero */}
        <AdminPanel
          title="Hero Section"
          description="Top of the homepage. Leave empty to use the default styled heading."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Hero Heading
              </label>
              <input
                className={adminInputClasses}
                value={form.heroHeading}
                onChange={set('heroHeading')}
                placeholder={PLACEHOLDERS.heroHeading}
                maxLength={120}
              />
              <p className="text-[11px] text-gray-600 mt-1">When set, renders as plain text (the default uses styled two-line layout).</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Hero Subheading
              </label>
              <textarea
                className={adminTextareaClasses}
                style={{ minHeight: '4.5rem' }}
                value={form.heroSubheading}
                onChange={set('heroSubheading')}
                placeholder={PLACEHOLDERS.heroSubheading}
                maxLength={300}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Primary CTA
                </label>
                <input
                  className={adminInputClasses}
                  value={form.primaryCta}
                  onChange={set('primaryCta')}
                  placeholder={PLACEHOLDERS.primaryCta}
                  maxLength={60}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Secondary CTA
                </label>
                <input
                  className={adminInputClasses}
                  value={form.secondaryCta}
                  onChange={set('secondaryCta')}
                  placeholder={PLACEHOLDERS.secondaryCta}
                  maxLength={60}
                />
              </div>
            </div>
          </div>
        </AdminPanel>

        {/* Brand Spotlight */}
        <AdminPanel
          title="Brand Spotlight Section"
          description="The 'Luxury Watch Houses' section heading and optional description."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Section Title
              </label>
              <input
                className={adminInputClasses}
                value={form.brandSpotlightTitle}
                onChange={set('brandSpotlightTitle')}
                placeholder={PLACEHOLDERS.brandSpotlightTitle}
                maxLength={120}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Section Description <span className="text-gray-600 font-normal normal-case">— shown only when set</span>
              </label>
              <textarea
                className={adminTextareaClasses}
                style={{ minHeight: '4.5rem' }}
                value={form.brandSpotlightDescription}
                onChange={set('brandSpotlightDescription')}
                placeholder={PLACEHOLDERS.brandSpotlightDescription}
                maxLength={300}
              />
            </div>
          </div>
        </AdminPanel>

        {/* Executive Collection */}
        <AdminPanel
          title="Executive Showcase"
          description="The editorial section featuring your executive/formal watch."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Section Title
              </label>
              <input
                className={adminInputClasses}
                value={form.executiveTitle}
                onChange={set('executiveTitle')}
                placeholder={PLACEHOLDERS.executiveTitle}
                maxLength={120}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Description
              </label>
              <textarea
                className={adminTextareaClasses}
                style={{ minHeight: '5rem' }}
                value={form.executiveDescription}
                onChange={set('executiveDescription')}
                placeholder={PLACEHOLDERS.executiveDescription}
                maxLength={500}
              />
            </div>
          </div>
        </AdminPanel>

        {/* Sport Collection */}
        <AdminPanel
          title="Sport Showcase"
          description="The editorial section featuring your sport/outdoor watch."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Section Title
              </label>
              <input
                className={adminInputClasses}
                value={form.sportTitle}
                onChange={set('sportTitle')}
                placeholder={PLACEHOLDERS.sportTitle}
                maxLength={120}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Description
              </label>
              <textarea
                className={adminTextareaClasses}
                style={{ minHeight: '5rem' }}
                value={form.sportDescription}
                onChange={set('sportDescription')}
                placeholder={PLACEHOLDERS.sportDescription}
                maxLength={500}
              />
            </div>
          </div>
        </AdminPanel>

        {/* Trust Section */}
        <AdminPanel
          title="Trust Section"
          description="The three trust cards shown on the homepage. Leave empty to use defaults."
        >
          <div className="space-y-6">
            {[
              { prefix: 'trust1', label: 'Trust Card 1 — Authenticity' },
              { prefix: 'trust2', label: 'Trust Card 2 — Shipping' },
              { prefix: 'trust3', label: 'Trust Card 3 — Concierge' },
            ].map(({ prefix, label }) => (
              <div key={prefix} className="space-y-3 pb-5 border-b border-white/5 last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-[#D1B23E] uppercase tracking-wider">{label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Title</label>
                    <input
                      className={adminInputClasses}
                      value={form[`${prefix}Title`]}
                      onChange={set(`${prefix}Title`)}
                      placeholder={PLACEHOLDERS[`${prefix}Title`]}
                      maxLength={80}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Description</label>
                    <input
                      className={adminInputClasses}
                      value={form[`${prefix}Description`]}
                      onChange={set(`${prefix}Description`)}
                      placeholder={PLACEHOLDERS[`${prefix}Description`]}
                      maxLength={300}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

      </div>
    </AdminShell>
  );
}
