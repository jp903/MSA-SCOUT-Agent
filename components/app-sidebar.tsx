"use client"

import type * as React from "react"
import {
  Building2,
  Calculator,
  MessageSquarePlus,
  Plus,
  Settings,
  TrendingUp,
  User,
  HelpCircle,
  LogIn,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeView?: string
  onViewChange?: (view: string) => void
  onNewChat?: () => void
}

export function AppSidebar({ activeView = "home", onViewChange, onNewChat, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-gray-50" {...props}>
      <SidebarHeader className="border-b-0">
        <div className="flex items-center justify-center p-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
            <Building2 className="h-5 w-5 text-white" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onNewChat}
              className="h-12 w-12 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow flex-col gap-1 p-2"
              tooltip="New Chat"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">New</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange?.("chat")}
              isActive={activeView === "chat"}
              className="h-12 w-12 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow flex-col gap-1 p-2"
              tooltip="AI Chat"
            >
              <MessageSquarePlus className="h-5 w-5" />
              <span className="text-xs">Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange?.("calculator")}
              isActive={activeView === "calculator"}
              className="h-12 w-12 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow flex-col gap-1 p-2"
              tooltip="Calculator"
            >
              <Calculator className="h-5 w-5" />
              <span className="text-xs">Calc</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange?.("insights")}
              isActive={activeView === "insights"}
              className="h-12 w-12 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow flex-col gap-1 p-2"
              tooltip="Market Insights"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Market</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t-0 px-2 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-center">
              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-0"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-48">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
