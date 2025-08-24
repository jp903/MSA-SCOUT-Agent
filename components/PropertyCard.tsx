"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath, Square, Eye } from "lucide-react"

interface Property {
  id: string
  address: string
  price: number
  bedrooms?: number
  bathrooms?: number
  squareFootage: number
  propertyType: string
  listDate: string
  latitude: number
  longitude: number
  source: string
  images?: string[]
  description?: string
}

interface PropertyCardProps {
  property: Property
  onViewDetails?: (property: Property) => void
}

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatSquareFootage = (sqft: number) => {
    return new Intl.NumberFormat("en-US").format(sqft)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{property.address}</CardTitle>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Listed on {new Date(property.listDate).toLocaleDateString()}</span>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {property.source}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Price */}
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(property.price)}
            {property.source === "RentCast" && <span className="text-sm text-gray-500">/month</span>}
          </div>

          {/* Property Details */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>{property.bedrooms} bed</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                <span>{property.bathrooms} bath</span>
              </div>
            )}
            {property.squareFootage > 0 && (
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                <span>{formatSquareFootage(property.squareFootage)} sqft</span>
              </div>
            )}
          </div>

          {/* Property Type */}
          <div>
            <Badge variant="outline">{property.propertyType}</Badge>
          </div>

          {/* Description */}
          {property.description && <p className="text-sm text-gray-600 line-clamp-3">{property.description}</p>}

          {/* Action Button */}
          <Button onClick={() => onViewDetails?.(property)} className="w-full" variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
