import React, { useEffect, useCallback } from "react";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

interface CheckStatusLoadProps {
    status: 'loading' | 'error' | 'success' | null;
    message: string;
    onContinue: () => void;
    onClose: () => void;
}

const CheckStatusLoad: React.FC<CheckStatusLoadProps> = ({ status, message, onContinue, onClose }) => {
    // ✅ ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ทุกครั้งที่ render
    const memoizedOnContinue = useCallback(() => {
        onContinue();
    }, [onContinue]);

    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        } else if (status === 'error') {
            const timer = setTimeout(() => {
                memoizedOnContinue();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status, onClose, memoizedOnContinue]); // ✅ เพิ่ม `memoizedOnContinue` เป็น dependency

    const buttonColor = status === 'loading' ? 'bg-blue-500 hover:bg-blue-700'
        : status === 'error' ? 'bg-red-500 hover:bg-red-700'
            : 'bg-teal-500 hover:bg-teal-700 text-white';

    return (
        <>
            {status !== null && (
                <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-gray-600 bg-opacity-50" >
                    <div className="bg-white rounded-lg shadow-lg relative p-4 max-w-lg w-full min-h-500px" onClick={(e) => e.stopPropagation()}>
                        <div className='w-full h-full flex justify-center items-center flex-col'>
                            <div className={`font-bold text-2xl ${status === 'error' ? 'text-red-500' : 'text-teal-500'}`}>{message}</div>
                            {status === 'loading' && (
                                <FaSpinner className="inline w-72 h-72 text-blue-500 animate-spin" />
                            )}
                            {status === 'error' && (
                                <FaXmark className='inline w-72 h-72 text-red-600 ' />
                            )}
                            {status === 'success' && (
                                <FaCheck className="inline w-72 h-72 text-teal-500" />
                            )}
                            <div className='w-full flex justify-around '>
                                {status === 'error' && (
                                    <button
                                        type="button"
                                        className="font-bold py-2 px-4 rounded mt-4 text-gray-900 bg-gray-100 hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-gray-100 text-sm text-center inline-flex items-center dark:focus:ring-gray-700"
                                        onClick={memoizedOnContinue}
                                    >
                                        กลับไปทำ
                                    </button>
                                )}
                                {(status === 'error' || status === 'success') && (
                                    <button
                                        type="button"
                                        className={`font-bold py-2 px-4 rounded mt-4 text-gray-900 bg-gray-500 focus:ring-4 focus:outline-none focus:ring-red-100 text-sm text-center inline-flex items-center ${buttonColor}`}
                                        onClick={onClose}
                                    >
                                        close
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CheckStatusLoad;
