import React from "react";
import * as Icons from "react-icons/fa"; // ✅ นำเข้าไอคอนทั้งหมดจาก `react-icons`

interface ReactIconComponentProps {
  icon?: string | null; // ✅ อนุญาตให้ `null` ได้
  setClass?: string;
}

const ReactIconComponent: React.FC<ReactIconComponentProps> = ({ icon, setClass }) => {
  if (!icon) {
    return null; // 🔹 ถ้า `icon` เป็น `null`, `undefined`, หรือ `''` ให้ return `null`
  }

  if (!(icon in Icons)) {
    console.warn(`Icon "${icon}" not found in react-icons/fa`); // 🔹 แจ้งเตือนถ้าไม่มีไอคอนนี้
    return null; // 🔹 ถ้าไม่พบไอคอน ให้คืนค่า `null`
  }

  const IconComponent = Icons[icon as keyof typeof Icons]; // ✅ ดึงไอคอนตามชื่อ
  return <IconComponent className={setClass} />; // ✅ แสดงไอคอน
};

export default ReactIconComponent;
