"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <span className="text-2xl">✨</span>
          <span>TinySpark</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:block px-3 py-2 text-sm text-text-secondary hover:text-foreground transition-colors"
          >
            画廊
          </Link>

          {loading ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center"
              >
                <Avatar name={user.displayName} size="sm" />
                <span className="hidden sm:block text-sm font-medium">{user.displayName}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                    <Link
                      href="/my"
                      className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      我的作品
                    </Link>
                    <Link
                      href="/upload"
                      className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      上传作品
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-white px-5 py-2 rounded-2xl text-sm font-medium hover:bg-primary-hover transition-colors min-h-[44px] flex items-center"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
