"use client"
import {
  Bot,
  Calculator,
  TrendingUp,
  Building2,
  BarChart3,
  MessageSquare,
  Plus,
  Trash2,
  Search,
  DollarSign,
  User,
  LogOut,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ChatHistoryItem, User as UserType } from "@/lib/portfolio-types"

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  onNewChat: () => void
  chatHistory: ChatHistoryItem[]
  currentChatId: string | null
  onChatSelect: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  user: UserType | null
  onSignOut: () => void
}

const navigationItems = [
  {
    title: "Dashboard",
    url: "chat",
    icon: BarChart3,
    description: "Overview & Tools",
    requiresAuth: false,
  },
  {
    title: "AI Chat",
    url: "home",
    icon: Bot,
    description: "Chat Assistant",
    requiresAuth: true,
  },
  {
    title: "Deal Finder",
    url: "deal-finder",
    icon: Search,
    description: "Find Properties",
    requiresAuth: false,
  },
  {
    title: "Calculator",
    url: "calculator",
    icon: Calculator,
    description: "Investment Calculator",
    requiresAuth: false,
  },
  {
    title: "Market Insights",
    url: "insights",
    icon: TrendingUp,
    description: "Market Analysis",
    requiresAuth: false,
  },
  {
    title: "Property Analysis",
    url: "property-analysis",
    icon: Building2,
    description: "Property Reports",
    requiresAuth: false,
  },
  {
    title: "Price Predictor",
    url: "price-predictor",
    icon: TrendingUp,
    description: "AI Price Predictions",
    requiresAuth: false,
  },
  {
    title: "Portfolio Tracker",
    url: "portfolio-tracker",
    icon: DollarSign,
    description: "Track Investments",
    requiresAuth: false,
  },
]

export function AppSidebar({
  activeView,
  onViewChange,
  onNewChat,
  chatHistory,
  currentChatId,
  onChatSelect,
  onDeleteChat,
  user,
  onSignOut,
}: AppSidebarProps) {
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">MSASCOUT</h2>
            <p className="text-xs text-gray-600">AI Property Agent</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.url)}
                    isActive={activeView === item.url}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat History - Only show if user is authenticated */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Chat History</span>
            <Button size="sm" variant="ghost" onClick={onNewChat} className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[300px]">
              <SidebarMenu>
                {!user ? (
                  <div className="px-2 py-4 text-center text-sm text-gray-500">Sign in to view chat history</div>
                ) : chatHistory.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-gray-500">
                    No chat history yet.
                    <br />
                    Start a conversation!
                  </div>
                ) : (
                  chatHistory.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <div className="group flex items-center gap-2 w-full">
                        <SidebarMenuButton
                          onClick={() => onChatSelect(chat.id)}
                          isActive={currentChatId === chat.id}
                          className="flex-1 justify-start"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="truncate">{chat.title}</span>
                        </SidebarMenuButton>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteChat(chat.id)
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="px-6 pb-1">
                        <p className="text-xs text-gray-500">
                          {chat.messages?.length || 0} messages • {new Date(chat.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* User Profile - Show different content based on auth status */}
        <div className="p-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                        {getUserInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {user.company && <p className="text-xs text-gray-500">{user.company}</p>}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewChange("profile-settings")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange("preferences")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="text-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mb-2">Not signed in</p>
              <p className="text-xs text-gray-400">Sign in for chat access</p>
            </div>
          )}
        </div>

        <div className="p-2">
          <div className="text-xs text-gray-500 text-center">
            <p>MSASCOUT v2.0</p>
            <p>AI-Powered Property Investment</p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
