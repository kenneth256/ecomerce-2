'use client'
import { useCouponStore } from '@/store/couponStore'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'

const page = () => {
    const {} = useCouponStore();
    const searchParam = useParams();
     const id = searchParam.id as string;
    useEffect(() => {

    }, [id])
   
    console.log(id)
  return (
    <div>page</div>
  )
}

export default page