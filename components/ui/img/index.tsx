import React, { useState } from "react";
import { FaPlus, FaUser } from "react-icons/fa";

interface ImageProps {
    name?: string;
    imageValue?: string | null;
    classValue?: string;
    widthValue?: string;
    heightValue?: string;
    size?: string;
    addShow?: boolean;
}

const ImgIndex: React.FC<ImageProps> = ({
    name = '',
    imageValue = '',
    classValue = '',
    widthValue = '0',
    heightValue = '0',
    size = 'wmd',
    addShow = false,
}) => {
    const fallbackImage = "/fallback-default.png"; // ✅ ใช้ค่า Default Image ตายตัว
    const [imageSrc, setImageSrc] = useState(imageValue || fallbackImage); // ✅ ใช้ค่า fallback แทน API

    return (
        <>
            {imageSrc ? (
                <img
                    key={imageValue}
                    src={`https://imagedelivery.net/QZ6TuL-3r02W7wQjQrv5DA/${imageSrc}/${size}`}
                    width={widthValue}
                    height={heightValue}
                    className={`m-auto ${classValue}`}
                    alt={name}
                    onError={() => setImageSrc("")} // ✅ ถ้าภาพเสีย ให้ซ่อนรูป
                />
            ) : (
                <div
                    className={`m-auto flex items-center justify-center w-[${widthValue}] h-[${heightValue}]  ${classValue} `}
                >

                    {addShow ? <FaPlus size={50} className="text-gray-400" /> : <FaUser size={50} className="text-gray-400" />}
                </div>
            )}
        </>
    );
};

export default ImgIndex;
