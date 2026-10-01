import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';

import { Metadata, ThemeToggle } from '@/app/common/components';
import { useGlobalStore } from '@/app/common/hooks';
import { appConfig } from '@/configs/app';
import { ModalContainer } from '@/libs/react/modal';
import Logo from '@/resources/icons/logo.svg?react';

export default function App() {
  const theme = useGlobalStore((state) => state.theme);

  useEffect(() => {
    // Treat a value persisted by an older template version (`dark`) as `night`.
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'night';
  }, [theme]);

  return (
    <>
      <Metadata metadata={{ description: appConfig.description }} />

      <div className="flex items-center gap-2">
        <Logo className="h-6 w-6" role="img" aria-label={`${appConfig.title} logo`} />
        <h1 className="text-2xl font-bold">{appConfig.title}</h1>
        <ThemeToggle />
      </div>

      <ModalContainer />
      <ToastContainer position="bottom-right" stacked />
    </>
  );
}
