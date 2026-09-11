import { Joyride, STATUS } from 'react-joyride';

export const adminTourSteps = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome to Swasthika Floral Decor CMS!',
    content:
      'This guided tour will quickly introduce you to the key features of your florist admin panel, including category management, batch photo uploads, slider controls, and business information settings.',
    disableBeacon: true,
  },
  {
    target: '#tour-kpi-stats',
    title: 'Real-Time Metrics & Overview',
    content:
      'Monitor your active decoration categories, total optimized WebP photos, and images currently featured in the homepage slider.',
  },
  {
    target: '#tour-btn-batch-upload',
    title: 'Fast Batch Photo Upload',
    content:
      'Upload multiple decoration photos at once! Images are automatically converted to lightweight WebP format and saved to Cloudinary. You can also pick individual photos to show in the homepage slider.',
  },
  {
    target: '#tour-btn-new-category',
    title: 'Category Management',
    content:
      'Create and manage your decoration categories (Primary, Secondary, Other) with dedicated cover thumbnails and descriptions.',
  },
  {
    target: '#tour-nav-categories',
    title: 'Categories Section',
    content:
      'View, edit, or delete existing categories. You can also directly upload photos associated with any category.',
  },
  {
    target: '#tour-nav-gallery',
    title: 'Decoration Photo Gallery',
    content:
      'Browse all uploaded photos with smooth lazy loading and pagination. Easily toggle slider visibility, edit titles, update venues, or delete images.',
  },
  {
    target: '#tour-nav-settings',
    title: 'Business & Contact Details',
    content:
      'Update your business phone numbers, WhatsApp number, workshop address, and email. Changes update live across the public website header, footer, and inquiry buttons.',
  },
  {
    target: '#tour-admin-profile',
    title: 'Admin Account & Password',
    content:
      'Manage your administrative access credentials and change your password whenever needed.',
  },
];

export const AdminTour = ({ run, onFinish }) => {
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      if (onFinish) {
        onFinish();
      }
    }
  };

  return (
    <Joyride
      steps={adminTourSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        last: 'Got It!',
        skip: 'Skip Tour',
        next: 'Next',
        back: 'Back',
      }}
      styles={{
        options: {
          primaryColor: '#9E7244',
          textColor: '#1C1917',
          backgroundColor: '#FFFFFF',
          overlayColor: 'rgba(28, 25, 23, 0.55)',
          arrowColor: '#FFFFFF',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '16px',
          padding: '20px 22px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E7E5E4',
          fontFamily: 'inherit',
        },
        tooltipTitle: {
          fontSize: '15px',
          fontWeight: 700,
          color: '#1C1917',
          marginBottom: '8px',
        },
        tooltipContent: {
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#57534E',
        },
        buttonNext: {
          backgroundColor: '#9E7244',
          borderRadius: '10px',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        buttonBack: {
          color: '#78716C',
          marginRight: '12px',
          fontSize: '12px',
          fontWeight: 500,
        },
        buttonSkip: {
          color: '#A8A29E',
          fontSize: '12px',
        },
      }}
    />
  );
};
