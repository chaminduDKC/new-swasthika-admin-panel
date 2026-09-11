import React, { createContext, useContext, useState } from 'react';

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
  const [isTourRunning, setIsTourRunning] = useState(false);

  const startTour = () => {
    setIsTourRunning(true);
  };

  const stopTour = () => {
    setIsTourRunning(false);
  };

  return (
    <TourContext.Provider value={{ isTourRunning, startTour, stopTour }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
