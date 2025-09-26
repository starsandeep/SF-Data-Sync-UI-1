import React from 'react';
import { Header } from './Header';
import { TabNavigation } from '../navigation/TabNavigation';

interface LandingPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const LandingPageLayout: React.FC<LandingPageLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  return (
    <div className="landing-page-layout">
      <Header title={title} subtitle={subtitle} />

      <nav className="main-navigation" aria-label="Main application navigation">
        <TabNavigation />
      </nav>

      <main className="tab-content-area" role="tabpanel">
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LandingPageLayout;