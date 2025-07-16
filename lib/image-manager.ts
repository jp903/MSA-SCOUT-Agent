import type { PropertyImage } from "./portfolio-types"

export class ImageManager {
  private static STORAGE_KEY = "property-images"

  // In production, this would integrate with Vercel Blob
  static async uploadImage(file: File, propertyId: string): Promise<PropertyImage> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        const image: PropertyImage = {
          id: crypto.randomUUID(),
          url: imageData, // In production, this would be the Blob URL
          filename: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          isPrimary: false,
        }

        // Store in localStorage for demo (in production, upload to Vercel Blob)
        this.storeImageLocally(propertyId, image)
        resolve(image)
      }
      reader.readAsDataURL(file)
    })
  }

  private static storeImageLocally(propertyId: string, image: PropertyImage) {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    const images = stored ? JSON.parse(stored) : {}

    if (!images[propertyId]) {
      images[propertyId] = []
    }

    images[propertyId].push(image)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images))
  }

  static getPropertyImages(propertyId: string): PropertyImage[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.STORAGE_KEY)
    const images = stored ? JSON.parse(stored) : {}
    return images[propertyId] || []
  }

  static deleteImage(propertyId: string, imageId: string): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    const images = stored ? JSON.parse(stored) : {}

    if (!images[propertyId]) return false

    const initialLength = images[propertyId].length
    images[propertyId] = images[propertyId].filter((img: PropertyImage) => img.id !== imageId)

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images))
    return images[propertyId].length < initialLength
  }

  static setPrimaryImage(propertyId: string, imageId: string): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    const images = stored ? JSON.parse(stored) : {}

    if (!images[propertyId]) return false

    // Reset all images to not primary
    images[propertyId].forEach((img: PropertyImage) => {
      img.isPrimary = false
    })

    // Set the selected image as primary
    const targetImage = images[propertyId].find((img: PropertyImage) => img.id === imageId)
    if (targetImage) {
      targetImage.isPrimary = true
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images))
      return true
    }

    return false
  }

  static updateImageCaption(propertyId: string, imageId: string, caption: string): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    const images = stored ? JSON.parse(stored) : {}

    if (!images[propertyId]) return false

    const targetImage = images[propertyId].find((img: PropertyImage) => img.id === imageId)
    if (targetImage) {
      targetImage.caption = caption
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images))
      return true
    }

    return false
  }

  static compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          "image/jpeg",
          quality,
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }
}
