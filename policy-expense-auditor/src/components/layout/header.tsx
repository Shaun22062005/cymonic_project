import Sidebar from './sidebar';

export default function Header() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-8">
      <div className="text-sm font-medium text-slate-500">Workspace / Dashboard</div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-slate-200" />
      </div>
    </header>
  );
}
