import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function PostsList() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [, setLocation] = useLocation();

  const { data: postsData, isLoading } = trpc.posts.list.useQuery({
    page,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      {/* Header */}
      <div className="border-b border-border/20 py-12">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-display mb-2">ストーリー</h1>
              <p className="text-muted-foreground">コミュニティからの心温まる物語を発見</p>
            </div>
            {isAuthenticated && (
              <Link href="/posts/create" className="btn-elegant-accent inline-block">
                新規投稿
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <section className="section-spacing">
        <div className="container max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : !postsData?.posts || postsData.posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">まだストーリーがありません。最初にシェアしてみましょう！</p>
              {isAuthenticated && (
                <Link href="/posts/create" className="btn-elegant-accent inline-block">
                  最初の投稿を作成
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {postsData.posts.map((post) => (
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
          {postsData && postsData.posts.length > 0 && (
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
