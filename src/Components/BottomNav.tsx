import {useLocation, useNavigate} from 'react-router-dom';
import {Cog8ToothIcon, HomeIcon, QrCodeIcon} from '@heroicons/react/20/solid';

export default function BottomNav() {
  return (
    <div
      className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-gray-50
                 bg-gray-200/60 dark:border-gray-800 dark:bg-gray-700"
    >
      <div className="mx-auto grid h-full max-w-lg grid-cols-3 font-medium">
        <HomeButton />
        <ScanButton />
        <SettingsButton />
      </div>
    </div>
  );
}

function HomeButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      style={{
        borderTopRightRadius: '10% 70%',
        borderBottomRightRadius: '10% 70%',
      }}
      className="group inline-flex flex-col items-center justify-center px-5
                 transition-all active:bg-gray-200 dark:active:bg-gray-800"
    >
      <HomeIcon
        className="mb-1 h-6 w-6 text-gray-600 transition-all group-active:text-blue-600
                   dark:text-gray-400 dark:group-active:text-blue-500"
      />
      <span
        className="text-sm text-gray-600 transition-all group-active:text-blue-600
                   dark:text-gray-400 dark:group-active:text-blue-500"
      >
        Home
      </span>
    </button>
  );
}

function ScanButton() {
  const {pathname} = useLocation();
  const navigate = useNavigate();

  const goToScan = () => {
    if (pathname === '/scan') {
      return;
    } else if (pathname === '/settings') {
      navigate('/scan', {replace: true});
    } else {
      navigate('/scan');
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center justify-center px-5">
      <button
        type="button"
        aria-label="Scan"
        onClick={goToScan}
        className="group absolute top-[-50%] rounded-full bg-gray-50 p-1 text-white dark:bg-[#061b3c]"
      >
        <QrCodeIcon
          className="h-6 min-h-[3rem] w-6 min-w-[3rem] rounded-full
                     bg-blue-600 p-2 transition-all active:bg-blue-700"
        />
      </button>
      <span
        className="mt-7 text-sm text-gray-600 group-hover:text-blue-600
                   dark:text-gray-400 dark:group-hover:text-blue-500"
      >
        Scan
      </span>
    </div>
  );
}

function SettingsButton() {
  const {pathname} = useLocation();
  const navigate = useNavigate();

  const goToSettings = () => {
    if (pathname === '/settings') {
      return;
    }
    if (document.startViewTransition) {
      document.startViewTransition(() => navigate('/settings'));
    } else {
      navigate('/settings');
    }
  };

  return (
    <button
      type="button"
      onClick={goToSettings}
      style={{
        borderTopLeftRadius: '10% 70%',
        borderBottomLeftRadius: '10% 70%',
      }}
      className="group inline-flex flex-col items-center justify-center
                 px-5 active:bg-gray-200 dark:active:bg-gray-800"
    >
      <Cog8ToothIcon
        className="mb-1 h-6 w-6 text-gray-600 transition-all group-active:text-blue-600
                   dark:text-gray-400 dark:group-active:text-blue-500"
      />
      <span
        className="text-sm text-gray-600 transition-all group-active:text-blue-600
                   dark:text-gray-400 dark:group-active:text-blue-500"
      >
        Settings
      </span>
    </button>
  );
}
