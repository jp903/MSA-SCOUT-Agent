"use client"

import {
  Building2,
  Calculator,
  Plus,
  Settings,
  TrendingUp,
  User,
  HelpCircle,
  LogIn,
  Home,
  BarChart3,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AppSidebarProps {
  activeView?: string
  onViewChange?: (view: string) => void
  onNewChat?: () => void
}

export function AppSidebar({ activeView = "home", onViewChange, onNewChat }: AppSidebarProps) {
  const handleNewChat = () => {
    onViewChange?.("home")
    onNewChat?.()
  }

  return (
    <div className="h-full w-20 bg-white border-r flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-2 space-y-2">
        <Button
          onClick={handleNewChat}
          className="w-full h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex-col gap-1 p-2"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">New</span>
        </Button>

        <Button
          onClick={() => onViewChange?.("home")}
          variant={activeView === "home" ? "default" : "ghost"}
          className={`w-full h-12 rounded-xl flex-col gap-1 p-2 ${
            activeView === "home"
              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="text-xs">Chat</span>
        </Button>

        <Button
          onClick={() => onViewChange?.("calculator")}
          variant={activeView === "calculator" ? "default" : "ghost"}
          className={`w-full h-12 rounded-xl flex-col gap-1 p-2 ${
            activeView === "calculator"
              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span className="text-xs">Calc</span>
        </Button>

        <Button
          onClick={() => onViewChange?.("insights")}
          variant={activeView === "insights" ? "default" : "ghost"}
          className={`w-full h-12 rounded-xl flex-col gap-1 p-2 ${
            activeView === "insights"
              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs">Market</span>
        </Button>

        <Button
          onClick={() => onViewChange?.("portfolio")}
          variant={activeView === "portfolio" ? "default" : "ghost"}
          className={`w-full h-12 rounded-xl flex-col gap-1 p-2 ${
            activeView === "portfolio"
              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs">Portfolio</span>
        </Button>
      </div>

      {/* Footer */}
      <div className="p-2 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full h-10 rounded-xl bg-gray-100 hover:bg-gray-200 p-0">
              <User className="h-4 w-4 text-gray-700" />
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
    </div>
  )
}
