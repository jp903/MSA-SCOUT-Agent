"use client"
import {
  Building2,
  Calculator,
  TrendingUp,
  MessageSquare,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

const navigation = [
  {
    title: "Chat",
    icon: MessageSquare,
    id: "chat",
  },
  {
    title: "Calculator",
    icon: Calculator,
    id: "calculator",
  },
  {
    title: "Market Insights",
    icon: TrendingUp,
    id: "insights",
  },
  {
    title: "Property Analysis",
    icon: Building2,
    id: "property-form",
  },
]

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  onNewChat: () => void
  chatHistory: ChatHistoryItem[]
  onChatSelect: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  currentChatId?: string
  isLoading?: boolean
}

export function AppSidebar({
  activeView,
  onViewChange,
  onNewChat,
  chatHistory,
  onChatSelect,
  onDeleteChat,
  currentChatId,
  isLoading = false,
}: AppSidebarProps) {
  const { open, setOpen } = useSidebar()

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return "Today"
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">MSASCOUT</span>
            <span className="truncate text-xs text-muted-foreground">Property Investment Agent</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
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

        {/* Chat History */}
        <SidebarGroup className="flex-1">
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>Chat History</SidebarGroupLabel>
            <Button variant="ghost" size="sm" onClick={onNewChat} className="h-6 w-6 p-0 hover:bg-accent">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <SidebarGroupContent>
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">No chat history yet</div>
              ) : (
                <SidebarMenu>
                  {chatHistory.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <div className="group flex items-center gap-2">
                        <SidebarMenuButton
                          onClick={() => onChatSelect(chat.id)}
                          isActive={currentChatId === chat.id}
                          className="flex-1 justify-start"
                        >
                          <MessageSquare className="h-3 w-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-xs font-medium">{chat.title}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatDate(chat.updatedAt)}</span>
                              {chat.messages.length > 0 && (
                                <Badge variant="secondary" className="h-4 px-1 text-xs">
                                  {chat.messages.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </SidebarMenuButton>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteChat(chat.id)
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-center p-2">
          <SidebarTrigger className="h-8 w-8">
            {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </SidebarTrigger>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
