"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

export default function UploadForm() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState(user?.displayName || "");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [artworkDate, setArtworkDate] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const addTag = () => {
    const raw = tagInput.replace(/^#/, "").trim();
    if (raw && !tags.includes(raw)) {
      setTags([...tags, raw]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }
    setFile(f);
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !artistName) {
      setError("请填写标题、作者名并选择图片");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const urlRes = await fetch("/api/upload-url", { method: "POST" });
      if (!urlRes.ok) throw new Error("获取上传链接失败");
      const { id: imageId, uploadURL }: { id: string; uploadURL: string } = await urlRes.json();
      setProgress(30);

      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(uploadURL, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("图片上传失败");
      setProgress(70);

      const createRes = await fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artistName,
          description: description || undefined,
          tags: tags.length > 0 ? tags.join(",") : undefined,
          imageId,
          isPublic,
          artworkDate: artworkDate || undefined,
        }),
      });
      if (!createRes.ok) throw new Error("创建作品记录失败");
      setProgress(100);

      const { id }: { id: string } = await createRes.json();
      router.push(`/artwork/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
      <div
        className="relative border-2 border-dashed border-gray-300 rounded-3xl p-4 sm:p-8 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="预览" className="max-h-64 mx-auto rounded-2xl" />
        ) : (
          <div className="py-8">
            <p className="text-4xl mb-2">📸</p>
            <p className="text-text-secondary">点击选择作品图片</p>
            <p className="text-xs text-text-secondary mt-1">支持 JPG、PNG、WEBP</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Input label="作品标题" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="给作品起个名字" required />
      <Input label="小画家" value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="作者名字" required />
      <Input label="创作日期" type="date" value={artworkDate} onChange={(e) => setArtworkDate(e.target.value)} />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">作品描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="说说这幅作品的故事..."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">标签</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm"
            >
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="text-secondary/60 hover:text-secondary ml-0.5">✕</button>
            </span>
          ))}
        </div>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={addTag}
          placeholder="输入标签后按回车，如 #水彩"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          className={`w-12 h-7 rounded-full transition-colors relative ${
            isPublic ? "bg-secondary" : "bg-gray-300"
          }`}
          onClick={() => setIsPublic(!isPublic)}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              isPublic ? "translate-x-5.5" : "translate-x-0.5"
            }`}
          />
        </div>
        <span className="text-sm">{isPublic ? "公开展示" : "仅自己可见"}</span>
      </label>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={uploading}>
        {uploading ? "上传中..." : "发布作品 ✨"}
      </Button>
    </form>
  );
}
