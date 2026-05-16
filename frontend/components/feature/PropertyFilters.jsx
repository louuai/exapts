'use client';
import { Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function PropertyFilters({ filters, setFilters, facets }) {
  const { t } = useI18n();

  const update = (k, v) => setFilters((s) => ({ ...s, [k]: v || undefined }));

  return (
    <div className="rounded-2xl bg-white border border-ink-100 shadow-soft p-3 lg:p-4">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-3">
        {/* Search */}
        <div className="col-span-2 lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="search"
            value={filters.q || ''}
            onChange={(e) => update('q', e.target.value)}
            placeholder={t('properties.search') + '…'}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
          />
        </div>

        <select
          value={filters.region || ''}
          onChange={(e) => update('region', e.target.value)}
          className="h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        >
          <option value="">{t('properties.filters.region')}</option>
          {facets?.regions?.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          value={filters.type || ''}
          onChange={(e) => update('type', e.target.value)}
          className="h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        >
          <option value="">{t('properties.filters.allTypes')}</option>
          {facets?.types?.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
        </select>

        <select
          value={filters.transaction || ''}
          onChange={(e) => update('transaction', e.target.value)}
          className="h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        >
          <option value="">{t('properties.filters.transaction')}</option>
          <option value="sale">{t('properties.filters.sale')}</option>
          <option value="rent">{t('properties.filters.rent')}</option>
        </select>

        <select
          value={filters.sort || ''}
          onChange={(e) => update('sort', e.target.value)}
          className="h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        >
          <option value="">{t('properties.filters.sort.recent')}</option>
          <option value="price-asc">{t('properties.filters.sort.priceAsc')}</option>
          <option value="price-desc">{t('properties.filters.sort.priceDesc')}</option>
          <option value="surface-desc">{t('properties.filters.sort.surface')}</option>
        </select>
      </div>
    </div>
  );
}
