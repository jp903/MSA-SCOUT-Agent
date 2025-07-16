"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageManager } from "@/lib/image-manager"
import type { PropertyImage } from "@/lib/portfolio-types"
import { Trash2, Download, Star } from "lucide-react"

interface ImageBulkOperationsProps {
  propertyId: string
  images: PropertyImage[]
  onImagesChange: (images: PropertyImage[]) => void
}

export default function ImageBulkOperations({ propertyId, images, onImagesChange }: ImageBulkOperationsProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(images.map((img) => img.id))
    } else {
      setSelectedImages([])
    }
  }

  const handleSelectImage = (imageId: string, checked: boolean) => {
    if (checked) {
      setSelectedImages([...selectedImages, imageId])
    } else {
      setSelectedImages(selectedImages.filter((id) => id !== imageId))
    }
  }

  const handleBulkDelete = () => {
    if (selectedImages.length === 0) return

    if (confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) {
      selectedImages.forEach((imageId) => {
        ImageManager.deleteImage(propertyId, imageId)
      })

      const updatedImages = images.filter((img) => !selectedImages.includes(img.id))

      // If no primary image remains, set first image as primary
      if (updatedImages.length > 0 && !updatedImages.some((img) => img.isPrimary)) {
        updatedImages[0].isPrimary = true
        ImageManager.setPrimaryImage(propertyId, updatedImages[0].id)
      }

      onImagesChange(updatedImages)
      setSelectedImages([])
    }
  }

  const handleBulkDownload = () => {
    selectedImages.forEach((imageId) => {
      const image = images.find((img) => img.id === imageId)
      if (image) {
        const link = document.createElement("a")
        link.href = image.url
        link.download = image.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
  }

  if (images.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bulk Operations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedImages.length === images.length}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select All ({selectedImages.length} of {images.length} selected)
          </label>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {images.map((image) => (
            <div key={image.id} className="relative">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute top-1 left-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  </div>
                )}
              </div>
              <div className="absolute top-1 right-1">
                <Checkbox
                  checked={selectedImages.includes(image.id)}
                  onCheckedChange={(checked) => handleSelectImage(image.id, checked as boolean)}
                  className="bg-white"
                />
              </div>
            </div>
          ))}
        </div>

        {selectedImages.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedImages.length})
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Selected
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
