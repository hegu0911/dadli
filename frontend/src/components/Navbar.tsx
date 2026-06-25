import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HomeIcon, SearchIcon, PlusIcon, MessageIcon, ProfileIcon, HomeFilledIcon, SearchFilledIcon, ProfileFilledIcon, HeartIcon } from "./Icons";

const tabs = [
  { path: "/", label: "Ana səhifə", icon: HomeIcon, activeIcon: HomeFilledIcon },
  { path: "/explore", label: "Kəşf", icon: SearchIcon, activeIcon: SearchFilledIcon },
  { path: "/create", label: "", icon: null, activeIcon: null, isCreate: true },
  { path: "/notifications", label: "Bildiriş", icon: HeartIcon, activeIcon: HeartIcon },
  { path: "/profile", label: "Profil", icon: ProfileIcon, activeIcon: ProfileFilledIcon, isDynamic: true },
];

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.isDynamic) return location.pathname.startsWith("/profile");
    return location.pathname === tab.path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          if (tab.isCreate) {
            return (
              <Link key={tab.path} to={tab.path}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-rose-700 text-white flex items-center justify-center hover:from-rose-700 hover:to-rose-800 active:scale-90 transition-all shadow-lg shadow-primary/30">
                <PlusIcon size={22} />
              </Link>
            );
          }
          const active = isActive(tab);
          const Icon = (active ? tab.activeIcon : tab.icon)!;
          return (
            <Link key={tab.path}
              to={tab.isDynamic ? `/profile/${user?.username || ""}` : tab.path}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${active ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
              <Icon size={22} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
