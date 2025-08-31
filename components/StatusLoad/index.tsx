import React, { useEffect } from 'react';
import { FaCheck, FaHurricane, FaXmark } from 'react-icons/fa6';

interface StatusLoadProps {
    status: 'loading' | 'error' | 'success' | null;

}

const StatusLoadPage: React.FC<StatusLoadProps> = ({ status }) => {


    const textColor = status === 'loading' ? 'text-blue-500 hover:text-blue-700'
        : status === 'error' ? 'text-red-500 hover:text-red-700'
            : 'text-teal-500 hover:text-teal-700';

    return (
        <div className={`absolute z-[999] rounded-lg bg-white w-full h-full p-5 ${!status ? 'hidden' : 'flex'}`}>
            <div className='w-full h-full flex justify-center items-center flex-col'>
                <div className={`${textColor} font-bold text-2xl `}>กำลังโหลด</div>
                {status === 'loading' && (
                    <FaHurricane className='inline w-72 h-72 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600' />
                )}
            </div>
        </div>
    );
};

export default StatusLoadPage;
