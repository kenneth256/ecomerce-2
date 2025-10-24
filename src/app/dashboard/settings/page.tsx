'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettingStore } from '@/store/settingsStore'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const Page = () => {
  const [uploadedFiles, setUploadFiles] = useState<File[]>([]);
  const { featuredProducts, isLoading, error, banners, fetchFeaturedProducts, addBanner, fetchbanners } = useSettingStore()
  const pageLoadRef = useRef(false);
  const router = useRouter()
  
  const removeFile = (indexToRemove: number) => {
    setUploadFiles(uploadedFiles.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    if (!pageLoadRef.current) {
      fetchFeaturedProducts();
      fetchbanners();
      pageLoadRef.current = true;
    }
  }, []); // ✅ FIXED: Empty dependency array

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadFiles(Array.from(files))
    }
  }

  const handleSubmitChanges = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('banner')
    try {
      const res = await addBanner(uploadedFiles);
      console.log('Banner added successfully:', res);
      router.refresh(); // ✅ FIXED: Added parentheses to actually call the function
      setUploadFiles([])
    } catch (error) {
      console.error('Error adding banner:', error);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-6'>
        <header>
          <h1 className='text-lg text-center text-muted-foreground'>Setting & Features</h1>
        </header>
        <div>
          <div className='mb-4'>
            <h2 className='mb-2'>Featured Banners</h2>
            <div className='space-y-4'>
              <div className='flex items-center space-x-4'>
                <Label htmlFor='upload-image' className='w-full items-center px-4 border-2 appearance-none transition cursor-pointer justify-center flex h-32 border-dashed border-gray-200 '>
                  <div className='flex flex-col items-center space-y-2'>
                    <Upload className='text-gray-400 h-7 w-7' />
                    <span className='text-gray-500 text-sm'>Click to upload image </span>
                  </div>
                </Label>
                <Input 
                  onChange={handleEventChange} 
                  accept='image/*' 
                  multiple 
                  type='file' 
                  id='upload-image' 
                  className='hidden' 
                />
              </div>
            </div>
          </div>
          
          <div>
            <h2>New Banners</h2>
            <div className='grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-3'>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative w-32 h-32 overflow-hidden rounded-sm">
                  <X 
                    onClick={() => removeFile(index)} 
                    className='absolute top-1 right-1 z-20 text-red-700 bg-white rounded-full p-1 shadow-lg cursor-pointer hover:text-red-900 hover:bg-red-50 transition-all' 
                  />
                  <Image
                    alt={`Banner ${index + 1}`}
                    src={URL.createObjectURL(file)}
                    fill
                    className='object-cover'
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className='mt-4'>Featured Banners</h2>
            <div className='grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-3'>
              {banners.map((banner, index) => (
                <div key={banner.id || index} className="relative w-32 h-32 overflow-hidden rounded-sm">
                  {/* ⚠️ TODO: This removeFile is for uploadedFiles, not banners - you need a different function */}
                  <X 
                    onClick={() => removeFile(index)} 
                    className='absolute top-1 right-1 z-20 text-red-700 bg-white rounded-full p-1 shadow-lg cursor-pointer hover:text-red-900 hover:bg-red-50 transition-all' 
                  />
                  <Image
                    alt={`Banner ${index}`}
                    src={banner.imageUrl}
                    fill
                    className='object-cover'
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className='mt-4'>
            <h2>List of products featured</h2>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3'>
              {featuredProducts.map((product, key) => (
                <div key={product.id || key} className="product-card w-full rounded-2xl mt-4 shadow-sm border-2 flex flex-col justify-center border-gray-500 p-1 py-2 ">
                  <div className="relative w-full h-32 overflow-hidden items-center rounded-sm">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className='object-cover rounded-lg hover:opacity-65 transition-opacity'
                    />
                  </div>
                  <h3 className="cursor-pointer text-gray-950 text-sm transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-2 font-semibold">${product.price}</p>
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            disabled={isLoading} 
            onClick={handleSubmitChanges} 
            className='w-full p-2 rounded-sm mt-4 hover:bg-gray-800 bg-black transition'
          >
            {isLoading ? "Saving changes..." : 'Save change'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Page