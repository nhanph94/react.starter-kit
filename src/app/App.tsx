import { appConfig } from '@/configs/app';

export default function App() {
  return <h1 className="text-2xl font-bold">{appConfig.title}</h1>;
}
