import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function SearchResults() {
  const [location] = useLocation();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    setQuery(params.get("q") || "");
    setPage(1);
  }, [location]);

  const { data: results, isLoading } = trpc.search.posts.useQuery(
    { query, page, limit: 20 },
    { enabled: !!query }
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      {/* Header */}
      <div className="border-b border-border/20 py-12">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-display mb-2">検索結果</h1>
          {query && (
            <p className="text-muted-foreground">
              "{query}"の検索結果: {results?.total || 0}件
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <section className="section-spacing">
        <div className="container max-w-4xl mx-auto">
          {!query ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">検索クエリを入力してストーリーを找してください</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : !results?.posts || results.posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">検索条件に一致するストーリーが見つかりません。</p>
              <p className="text-sm text-muted-foreground">異なるキーワードを試したり、タグで閉覧してみてください。</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="card-elegant block group">
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <h2 className="text-headline mb-2 group-hover:text-accent transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {post.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" /> {post.likeCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" /> {post.commentCount}
                          </span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {results && results.posts.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-12 pt-12 border-t border-border/20">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-elegant disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <span className="text-label">ページ {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                className="btn-elegant"
              >
                次へ
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
