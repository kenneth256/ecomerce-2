"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Plus } from 'lucide-react'
import { useProductStore } from '@/store/useProductStore'

const CreateCategoryPage = () => {
    const { createCategory, isLoading } = useProductStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categoryName, setCategoryName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            
            if (!categoryName.trim()) {
                toast.error("Category name is required");
                setLoading(false);
                return;
            }

            if (categoryName.trim().length < 2) {
                toast.error("Category name must be at least 2 characters");
                setLoading(false);
                return;
            }

            
            await createCategory(categoryName.trim());

            toast.success("Category created successfully!");
            setCategoryName(''); 
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || "Failed to create category. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-[#fffefe] w-full flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8'>
                    <div className='flex items-center justify-center w-12 h-12 bg-black rounded-full mb-4 mx-auto'>
                        <Plus className='w-6 h-6 text-white' />
                    </div>
                    
                    <h1 className='font-bold text-2xl text-center mb-2'>Create New Category</h1>
                    <p className='text-center text-gray-600 text-sm mb-8'>
                        Add a new category for organizing your products
                    </p>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        {/* Category Name */}
                        <div>
                            <Label htmlFor='name' className='text-gray-700 font-medium text-sm mb-2 block'>
                                Category Name *
                            </Label>
                            <Input
                                name='name'
                                id='name'
                                placeholder='e.g., Electronics, Clothing, Accessories'
                                className='bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full'
                                required
                                onChange={(e) => setCategoryName(e.target.value)}
                                value={categoryName}
                                disabled={loading}
                            />
                            <p className='text-xs text-gray-500 mt-1'>
                                Choose a clear, descriptive name for your category
                            </p>
                        </div>

                       
                        <Button
                            disabled={loading || !categoryName.trim()}
                            type='submit'
                            className='w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5 transition-colors'
                        >
                            {loading ? "Creating Category..." : (
                                <>
                                    CREATE CATEGORY <ArrowRight className='w-4 h-4 ml-2' />
                                </>
                            )}
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            className='w-full border-gray-200 hover:bg-gray-50 transition-colors'
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCategoryPage;