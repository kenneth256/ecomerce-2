"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Upload, X } from 'lucide-react'
import { useProductStore } from '@/store/useProductStore'
import { productProtect } from '@/actions/authSign'

interface Category {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

const Page = () => {
  const {
    createProduct,
    isLoading,
    error,
    categories,
    fetchCategories
  } = useProductStore()
  
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    brand: '',
    color: '',
    sizes: [] as string[],
    gender: '',
    rating: '',
    isFeatured: false
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files])

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check authentication
    const checkProductCreateValidity = await productProtect()
    if (!checkProductCreateValidity.success) {
      toast.error(checkProductCreateValidity.error)
      return
    }

    setLoading(true)

    try {
      // Validation
      if (!formData.name || !formData.price || !formData.category || !formData.stock) {
        toast.error("Please fill in all required fields")
        setLoading(false)
        return
      }

      if (parseFloat(formData.price) <= 0) {
        toast.error("Price must be greater than 0")
        setLoading(false)
        return
      }

      if (parseInt(formData.stock) < 0) {
        toast.error("Stock cannot be negative")
        setLoading(false)
        return
      }

      if (images.length === 0) {
        toast.error("Please upload at least one product image")
        setLoading(false)
        return
      }

      // Build FormData
      const submitData = new FormData()
      
      // Required fields
      submitData.append('name', formData.name)
      submitData.append('price', formData.price)
      submitData.append('category', formData.category)
      submitData.append('description', formData.description)
      submitData.append('stock', formData.stock)
      submitData.append('isFeatured', String(formData.isFeatured))

      // Optional fields - only if they have values
      if (formData.brand?.trim()) {
        submitData.append('brand', formData.brand.trim())
      }
      
      if (formData.gender) {
        submitData.append('gender', formData.gender)
      }
      
      if (formData.rating) {
        submitData.append('rating', formData.rating)
      }

      // Color - convert to JSON array
      if (formData.color?.trim()) {
        const colorArray = formData.color
          .split(',')
          .map(c => c.trim())
          .filter(c => c.length > 0)
        
        if (colorArray.length > 0) {
          submitData.append('color', JSON.stringify(colorArray))
        }
      }

      // Sizes - convert to JSON array
      if (formData.sizes.length > 0) {
        submitData.append('sizes', JSON.stringify(formData.sizes))
      }

      // Images
      images.forEach((image) => {
        submitData.append('images', image)
      })

      // Create product
      await createProduct(submitData)
      toast.success("Product created successfully!")
      
      // Reset form
      setFormData({
        name: '',
        price: '',
        category: '',
        description: '',
        stock: '',
        brand: '',
        color: '',
        sizes: [],
        gender: '',
        rating: '',
        isFeatured: false
      })
      setImages([])
      setImagePreviews([])
      
   
      router.push('/dashboard')
      
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || "Failed to create product. Please try again."
      toast.error(errorMsg)
      console.error('Error details:', error?.response?.data || error)
    } finally {
      setLoading(false)
    }
  }

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  return (
    <div className='min-h-screen bg-[#fffefe] w-full'>
      <div className='w-full flex flex-col p-8 lg:p-16 justify-center overflow-y-auto'>
        <div className='w-full max-w-4xl mx-auto'>
          <h1 className='font-bold text-2xl text-center mb-2'>Create New Product</h1>
          <p className='text-center text-gray-600 text-sm mb-6'>Fill in the product details below</p>

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
             
              <div>
                <Label htmlFor='name' className='text-gray-700 font-medium text-sm'>
                  Product Name *
                </Label>
                <Input
                  name='name'
                  id='name'
                  placeholder='Enter product name'
                  className='bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full'
                  required
                  onChange={handleEventChange}
                  value={formData.name}
                />
              </div>

            
              <div>
                <Label htmlFor='price' className='text-gray-700 font-medium text-sm'>
                  Price *
                </Label>
                <Input
                  name='price'
                  id='price'
                  type='number'
                  step='0.01'
                  min='0'
                  placeholder='Enter price'
                  className='bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full'
                  required
                  onChange={handleEventChange}
                  value={formData.price}
                />
              </div>

           
              <div>
                <Label htmlFor='category' className='text-gray-700 font-medium text-sm'>
                  Category *
                </Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('category', value)} 
                  required
                  value={formData.category}
                >
                  <SelectTrigger className='bg-gray-50 border-gray-200 w-full'>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(categories)
                      .filter((category): category is Category => Boolean(category))
                      .map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              
              <div>
                <Label htmlFor='stock' className='text-gray-700 font-medium text-sm'>
                  Stock Quantity *
                </Label>
                <Input
                  name='stock'
                  id='stock'
                  type='number'
                  min='0'
                  placeholder='Enter stock quantity'
                  className='bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full'
                  required
                  onChange={handleEventChange}
                  value={formData.stock}
                />
              </div>

            
              <div>
                <Label htmlFor='brand' className='text-gray-700 font-medium text-sm'>
                  Brand
                </Label>
                <Input
                  name='brand'
                  id='brand'
                  placeholder='Enter brand name'
                  className='bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full'
                  onChange={handleEventChange}
                  value={formData.brand}
                />
              </div>

             
              <div>
                <Label htmlFor='color' className='text-gray-700 font-medium text-sm'>
                  Color (comma-separated)
                </Label>
                <Input
                  name='color'
                  id='color'
                  placeholder='e.g. Red, Blue, Green'
                  className='bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full'
                  onChange={handleEventChange}
                  value={formData.color}
                />
              </div>

           
              <div>
                <Label htmlFor='gender' className='text-gray-700 font-medium text-sm'>
                  Gender
                </Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('gender', value)}
                  value={formData.gender}
                >
                  <SelectTrigger className='bg-gray-50 border-gray-200 w-full'>
                    <SelectValue placeholder='Select gender' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                    <SelectItem value='unisex'>Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            
              <div>
                <Label htmlFor='rating' className='text-gray-700 font-medium text-sm'>
                  Rating (0-5)
                </Label>
                <Input
                  name='rating'
                  id='rating'
                  type='number'
                  step='0.1'
                  min='0'
                  max='5'
                  placeholder='Enter rating'
                  className='bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full'
                  onChange={handleEventChange}
                  value={formData.rating}
                />
              </div>
            </div>

          
            <div>
              <Label htmlFor='description' className='text-gray-700 font-medium text-sm'>
                Description *
              </Label>
              <Textarea
                name='description'
                id='description'
                placeholder='Enter product description'
                className='bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors min-h-[100px] w-full'
                required
                onChange={handleEventChange}
                value={formData.description}
              />
            </div>

            
            <div>
              <Label className='text-gray-700 font-medium text-sm mb-2 block'>
                Available Sizes
              </Label>
              <div className='flex flex-wrap gap-2'>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type='button'
                    onClick={() => handleSizeToggle(size)}
                    className={`px-4 py-2 rounded-md border transition-colors ${
                      formData.sizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

       
            <div>
              <Label htmlFor='images' className='text-gray-700 font-medium text-sm mb-2 block'>
                Product Images *
              </Label>
              <div className='border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer'>
                <input
                  type='file'
                  id='images'
                  multiple
                  accept='image/*'
                  onChange={handleImageChange}
                  className='hidden'
                />
                <label htmlFor='images' className='cursor-pointer'>
                  <Upload className='w-8 h-8 mx-auto mb-2 text-gray-400' />
                  <p className='text-sm text-gray-600'>Click to upload images</p>
                  <p className='text-xs text-gray-400 mt-1'>PNG, JPG, WEBP up to 10MB</p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className='grid grid-cols-3 md:grid-cols-6 gap-2 mt-4'>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className='relative group'>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className='w-full h-24 object-cover rounded-lg'
                      />
                      <button
                        type='button'
                        onClick={() => removeImage(index)}
                        className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

           
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='isFeatured'
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, isFeatured: checked as boolean }))
                }
              />
              <Label htmlFor='isFeatured' className='text-gray-700 font-medium text-sm cursor-pointer'>
                Mark as Featured Product
              </Label>
            </div>

           
            <Button
              disabled={loading}
              type='submit'
              className='w-full mt-6 bg-black hover:bg-gray-800 text-white font-medium py-2.5 transition-colors'
            >
              {loading ? "Creating Product..." : (
                <>
                  CREATE PRODUCT <ArrowRight className='w-4 h-4 ml-2' />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Page