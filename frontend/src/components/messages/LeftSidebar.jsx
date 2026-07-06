import { LayoutDashboard, User, BookOpen, FolderOpen, Users, MessageSquare, Plus, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard',    path: '/' },
  { id: 'profile',      icon: User,             label: 'Profile',      path: '/profile' },
  { id: 'publications', icon: BookOpen,         label: 'Publications', path: '/publications' },
  { id: 'projects',     icon: FolderOpen,       label: 'Projects',     path: '/projects' },
  { id: 'communities',  icon: Users,            label: 'Communities',  path: '/network' },
  { id: 'messages',     icon: MessageSquare,    label: 'Messages',     path: '/messages' },
  { id: 'notifications',icon: Bell,             label: 'Notifications',path: '/notifications'}
];

export default function LeftSidebar() {
  const navigate = useNavigate();
  return (
    <aside className="w-64 flex-shrink-0 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col h-full py-4">
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item, i) => {
          const isActive = item.id === 'messages'; // Assuming we are on messages page
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`anim-nav-item nav-item-hover flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                ${isActive
                  ? 'bg-[#DBEAFE] text-[#2563EB] font-bold border-l-4 border-[#2563EB]'
                  : 'text-[#475569] hover:bg-[#DBEAFE] hover:text-[#2563EB]'
                }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Icon
                size={18}
                className={`nav-icon flex-shrink-0 ${isActive ? 'text-[#2563EB]' : ''}`}
              />
              <span className="text-sm">{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Upload button */}
      <div className="px-3 mt-auto">
        <button className="upload-btn w-full py-3 px-4 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md">
          <Plus size={18} />
          Upload Publication
        </button>
      </div>
    </aside>
  );
}
