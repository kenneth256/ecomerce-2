'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatDate } from '@/lib/utils'
import { useCouponStore } from '@/store/couponStore'
import { PencilIcon, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

const Page = () => { 
  const { fetchCoupons, coupons, deleteCoupon, isLoading } = useCouponStore()
  const router = useRouter() 
  const [active, setActive] = useState(false)
  
  console.log(coupons)
  
 useEffect(() => {
  const loadCoupons = async () => {
    await fetchCoupons()
  }
  
  loadCoupons()
}, [fetchCoupons]) 
  
  const handleDeleteCoupon = async (id?: string) => {
    if (!id) {
      toast.error('Invalid code')
      return
    }
    try {
      await deleteCoupon(id)
      toast.success('Coupon deleted successfully!')
    } catch (error) {
      toast.error('Failed deleting coupon!')
    }
  }

  
  return (
    <div className='mt-10'>
     {
      isLoading ? 'Fetching coupons' :  <div className='w-full'>
        <h2 className='uppercase text-xl font-semibold mb-4'>
          {active ? 'Active coupons' : 'All coupons'}
        </h2>
        <Table className='mt-4'>
          <TableHeader>
            <TableRow>
              <TableHead className='text-muted-foreground'>Code</TableHead>
              <TableHead className='text-muted-foreground'>Percentage</TableHead>
              <TableHead className='text-muted-foreground'>Start Date</TableHead>
              <TableHead className='text-muted-foreground'>End Date</TableHead>
              <TableHead className='text-muted-foreground'>Status</TableHead>
              <TableHead className='text-muted-foreground'>Usage Count</TableHead>
              <TableHead className='text-muted-foreground'>Usage Limit</TableHead>
              <TableHead className='text-muted-foreground'>Usage Left</TableHead>
              <TableHead className='text-muted-foreground'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon?.id} className='my-4 h-16'> 
                <TableCell>{coupon?.code}</TableCell>
                <TableCell>{coupon?.percentage}%</TableCell>
                <TableCell>{formatDate(coupon?.startDate)}</TableCell>
                <TableCell>{formatDate(coupon?.endDate)}</TableCell>
                <TableCell>
                  {
  coupon?.endDate && new Date(coupon.endDate) > new Date() 
    ? <p className='text-sm text-green-600'>Active</p>
    : <p className='text-sm text-red-500'>Expired</p>
}
                </TableCell>
                <TableCell>{coupon?.usageCount || 0}</TableCell>
                <TableCell>{coupon?.usageLimit || 'Unlimited'}</TableCell>
                <TableCell>
                  {(coupon?.usageLimit || 0) - (coupon?.usageCount || 0)}
                </TableCell>
                <TableCell> 
                  <div className='flex gap-3'>
                    <button
                      onClick={() => router.push(`/dashboard/coupons/${coupon.id}`)}
                      className="hover:opacity-80 transition-opacity"
                      aria-label="Edit coupon"
                    >
                      <PencilIcon className='text-blue-700 h-6 w-6 cursor-pointer' />
                    </button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button 
                          className="hover:opacity-80 transition-opacity"
                          aria-label="Delete coupon"
                        >
                          <Trash2 className='text-red-600 h-6 w-6 hover:text-red-900 cursor-pointer' />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the coupon code "{coupon?.code}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
     }
    </div>
  )
}

export default Page