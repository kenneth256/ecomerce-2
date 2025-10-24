'use client'
import { cn } from '@/lib/utils';
import { BookCheck, Box, DollarSign, Group, LibrarySquare, ListOrderedIcon, LogOut, LucideCreativeCommons, PieChartIcon, PlusIcon, Settings } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation'; 
import React from 'react'

type sideProps = {
  isOpen: boolean;
  toggle: () => void
}

const items = [
  {
    name: 'Products',
    icon: <Box className='w-4 h-4' />,
    href: '/dashboard'
  },
  {
    name: 'Sales',
    icon: <DollarSign className='w-4 h-4' />,
    href: '/dashboard/sales'
  },
  {
    name: 'Customers',
    icon: <Group className='w-4 h-4' />,
    href: '/dashboard/customers'
  },
  {
    name: 'Analytics',
    icon: <PieChartIcon className='w-4 h-4' />,
    href: '/dashboard/analytics'
  },
  {
    name: 'CreateCategory',
    icon: <LibrarySquare className='w-4 h-4' />,
    href: '/dashboard/CreateCategory'
  },
  {
    name: 'Add Products',
    icon: <PlusIcon className='w-4 h-4' />,
    href: '/dashboard/add-product'
  },
   {
    name: 'Coupons',
    icon: <BookCheck className='w-4 h-4' />,
    href: '/dashboard/coupons'
  },
  {
    name: 'Create Coupons',
    icon: <LucideCreativeCommons className='w-4 h-4' />,
    href: '/dashboard/create-coupon'
  },
  {
    name: 'Orders',
    icon: <ListOrderedIcon className='w-4 h-4' />,
    href: '/dashboard/orders'
  },
  {
    name: 'Settings',
    icon: <Settings className='w-4 h-4' />,
    href: '/dashboard/settings'
  },
  {
    name: 'Logout',
    icon: <LogOut className='w-4 h-4 hover:text-opacity-80 hover:size-6' />,
    href: ''
  },
]

const SideBar = ({ isOpen, toggle }: sideProps) => {
  const router = useRouter();
  const pathname = usePathname(); 

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <aside className='w-64 bg-white h-full overflow-y-hidden border-r p-10 flex-shrink-0'>
      <h2 style={{ marginBottom: '2.5rem' }} className='font-bold'>Admin panel</h2>
      <div>
        {
          items.map((item, key) => {
            const isActive = pathname === item.href; 
            
            return (
              <button
                key={key}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'flex items-center gap-3 pb-2 mb-2 px-4 py-2 rounded-md transition-colors w-full text-left',
                  isActive
                    ? 'text-white bg-black'
                    : 'text-gray-700 hover:bg-gray-200'
                )}
              >
                {item.icon}
                <span className='text-sm font-bold'>{item.name}</span>
              </button>
            )
          })
        }
      </div>
    </aside>
  )
}

export default SideBar