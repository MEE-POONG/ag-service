import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ReactIconComponent from "@/components/ReactIconComponent";
import { ImageList } from "@prisma/client";
import ImgIndex from "@/components/ui/img";
import Modal from "@/components/form/Modal";

const ImageModalView: React.FC<{ list: ImageList }> = ({ list }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (

    <>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-100 text-blue-700 rounded hover:bg-blue-300" size="sm">
        <ReactIconComponent icon={"FaEye"} setClass="h-4 w-4" />
      </Button>
      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              ดูไฟล์ <span className="text-blue-800">{list.nameFile}</span>
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
          <Button onClick={() => setIsOpen(false)} className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">ปิด</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImageModalView;
