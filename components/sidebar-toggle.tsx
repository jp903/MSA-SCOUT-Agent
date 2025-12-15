"use client"

import { PanelLeft, PanelRight } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"

export function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      className="w-full justify-start"
    >
      {state === "collapsed" ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}