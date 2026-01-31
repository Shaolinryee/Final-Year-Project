import React from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft, FaApple, FaSlack } from "react-icons/fa";

const SocialAuthButton = ({ provider, onClick }) => {
  const getProviderData = () => {
    switch (provider.toLowerCase()) {
      case 'google':
        return { icon: <FcGoogle className="text-lg" />, label: 'Google' };
      case 'microsoft':
        return { icon: <FaMicrosoft className="text-blue-500 text-lg" />, label: 'Microsoft' };
      case 'apple':
        return { icon: <FaApple className="text-gray-900 text-lg" />, label: 'Apple' };
      case 'slack':
        return { icon: <FaSlack className="text-lg" />, label: 'Slack' };
      default:
        return { icon: null, label: provider };
    }
  };

  const { icon, label } = getProviderData();

  return (
    <button
      onClick={onClick}
      type="button"
      className="flex items-center justify-center gap-4 w-full border border-brand-border rounded-xl py-3 px-6 mb-4 hover:bg-brand-dark/50 transition-all shadow-sm active:scale-95 group font-bold"
    >
      <span className="flex-shrink-0 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm text-text-primary group-hover:text-brand transition-colors">{label}</span>
    </button>
  );
};

export default SocialAuthButton;
