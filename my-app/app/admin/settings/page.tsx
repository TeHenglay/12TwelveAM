'use client';

import { useState } from 'react';
import { Settings, Save, Store, Mail, Globe, Lock, Bell, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    storeName: 'My Store',
    storeDescription: 'Your amazing store description',
    storeEmail: 'admin@mystore.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Main St, City, State 12345',
    currency: 'USD',
    timezone: 'America/New_York',
    emailNotifications: true,
    orderNotifications: true,
    lowStockNotifications: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    // Simulate saving settings
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your store configuration</p>
          </div>
          <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
          </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
          <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
          </button>
              );
            })}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="bg-card border border-border rounded-lg p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Store Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={settings.storeName}
                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Store Email
                      </label>
                      <input
                        type="email"
                        value={settings.storeEmail}
                        onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={settings.storePhone}
                        onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Store Description
                    </label>
                    <textarea
                      value={settings.storeDescription}
                      onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Store Address
                    </label>
                    <textarea
                      value={settings.storeAddress}
                      onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
        </div>
      </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">Order Notifications</div>
                        <div className="text-sm text-muted-foreground">Get notified about new orders</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.orderNotifications}
                          onChange={(e) => setSettings({ ...settings, orderNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">Low Stock Alerts</div>
                        <div className="text-sm text-muted-foreground">Get alerted when products are low in stock</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.lowStockNotifications}
                          onChange={(e) => setSettings({ ...settings, lowStockNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Payment Settings</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">Stripe</div>
                          <div className="text-sm text-muted-foreground">Accept credit card payments</div>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                          Connected
                        </span>
                      </div>
                    </div>
                    <div className="p-4 border border-border rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">PayPal</div>
                          <div className="text-sm text-muted-foreground">Accept PayPal payments</div>
                        </div>
                        <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-accent">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">Maintenance Mode</div>
                        <div className="text-sm text-muted-foreground">Temporarily disable the store</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <button className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                        Change Password
          </button>
        </div>
                  </div>
                </div>
              </div>
            )}
        </div>
        </div>
      </div>
    </div>
  );
}