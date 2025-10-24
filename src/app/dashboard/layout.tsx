'use client'
import React from 'react'
import SideBar from '@/components/ui/sideBar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation' // Changed from 'next/router'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  
  return (
    <div className='flex h-screen w-screen'>
      <SideBar isOpen={true} toggle={() => {}} />
      <div className='flex-1 flex flex-col mx-4 min-w-0'>
        <div className='border-b w-full justify-between border-gray-300 h-12 flex items-center'>
          <p>All Products</p>
          <Button onClick={() => router.push('/dashboard/add-product')} className='bg-black'>
            Add Product
          </Button>
        </div>
        <main className='flex-1 overflow-auto'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout