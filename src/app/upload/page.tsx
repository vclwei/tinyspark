"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import UploadForm from "@/components/upload/UploadForm";

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="max-w-lg mx-auto mt-4 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">上传新作品 🎨</h1>
        <p className="text-text-secondary text-sm mt-1">分享你的创作</p>
      </div>
      <UploadForm />
    </div>
  );
}
