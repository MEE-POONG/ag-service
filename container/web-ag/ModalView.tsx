import { Button, ButtonProps } from "@/components/ui/button"

import { ExtendedWebBaseDB } from '@/data/interface';
import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Modal from '@/components/form/Modal';

interface WebBaseModalViewProps {
  data: ExtendedWebBaseDB;
}

const WebBaseModalView: React.FC<WebBaseModalViewProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    passS: false,
    passM: false,
    passA: false
  });
  const togglePasswordVisibility = (field: 'passS' | 'passM' | 'passA') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="inline-flex items-center px-2 py-1 rounded text-base bg-green-100 text-green-700 border border-solid border-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed" size="sm">
        ดู
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>ดูรายละเอียด Web Base</Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} />
        </Modal.Header>
        <Modal.Body>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  ชื่อ Web Base *
                </label>
                <h3 className="text-sm sm:text-base font-bold text-gray-700 border-b-2 border-black pb-2">{data.name}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* คอลัมน์ซ้าย: Passwords */}
                <div className="space-y-4">
                  {["passS", "passM", "passA"].map((field) => (
                    <div key={field}>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Password {field === "passS" ? "Super Admin" : field === "passM" ? "Master Admin" : "Admin"}
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords[field as 'passS' | 'passM' | 'passA'] ? "text" : "password"}
                          value={data[field as keyof typeof data] as string}
                          disabled
                          className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(field as 'passS' | 'passM' | 'passA')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords[field as 'passS' | 'passM' | 'passA'] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* คอลัมน์ขวา: OTPs */}
                <div className="space-y-4">
                  {["otpS", "otpM", "otpA"].map((field) => (
                    <div key={field}>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        OTP {field === "otpS" ? "Super Admin" : field === "otpM" ? "Master Admin" : "Admin"}
                      </label>
                      <input
                        type="text"
                        value={data[field as keyof typeof data] as string}
                        disabled
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>


              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={data.isActive}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-xs sm:text-sm text-gray-700">
                  เปิดใช้งาน
                </label>
              </div>
            </div>

        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setIsOpen(false)}
            className="px-2 sm:px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-500" size="sm"
          >
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default WebBaseModalView;
