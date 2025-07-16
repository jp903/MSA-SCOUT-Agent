"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PropertyImage } from "@/lib/portfolio-types"
import { ChevronLeft, ChevronRight, X, Star, ImageIcon } from "lucide-react"

interface ImageGalleryProps {
  images: PropertyImage[]
  className?: string
}

function ImageGallery({ images, className = "" }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No images available</p>
        </CardContent>
      </Card>
    )
  }

  const primaryImage = images.find((img) => img.isPrimary) || images[0]

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImageIndex(null)
  }

  const goToPrevious = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)
    }
  }

  const goToNext = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)
    }
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Primary Image */}
        <Card>
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
              <img
                src={primaryImage.url || "/placeholder.svg"}
                alt={primaryImage.caption || primaryImage.filename}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onClick={() => openLightbox(images.indexOf(primaryImage))}
              />
              {primaryImage.isPrimary && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 fill-current mr-1" />
                    Primary
                  </Badge>
                </div>
              )}
              {primaryImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm">{primaryImage.caption}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.caption || image.filename}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {image.isPrimary && (
                  <div className="absolute top-1 left-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={images[selectedImageIndex].url || "/placeholder.svg"}
              alt={images[selectedImageIndex].caption || images[selectedImageIndex].filename}
              className="max-w-full max-h-full object-contain"
            />

            {images[selectedImageIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white text-center">{images[selectedImageIndex].caption}</p>
              </div>
            )}

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Close Button */}
            <Button variant="secondary" size="sm" className="absolute top-4 right-4" onClick={closeLightbox}>
              <X className="h-4 w-4" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} of {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export { ImageGallery } // named export
export default ImageGallery // default export (unchanged behaviour)
