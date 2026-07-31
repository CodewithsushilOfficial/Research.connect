import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Bell, Lock, Shield, Link2, AlertTriangle, Save, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import GeneralSettings from '../components/GeneralSettings';
import NotificationSettings from '../components/NotificationSettings';
import PrivacySettings from '../components/PrivacySettings';
import SecuritySettings from '../components/SecuritySettings';
import ConnectedAccountsSettings from '../components/ConnectedAccountsSettings';
import DangerZoneSettings from '../components/DangerZoneSettings';

const SettingsPage = ({ profile, refetch, isOwnProfile }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [saveTrigger, setSaveTrigger] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const mapUrlToId = (tabName) => {
    if (tabName === 'connected-accounts') return 'connected';
    if (tabName === 'danger-zone') return 'danger';
    return tabName;
  };

  const mapIdToUrl = (id) => {
    if (id === 'connected') return 'connected-accounts';
    if (id === 'danger') return 'danger-zone';
    return id;
  };

  const validTabIds = ['general', 'notifications', 'privacy', 'security', 'connected', 'danger'];
  const rawTab = searchParams.get('tab');
  const activeTab = validTabIds.includes(mapUrlToId(rawTab)) ? mapUrlToId(rawTab) : 'general';

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: mapIdToUrl(tabId) });
    setShowFilterDrawer(false);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: User, component: GeneralSettings },
    { id: 'notifications', name: 'Notifications', icon: Bell, component: NotificationSettings },
    { id: 'privacy', name: 'Privacy', icon: Lock, component: PrivacySettings },
    { id: 'security', name: 'Security', icon: Shield, component: SecuritySettings },
    { id: 'connected', name: 'Connected Accounts', icon: Link2, component: ConnectedAccountsSettings },
    { id: 'danger', name: 'Danger Zone', icon: AlertTriangle, component: DangerZoneSettings }
  ];

  const activeTabItem = tabs.find((t) => t.id === activeTab);
  const ActiveComponent = activeTabItem ? activeTabItem.component : GeneralSettings;

  if (isOwnProfile === false) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4">
        <div className="p-4 bg-amber-50 text-accent-orange rounded-full w-fit mx-auto border border-amber-100">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-text-primary tracking-tight font-display">Access Restricted</h3>
        <p className="text-xs text-text-secondary leading-relaxed font-semibold">
          You do not have permission to view or modify this researcher's account configuration settings.
        </p>
      </div>
    );
  }

  const handleHeaderSave = () => {
    if (saveTrigger) {
      saveTrigger();
    }
  };

  const showFooterSave = activeTab === 'general';
  const ActiveIcon = activeTabItem ? activeTabItem.icon : User;

  const renderTabNav = (extraClassName = '') => (
    <nav className={extraClassName}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isSelected = activeTab === tab.id;
        const isDanger = tab.id === 'danger';

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3.5 py-3 md:py-2.5 rounded-2xl md:rounded-xl text-sm md:text-xs font-extrabold transition-all cursor-pointer ${
              isDanger
                ? `mt-1 border-t border-slate-100 pt-3.5 md:pt-3 ${isSelected ? 'bg-red-50 text-accent-red' : 'text-accent-red/80 hover:bg-red-50'}`
                : isSelected
                  ? 'bg-blue-50 text-primary'
                  : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-4.5 h-4.5 md:w-4 md:h-4 flex-shrink-0 ${isDanger ? 'text-accent-red' : isSelected ? 'text-primary' : 'text-slate-400'}`} />
            <span>{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      {/* Header Row */}
      <div className="space-y-0.5">
        <h1 className="text-xl font-black text-text-primary tracking-tight font-display">Settings</h1>
        <p className="text-[11px] font-semibold text-text-secondary">
          Manage your account preferences and visibility configurations.
        </p>
      </div>

      {/* Filter trigger button + active section badge, kept separate */}
      <div className="flex items-center gap-2 md:gap-2 lg:gap-3 relative z-20">
        <div className="relative">
          <button
            onClick={() => setShowFilterDrawer((prev) => !prev)}
            aria-expanded={showFilterDrawer}
            className={`flex items-center gap-2.5 md:gap-2 px-4 md:px-3.5 py-2.5 md:py-2 rounded-xl md:rounded-xl text-[11px] md:text-xs font-bold transition-all cursor-pointer border active:scale-95 whitespace-nowrap ${
              showFilterDrawer
                ? 'bg-primary border-primary text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 border-transparent hover:bg-slate-200 text-slate-700'
            }`}
            title="Settings menu"
          >
            <SlidersHorizontal className={`w-3 h-3 md:w-3.5 md:h-3.5 ${showFilterDrawer ? 'text-white' : 'text-primary'}`} />
            <span>Settings Menu</span>
            <ChevronDown className={`w-2.5 h-2.5 md:w-3 md:h-3 transition-transform ${showFilterDrawer ? 'rotate-180 text-white' : 'text-slate-400'}`} />
          </button>

          {/* Desktop/tablet: compact dropdown anchored right under the button */}
          {showFilterDrawer && (
            <>
              <div className="hidden md:block fixed inset-0 z-40" onClick={() => setShowFilterDrawer(false)} />
              <div className="hidden md:flex absolute left-0 top-full mt-2 w-72 z-50 flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[70vh] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
                  <h2 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                    <span>Settings Sections</span>
                  </h2>
                  <button
                    onClick={() => setShowFilterDrawer(false)}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
                {renderTabNav('flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1')}
              </div>
            </>
          )}
        </div>

        <div className={`flex items-center gap-2.5 px-4 md:px-3 py-2.5 md:py-2 rounded-xl md:rounded-xl text-[11px] md:text-xs font-extrabold whitespace-nowrap truncate max-w-[55%] ${
          activeTab === 'danger' ? 'bg-red-50 text-accent-red' : 'bg-blue-50 text-primary'
        }`}>
          {ActiveIcon && <ActiveIcon className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />}
          <span className="truncate">{activeTabItem?.name || 'General'}</span>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      {showFilterDrawer && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end"
          onClick={() => setShowFilterDrawer(false)}
        >
          <div className="absolute inset-0 bg-black/30 animate-in fade-in duration-150" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-h-[75vh] bg-white rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200"
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto my-2.5 shrink-0" />
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 shrink-0">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>Settings Sections</span>
              </h2>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            {renderTabNav('flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-1')}
          </div>
        </div>
      )}

      {/* Active section content */}
      <div>
        <ActiveComponent
          profile={profile}
          refetch={refetch}
          setSaveTrigger={setSaveTrigger}
          setIsSubmittingParent={setIsSubmitting}
        />
      </div>

      {/* Save Changes — now at the bottom */}
      {showFooterSave && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleHeaderSave}
            disabled={isSubmitting}
            className={`inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2.5 text-[11px] md:text-xs font-bold text-white rounded-md md:rounded-lg shadow-sm transition-all duration-200 active:scale-95 ${
              isSubmitting
                ? 'bg-primary/50 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover shadow-primary/10'
            }`}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-3 w-3 md:h-3.5 md:w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Save className="w-3 h-3 md:w-3.5 md:h-3.5" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;