import React, { useState } from 'react';
import { Key, Shield, Eye, EyeOff, Smartphone, Check, X, AlertTriangle } from 'lucide-react';
import { profileApi } from '../../services/adminApi';
import { toast } from 'react-toastify';

const SecurityTab = ({ profileData, onProfileUpdate }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [settingUp2FA, setSettingUp2FA] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await profileApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data?.success) {
        toast.success('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setSettingUp2FA(true);
      const response = await profileApi.enable2FA();
      
      if (response.data?.success) {
        setTwoFASecret(response.data.data.secret);
        setQrCode(response.data.data.qrCode);
      }
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      toast.error('Failed to enable 2FA');
    } finally {
      setSettingUp2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFAToken || twoFAToken.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      const response = await profileApi.verify2FASetup({
        token: twoFAToken,
        secret: twoFASecret
      });

      if (response.data?.success) {
        toast.success('2FA enabled successfully');
        setTwoFAEnabled(true);
        setTwoFASecret(null);
        setQrCode(null);
        setTwoFAToken('');
      }
    } catch (error) {
      console.error('Failed to verify 2FA setup:', error);
      toast.error(error.response?.data?.message || 'Invalid verification code');
    }
  };

  const handleCancel2FASetup = () => {
    setTwoFASecret(null);
    setQrCode(null);
    setTwoFAToken('');
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { strength: 0, text: 'Very Weak', color: 'red' },
      { strength: 1, text: 'Weak', color: 'orange' },
      { strength: 2, text: 'Fair', color: 'yellow' },
      { strength: 3, text: 'Good', color: 'blue' },
      { strength: 4, text: 'Strong', color: 'green' },
      { strength: 5, text: 'Very Strong', color: 'green' }
    ];

    return levels[strength] || levels[0];
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Key className="w-5 h-5 mr-2 text-blue-600" />
          Change Password
        </h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordForm.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password Strength</span>
                  <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${passwordStrength.color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {changingPassword ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Key className="w-4 h-4" />
            )}
            <span>{changingPassword ? 'Changing Password...' : 'Change Password'}</span>
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
          Two-Factor Authentication
        </h3>

        {!twoFAEnabled && !twoFASecret && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Enhance Your Security</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Enable two-factor authentication to add an extra layer of security to your account.
                </p>
                <button
                  onClick={handleEnable2FA}
                  disabled={settingUp2FA}
                  className="mt-3 flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {settingUp2FA ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  <span>{settingUp2FA ? 'Setting up...' : 'Enable 2FA'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {twoFASecret && qrCode && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Setup Two-Factor Authentication</h4>
              
              <div className="text-center mb-4">
                {qrCode && (
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-blue-700 mb-2">Or enter this code manually:</p>
                <code className="text-xs bg-white px-2 py-1 rounded border border-blue-300">
                  {twoFASecret}
                </code>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Enter 6-digit verification code
                </label>
                <input
                  type="text"
                  value={twoFAToken}
                  onChange={(e) => setTwoFAToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleVerify2FA}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify & Enable</span>
                </button>
                <button
                  onClick={handleCancel2FASetup}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {twoFAEnabled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="text-sm font-medium text-green-800">2FA is Enabled</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your account is protected with two-factor authentication.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Tips</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Use a strong, unique password that you don't use anywhere else</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Enable two-factor authentication for maximum security</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Regularly review your active sessions and log out from unknown devices</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Never share your password or 2FA codes with anyone</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
