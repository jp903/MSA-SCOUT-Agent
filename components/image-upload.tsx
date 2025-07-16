"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ImageManager } from "@/lib/image-manager"
import type { PropertyImage } from "@/lib/portfolio-types"
import { Upload, Star, Edit3, Trash2, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  propertyId: string
  images: PropertyImage[]
  onImagesChange: (images: PropertyImage[]) => void
  maxImages?: number
}

export default function ImageUpload({ propertyId, images, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [captionText, setCaptionText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const newImages: PropertyImage[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`)
          continue
        }

        // Compress image
        const compressedFile = await ImageManager.compressImage(file)

        // Upload image
        const uploadedImage = await ImageManager.uploadImage(compressedFile, propertyId)
        newImages.push(uploadedImage)

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      // Set first image as primary if no primary exists
      if (images.length === 0 && newImages.length > 0) {
        newImages[0].isPrimary = true
        ImageManager.setPrimaryImage(propertyId, newImages[0].id)
      }

      onImagesChange([...images, ...newImages])
    } catch (error) {
      console.error("Error uploading images:", error)
      alert("Error uploading images. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteImage = (imageId: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      ImageManager.deleteImage(propertyId, imageId)
      const updatedImages = images.filter((img) => img.id !== imageId)

      // If deleted image was primary, set first remaining image as primary
      if (updatedImages.length > 0 && !updatedImages.some((img) => img.isPrimary)) {
        updatedImages[0].isPrimary = true
        ImageManager.setPrimaryImage(propertyId, updatedImages[0].id)
      }

      onImagesChange(updatedImages)
    }
  }

  const handleSetPrimary = (imageId: string) => {
    ImageManager.setPrimaryImage(propertyId, imageId)
    const updatedImages = images.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }))
    onImagesChange(updatedImages)
  }

  const handleUpdateCaption = (imageId: string) => {
    ImageManager.updateImageCaption(propertyId, imageId, captionText)
    const updatedImages = images.map((img) => (img.id === imageId ? { ...img, caption: captionText } : img))
    onImagesChange(updatedImages)
    setEditingCaption(null)
    setCaptionText("")
  }

  const startEditingCaption = (image: PropertyImage) => {
    setEditingCaption(image.id)
    setCaptionText(image.caption || "")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          Property Images ({images.length}/{maxImages})
        </Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Images
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading images...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {images.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">No images uploaded yet</p>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.caption || image.filename}
                    className="w-full h-full object-cover"
                  />

                  {image.isPrimary && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Primary
                      </div>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {!image.isPrimary && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(image.id)}
                          title="Set as primary image"
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => startEditingCaption(image)}
                        title="Edit caption"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id)}
                        title="Delete image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  {editingCaption === image.id ? (
                    <div className="space-y-2">
                      <Input
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        placeholder="Enter image caption..."
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={() => handleUpdateCaption(image.id)}>
                          Save
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setEditingCaption(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium truncate">{image.filename}</p>
                      {image.caption && <p className="text-xs text-gray-600">{image.caption}</p>}
                      <p className="text-xs text-gray-500">{(image.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
