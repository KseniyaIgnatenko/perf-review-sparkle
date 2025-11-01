import { NavLink, useLocation } from "react-router-dom";
import { Users, ClipboardCheck, Target, FileText, Star, MessageSquare, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const managerItems = [
  { title: "Обзор команды", url: "/manager", icon: Users },
];

const personalItems = [
  { title: "Дашборд", url: "/dashboard", icon: Home },
  { title: "Мои цели", url: "/goals", icon: Target },
  { title: "Самооценка", url: "/self-assessment", icon: FileText },
  { title: "Оценка коллег", url: "/peer-review", icon: Star },
  { title: "Профиль", url: "/profile", icon: MessageSquare },
];

export function ManagerSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/manager") {
      return currentPath === "/manager" || currentPath.startsWith("/manager/");
    }
    return currentPath === path;
  };

  const getNavCls = (active: boolean) =>
    active 
      ? "bg-primary/10 text-primary font-medium hover:bg-primary/20" 
      : "hover:bg-muted/50";

  return (
    <Sidebar
      className={open ? "w-60" : "w-14"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Manager Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Управление</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Personal Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Личное</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {personalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={getNavCls(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
