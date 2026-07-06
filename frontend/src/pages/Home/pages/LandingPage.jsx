import React from 'react';
import { Navbar } from '../components/Navbar.jsx';
import { Hero } from '../components/Hero.jsx';
import { Stats } from '../components/Stats.jsx';
import { Features } from '../components/Features.jsx';
import { Categories } from '../components/Categories.jsx';
import { Faq } from '../components/Faq.jsx';
import { Footer } from '../components/Footer.jsx';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Categories />
      <Faq />
      <Footer />
    </div>
  );
};
