import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Search, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <nav className="border-b border-border/20 sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-display hover:opacity-80 transition-opacity flex-shrink-0">
            WanLog
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ストーリーやタグを検索..."
                className="w-full px-4 py-2 bg-card border border-border/20 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/tags" className="text-label hover:text-accent transition-colors">
              タグ
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-label hover:text-accent transition-colors">
                  ダッシュボード
                </Link>
                <Link href="/profile" className="text-label hover:text-accent transition-colors">
                  プロフィール
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-label hover:text-accent transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </>
            ) : (
              <a href={getLoginUrl()} className="btn-elegant-accent text-sm">
                ログイン
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
