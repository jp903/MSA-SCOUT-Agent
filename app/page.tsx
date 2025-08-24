"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import PropertyListings from "@/components/property-listings"
import { toast } from "@/hooks/use-toast"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

// US States
const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

interface PropertySearchFilters {
  state: string
  msa: string
  propertyType: string[]
  minPrice: number
  maxPrice: number
  minBedrooms: number
  maxBedrooms: number
  minBathrooms?: number
  maxBathrooms?: number
  sortBy: string
  sortOrder: string
  listingStatus?: string
}

export default function HomePage() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Property search filters
  const [filters, setFilters] = useState<PropertySearchFilters>({
    state: "",
    msa: "",
    propertyType: ["residential"],
    minPrice: 100000,
    maxPrice: 2000000,
    minBedrooms: 1,
    maxBedrooms: 10,
    minBathrooms: 1,
    maxBathrooms: 10,
    sortBy: "price",
    sortOrder: "asc",
    listingStatus: "for_sale",
  })

  const [priceRange, setPriceRange] = useState([100000, 2000000])
  const [bedroomRange, setBedroomRange] = useState([1, 10])

  // Update filters when sliders change
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }))
  }

  const handleBedroomRangeChange = (values: number[]) => {
    setBedroomRange(values)
    setFilters((prev) => ({
      ...prev,
      minBedrooms: values[0],
      maxBedrooms: values[1],
    }))
  }

  const handleNewChat = async () => {
    try {
      const response = await fetch("/api/chat-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Chat",
          messages: [],
        }),
      })

      if (!response.ok) throw new Error("Failed to create new chat")

      const data = await response.json()
      const newChat = data.chat

      setChatHistory((prev) => [newChat, ...prev])
      setCurrentChatId(newChat.id)

      toast({
        title: "New Chat Created",
        description: "Started a new conversation",
      })
    } catch (error) {
      console.error("❌ Error creating new chat:", error)
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      })
    }
  }

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat-history/${chatId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete chat")

      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))

      if (currentChatId === chatId) {
        setCurrentChatId(null)
      }

      toast({
        title: "Chat Deleted",
        description: "Chat has been removed",
      })
    } catch (error) {
      console.error("❌ Error deleting chat:", error)
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      })
    }
  }

  const handleViewChange = (view: "home" | "chat" | "calculator" | "insights") => {
    const routes = {
      home: "/",
      chat: "/",
      calculator: "/?view=calculator",
      insights: "/?view=insights",
    }

    window.location.href = routes[view]
  }

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: checked ? [...prev.propertyType, type] : prev.propertyType.filter((t) => t !== type),
    }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeView="home"
        onViewChange={handleViewChange}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
      />
      <SidebarInset>
        <div className="flex h-[calc(100vh-2rem)] gap-6 p-6">
          {/* Filters Sidebar */}
          <Card className="w-80 flex flex-col">
            <CardHeader>
              <CardTitle>Property Search</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              {/* Location Selection */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Location</h3>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={filters.state}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, state: value, msa: "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filters.state && (
                  <div className="space-y-2">
                    <Label htmlFor="msa">MSA (Metropolitan Statistical Area)</Label>
                    <Input
                      id="msa"
                      placeholder="e.g., Austin-Round Rock, Dallas-Fort Worth-Arlington"
                      value={filters.msa}
                      onChange={(e) => setFilters((prev) => ({ ...prev, msa: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Property Type */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Property Type</h3>
                <div className="space-y-2">
                  {["residential", "commercial", "multi-family", "industrial", "land"].map((type) => {
                    const isSelected = filters.propertyType.includes(type)
                    return (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={isSelected}
                          onCheckedChange={(checked) => handlePropertyTypeChange(type, checked as boolean)}
                        />
                        <Label htmlFor={type} className="capitalize cursor-pointer">
                          {type.replace("-", " ")}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Price Range</h3>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                    max={2000000}
                    min={50000}
                    step={25000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Bedrooms</h3>
                <div className="px-2">
                  <Slider
                    value={bedroomRange}
                    onValueChange={handleBedroomRangeChange}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{bedroomRange[0]} bed</span>
                    <span>{bedroomRange[1]} beds</span>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Sort By</h3>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="bedrooms">Bedrooms</SelectItem>
                    <SelectItem value="squareFootage">Square Footage</SelectItem>
                    <SelectItem value="yearBuilt">Year Built</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="flex-1">
            <PropertyListings filters={filters} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
