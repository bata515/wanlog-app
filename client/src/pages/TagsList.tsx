import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function TagsList() {
  const { data: tags, isLoading } = trpc.tags.list.useQuery();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      {/* Header */}
      <div className="border-b border-border/20 py-12">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-display mb-2">タグ</h1>
          <p className="text-muted-foreground">トピック別にストーリーを閉覧</p>
        </div>
      </div>

      {/* Tags Grid */}
      <section className="section-spacing">
        <div className="container max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : !tags || tags.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">まだタグがありません。投稿を作成してタグを追加してください！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tags.map((tag) => (
                <Link key={tag.id} href={`/search?tag=${tag.name}`} className="card-elegant group block">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-subheading group-hover:text-accent transition-colors">
                        #{tag.name}
                      </h3>
                      <span className="text-label text-muted-foreground bg-background px-3 py-1">
                        {tag.usageCount}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tag.usageCount === 1 ? "1件の投稿" : `${tag.usageCount}件の投稿`}
                    </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
