import React from 'react'
import Link from 'next/link'

interface Page404Props {
    title?: string
    message?: string
    showBackButton?: boolean
    backUrl?: string
}

export default function Page404({ 
    title = "404 - หน้าไม่พบ", 
    message = "ขออภัย หน้าที่คุณกำลังค้นหาไม่มีอยู่",
    showBackButton = true,
    backUrl = "/"
}: Page404Props) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gray-300">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">{title}</h2>
                    <p className="text-gray-600 mb-8">{message}</p>
                </div>
                
                {showBackButton && (
                    <div className="space-y-4">
                        <Link 
                            href={backUrl}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            กลับหน้าหลัก
                        </Link>
                        
                        <button 
                            onClick={() => window.history.back()}
                            className="block w-full text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            กลับไปหน้าก่อนหน้า
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
} 
