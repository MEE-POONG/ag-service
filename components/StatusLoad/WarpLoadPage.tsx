import React, { useEffect } from 'react';
import { FaCheck, FaHurricane, FaXmark } from 'react-icons/fa6';

interface StatusLoadProps {
    status: 'loading' | 'error'| null;
message: string;
onContinue: () => void;
onClose: () => void;
}

const WarpLoadPage: React.FC<StatusLoadProps> = ({ status }) => {


    const textColor = status === 'loading' ? 'text-blue-500 '
        : status === 'error' ? 'text-red-500 '
            : 'text-teal-500 ';

    return (
        <div className='w-full h-screen flex justify-center items-center flex-col box-loader'>
            <div className={`${textColor} font-bold text-2xl `}>Loading</div>
            {status === 'loading' && (
                <span className="loader" />
            )}
        </div>
    );
};

export default WarpLoadPage;
