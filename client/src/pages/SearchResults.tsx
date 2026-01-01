import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Loader2 } from "lucide-react";

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
      {/* Header */}
      <div className="border-b border-border/20 py-12">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-display mb-2">Search Results</h1>
          {query && (
            <p className="text-muted-foreground">
              Found {results?.total || 0} result{results?.total !== 1 ? "s" : ""} for "{query}"
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <section className="section-spacing">
        <div className="container max-w-4xl mx-auto">
          {!query ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Enter a search query to find stories</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : !results?.posts || results.posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No stories found matching your search.</p>
              <p className="text-sm text-muted-foreground">Try different keywords or browse by tags.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <a className="card-elegant block group">
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
                  </a>
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
                Previous
              </button>
              <span className="text-label">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                className="btn-elegant"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
