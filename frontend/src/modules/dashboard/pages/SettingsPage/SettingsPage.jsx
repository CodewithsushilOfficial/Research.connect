import React from 'react';
import Button from '../../../../components/common/buttons/Button';

const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Update your account, notification, and privacy preferences from one place.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Account Settings</h2>
          <div className="space-y-4 text-sm text-text-secondary">
            <div>
              <p className="font-semibold text-text-primary">Email</p>
              <p className="mt-1">Your registered email address is used for sign in and notifications.</p>
            </div>
            <div>
              <p className="font-semibold text-text-primary">Password</p>
              <p className="mt-1">You can change your password to keep your account secure.</p>
            </div>
            <Button type="button" variant="outline">
              Manage Account Preferences
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Privacy & Notifications</h2>
          <div className="space-y-4 text-sm text-text-secondary">
            <div>
              <p className="font-semibold text-text-primary">Visibility</p>
              <p className="mt-1">Control whether your research and profile are visible to others.</p>
            </div>
            <div>
              <p className="font-semibold text-text-primary">Email Alerts</p>
              <p className="mt-1">Choose which research updates and alerts you want to receive.</p>
            </div>
            <Button type="button" variant="outline">
              Open Privacy Settings
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
