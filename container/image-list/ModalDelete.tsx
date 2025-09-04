import React, { useState } from "react";
import axios from "@/lib/axios";
import { FaTimes, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ImageList } from "@prisma/client";
import ReactIconComponent from "@/components/ReactIconComponent";
import ImgIndex from "@/components/ui/img";
import Modal from "@/components/form/Modal";


const ImageModalDelete: React.FC<{ list: ImageList, onSuccess: () => void; }> = ({ list, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await axios.delete("/api/upload/searchDel", {
        data: { imageUrl: list.imageUrl },
      });

      if (response.status === 200) {
        alert("ลบรูปภาพสำเร็จ!");
        onSuccess();
      } else {
        throw new Error("เกิดข้อผิดพลาดในการลบรูปภาพ");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("เกิดข้อผิดพลาดในการลบรูปภาพ");
    }
  };


  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-red-100 text-red-700 rounded hover:bg-red-300" size="sm">
        <ReactIconComponent icon={"FaTrash"} setClass="h-4 w-4" />
      </Button>
      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              ลบไฟล์ <span className="text-blue-800">{list.nameFile}</span>
            </Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="w-full h-full">
            <ImgIndex name={list.nameFile} imageValue={list.imageUrl} size="wsm" classValue="w-full h-full object-cover" />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleDelete} variant="destructive" className="px-4 py-2 rounded mr-2">
            ยืนยัน
          </Button>
          <Button onClick={() => setIsOpen(false)} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImageModalDelete;

