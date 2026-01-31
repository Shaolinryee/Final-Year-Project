import React from 'react';
import MainLayout from '../../layout/MainLayout';
import Pricing from './components/Pricing';
import JoinBeta from './components/JoinBeta';

const PricingPage = () => {
  return (
    <MainLayout>
      <div className="bg-brand-dark pt-20 transition-colors duration-300">
        <Pricing />
        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default PricingPage;
