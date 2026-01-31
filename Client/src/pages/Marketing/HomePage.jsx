import React from "react";
import MainLayout from "../../layout/MainLayout";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import Benefits from "./components/Benefits";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";
import Story from "./components/Story";
import FAQs from "./components/FAQs";
import Proof from "./components/Proof";
import MoveFaster from "./components/MoveFaster";
import SeeInAction from "./components/SeeInAction";
import JoinBeta from "./components/JoinBeta";

const HomePage = () => {
  return (
    <MainLayout>
      <main className="min-h-screen">
        <HeroSection/>
        <FeatureSection/>
        <Benefits/>
        <Proof/>
        <Testimonials/>
        <Pricing/>
        <MoveFaster/>
       <SeeInAction/>
        <FAQs/>
         <CTA/>
       <JoinBeta/>

          <Story/>
      </main>
    </MainLayout>
  );
};

export default HomePage;
