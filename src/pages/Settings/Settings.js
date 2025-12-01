import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { settingsAPI } from '../../api/settings';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';

const Settings = () => {
  const { t } = useTranslation();
  const { mode, setMode, primaryColor, setPrimaryColor } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [driveStatus, setDriveStatus] = useState(null);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [googleDriveConfig, setGoogleDriveConfig] = useState({
    type: 'service_account',
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    refreshToken: '',
    serviceAccountEmail: '',
    privateKey: '',
  });

  useEffect(() => {
    fetchDriveStatus();
  }, []);

  const fetchDriveStatus = async () => {
    try {
      const response = await settingsAPI.getGoogleDriveStatus();
      setDriveStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch Drive status:', error);
    }
  };

  const handleThemeChange = async () => {
    try {
      await settingsAPI.updateTheme({
        primaryColor,
        mode,
      });
      toast.success('Theme settings saved');
    } catch (error) {
      toast.error('Failed to save theme settings');
    }
  };

  const handleDriveConfig = async () => {
    setLoadingDrive(true);
    try {
      const credentials =
        googleDriveConfig.type === 'service_account'
          ? {
              client_email: googleDriveConfig.serviceAccountEmail,
              private_key: googleDriveConfig.privateKey,
            }
          : {
              client_id: googleDriveConfig.clientId,
              client_secret: googleDriveConfig.clientSecret,
              redirect_uri: googleDriveConfig.redirectUri,
              refresh_token: googleDriveConfig.refreshToken,
            };

      await settingsAPI.initializeGoogleDrive(googleDriveConfig.type, credentials);
      toast.success('Google Drive connected successfully');
      fetchDriveStatus();
    } catch (error) {
      toast.error('Failed to connect Google Drive');
    } finally {
      setLoadingDrive(false);
    }
  };

  const colorPresets = [
    { label: 'Blue', value: '#2563eb' },
    { label: 'Green', value: '#10b981' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Orange', value: '#f97316' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('settings.title')}</h1>

      {/* Language Settings */}
      <Card title={t('settings.language')}>
        <div className="space-y-4">
          <Select
            label="Default Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'ar', label: 'العربية (Arabic)' },
            ]}
          />
          <p className="text-sm text-gray-600">
            This will set the default language for the application interface.
          </p>
        </div>
      </Card>

      {/* Theme Settings */}
      <Card title={t('settings.theme')}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('settings.mode')}
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setMode('light')}
                className={`flex-1 py-3 px-4 border-2 rounded-lg transition-colors ${
                  mode === 'light'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">☀️</div>
                  <div className="text-sm font-medium">{t('settings.light')}</div>
                </div>
              </button>
              <button
                onClick={() => setMode('dark')}
                className={`flex-1 py-3 px-4 border-2 rounded-lg transition-colors ${
                  mode === 'dark'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🌙</div>
                  <div className="text-sm font-medium">{t('settings.dark')}</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('settings.primaryColor')}
            </label>
            <div className="grid grid-cols-5 gap-3">
              {colorPresets.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setPrimaryColor(color.value)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    primaryColor === color.value ? 'border-gray-900 scale-105' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <Input
              label="Custom Color (Hex)"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="mt-3"
            />
          </div>

          <Button onClick={handleThemeChange}>Save Theme Settings</Button>
        </div>
      </Card>

      {/* Google Drive Integration */}
      <Card title={t('settings.googleDrive')}>
        <div className="space-y-4">
          {driveStatus && (
            <div
              className={`p-4 rounded-lg ${
                driveStatus.connected ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    driveStatus.connected ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className="font-medium">
                  {driveStatus.connected ? t('settings.connected') : t('settings.notConnected')}
                </span>
              </div>
            </div>
          )}

          <Select
            label="Authentication Type"
            value={googleDriveConfig.type}
            onChange={(e) => setGoogleDriveConfig({ ...googleDriveConfig, type: e.target.value })}
            options={[
              { value: 'service_account', label: 'Service Account (Recommended)' },
              { value: 'oauth', label: 'OAuth 2.0' },
            ]}
          />

          {googleDriveConfig.type === 'service_account' ? (
            <>
              <Input
                label="Service Account Email"
                value={googleDriveConfig.serviceAccountEmail}
                onChange={(e) =>
                  setGoogleDriveConfig({
                    ...googleDriveConfig,
                    serviceAccountEmail: e.target.value,
                  })
                }
                placeholder="your-service-account@project.iam.gserviceaccount.com"
              />
              <Textarea
                label="Private Key"
                value={googleDriveConfig.privateKey}
                onChange={(e) =>
                  setGoogleDriveConfig({ ...googleDriveConfig, privateKey: e.target.value })
                }
                rows={5}
                placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
              />
            </>
          ) : (
            <>
              <Input
                label="Client ID"
                value={googleDriveConfig.clientId}
                onChange={(e) =>
                  setGoogleDriveConfig({ ...googleDriveConfig, clientId: e.target.value })
                }
              />
              <Input
                label="Client Secret"
                value={googleDriveConfig.clientSecret}
                onChange={(e) =>
                  setGoogleDriveConfig({ ...googleDriveConfig, clientSecret: e.target.value })
                }
              />
              <Input
                label="Redirect URI"
                value={googleDriveConfig.redirectUri}
                onChange={(e) =>
                  setGoogleDriveConfig({ ...googleDriveConfig, redirectUri: e.target.value })
                }
              />
              <Input
                label="Refresh Token"
                value={googleDriveConfig.refreshToken}
                onChange={(e) =>
                  setGoogleDriveConfig({ ...googleDriveConfig, refreshToken: e.target.value })
                }
              />
            </>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Setup Instructions:</strong>
              <br />
              1. Go to Google Cloud Console
              <br />
              2. Create a project and enable Google Drive API
              <br />
              3. Create {googleDriveConfig.type === 'service_account' ? 'Service Account' : 'OAuth 2.0'}{' '}
              credentials
              <br />
              4. Copy the credentials here
            </p>
          </div>

          <Button onClick={handleDriveConfig} loading={loadingDrive}>
            {t('settings.connect')} Google Drive
          </Button>
        </div>
      </Card>

      {/* System Information */}
      <Card title="System Information">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Application Name</span>
            <span className="text-sm font-medium">Wells Management System</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Current Language</span>
            <span className="text-sm font-medium">{language === 'en' ? 'English' : 'Arabic'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;

