import { Metadata } from '@/app/common/components';
import { appConfig } from '@/configs/app';
import Logo from '@/resources/icons/logo.svg?react';

export default function App() {
  return (
    <>
      <Metadata metadata={{ description: appConfig.description }} />

      <div className="flex items-center gap-2">
        <Logo className="h-6 w-6" role="img" aria-label={`${appConfig.title} logo`} />
        <h1 className="text-2xl font-bold">{appConfig.title}</h1>
      </div>
    </>
  );
}
