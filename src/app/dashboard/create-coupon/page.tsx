'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCouponStore } from '@/store/couponStore'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const Page = () => {
  const { createCoupon, isLoading, error } = useCouponStore()
  const [formData, setFormData] = useState({
    code: '',
    percentage: '',
    startDate: '',
    endDate: '',
    usageLimit: ''
  })
 const router = useRouter();

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const couponData = {
      code: formData.code.trim().toUpperCase(),
      percentage: parseFloat(formData.percentage),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      usageLimit: parseInt(formData.usageLimit, 10)
    }

    try {
      const res = await createCoupon(couponData)
     
          setFormData({
        code: '',
        percentage: '',
        startDate: '',
        endDate: '',
        usageLimit: ''
      })
      router.push('/dashboard/coupons')
    } catch (err: any) {
      toast.error('Error creating coupon!')
    }
  }

  return (
    <div className='flex flex-col'>
      <div className='flex justify-center mt-10 w-full px-4'>
        <div className='w-full max-w-screen-md'>
          <div className='gap-4 text-center mb-6'>
            <h2 className='text-black font-serif font-bold uppercase text-2xl mb-2'>
              Create a new Coupon
            </h2>
            <p className='text-sm text-gray-600'>
              Fill in the form to create a new coupon
            </p>
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          )}

          <div>
            <form onSubmit={handleSubmit}>
              <div className='space-y-4'>
                <div className='flex flex-col gap-2'>
                  <label className='font-medium text-sm'>Code</label>
                  <Input
                    name='code'
                    onChange={handleEventChange}
                    value={formData.code}
                    placeholder='e.g., SUMMER2024'
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='font-medium text-sm'>Percentage</label>
                  <Input
                    name='percentage'
                    type='number'
                    onChange={handleEventChange}
                    value={formData.percentage}
                    placeholder='e.g., 10'
                    min='0'
                    max='100'
                    step='0.01'
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='font-medium text-sm'>Start Date</label>
                  <Input
                    name='startDate'
                    type='date'
                    onChange={handleEventChange}
                    value={formData.startDate}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='font-medium text-sm'>End Date</label>
                  <Input
                    name='endDate'
                    type='date'
                    onChange={handleEventChange}
                    value={formData.endDate}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='font-medium text-sm'>Usage Limit</label>
                  <Input
                    name='usageLimit'
                    type='number'
                    onChange={handleEventChange}
                    value={formData.usageLimit}
                    placeholder='e.g., 100'
                    min='1'
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type='submit'
                  className='w-full mt-4'
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page