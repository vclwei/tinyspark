"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(username, displayName, password);
      router.push("/my");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="3-20个字符，用于登录"
        autoComplete="username"
        minLength={3}
        maxLength={20}
        required
      />
      <Input
        label="昵称"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="你的显示名称"
        autoComplete="name"
        required
      />
      <Input
        label="密码"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="至少6个字符"
        autoComplete="new-password"
        minLength={6}
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "注册中..." : "注册"}
      </Button>
      <p className="text-center text-sm text-text-secondary">
        已有账号？{" "}
        <Link href="/login" className="text-primary hover:underline">
          去登录
        </Link>
      </p>
    </form>
  );
}
