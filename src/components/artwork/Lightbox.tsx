"use client";

import Modal from "@/components/ui/Modal";

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

export default function Lightbox({ open, onClose, src, alt }: LightboxProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative w-screen h-screen md:w-auto md:h-auto md:max-w-[90vw] md:max-h-[90vh] flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:-top-3 md:-right-3 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-lg hover:bg-gray-50 z-10"
        >
          ✕
        </button>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain md:rounded-2xl"
        />
      </div>
    </Modal>
  );
}
