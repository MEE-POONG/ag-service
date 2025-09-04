import React, { useState } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/router";
import { FaArrowLeft, FaPlus, FaUpload } from "react-icons/fa";
import { TheLayout } from "@/components/TheLayout";
import ImageUploader from "@/components/ui/input/ImageUploader";
import Link from "next/link";

const ImageAdd: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        modelName: "ImageList",
        nameFile: "",
        imageUrl: "",
        createdBy: "Admin",
    });

    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const imageFile = selectedFile;
        if (!imageFile) return alert("กรุณาเลือกไฟล์รูปภาพก่อน!");

        setLoading(true);

        try {
            const uploadData = new FormData();
            uploadData.append("file", imageFile);
            uploadData.append("modelName", formData.modelName); // ✅ ใส่เพิ่มตรงนี้


            const uploadResponse = await axios.post("/api/upload", uploadData);
            if (!uploadResponse.data.success) throw new Error("อัปโหลดไฟล์ไม่สำเร็จ");


            if (uploadResponse.data.success) {
                alert("เพิ่มรูปภาพสำเร็จ!");
                router.push("/setting/image-list");
            } else {
                alert("เกิดข้อผิดพลาด: " + uploadResponse.data.error);
            }
        } catch (error) {
            console.error("Error adding image:", error);
            alert("เกิดข้อผิดพลาดในการเพิ่มรูปภาพ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TheLayout>
            <div className="mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        🖼️ เพิ่มรูปภาพ
                    </h1>
                    <Link
                        href="/setting/image-list"
                        className="text-md font-medium text-gray-300 hover:text-white px-4 rounded-full bg-gray-700 hover:bg-gray-500 w-max h-8 flex items-center justify-center"
                    >
                        <FaArrowLeft className="mr-2" /> กลับไปหน้ารายการ
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">ระบุรายละเอียดรูปภาพ</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block font-semibold text-gray-700">Model Name:</label>
                                    <input
                                        type="text"
                                        value={formData.modelName}
                                        onChange={handleChange}
                                        disabled
                                        className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700">ชื่อไฟล์ (File Name):</label>
                                    <input
                                        type="text"
                                        placeholder="ชื่อไฟล์"
                                        value={selectedFile?.name || formData.nameFile}
                                        disabled
                                        className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex-1">
                                <label className="block font-semibold text-gray-700 mb-2">อัปโหลดรูปภาพ:</label>
                                <ImageUploader
                    
                                    setSelectedFile={setSelectedFile}
                                    setClass="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-64 lg:h-64"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full p-2 rounded text-white ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-500"}`}
                        >
                            <FaUpload className="inline-block mr-2" />
                            {loading ? "กำลังเพิ่ม..." : "เพิ่มรูปภาพ"}
                        </button>
                    </form>
                </div>
            </div>
        </TheLayout>
    );
};

export default ImageAdd;
