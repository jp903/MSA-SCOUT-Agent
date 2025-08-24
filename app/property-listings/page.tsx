"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import PropertyCard from "@/components/PropertyCard"
import SearchForm from "@/components/SearchForm"

const PropertyListingsPage = () => {
  const router = useRouter()
  const [properties, setProperties] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = async (query) => {
    setSearchQuery(query)
    const response = await fetch(`/api/properties?query=${query}`)
    const data = await response.json()
    setProperties(data.properties)
  }

  return (
    <div className="flex">
      <div className="w-1/4 p-4">
        <SearchForm onSearch={handleSearch} />
      </div>
      <div className="w-3/4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PropertyListingsPage
