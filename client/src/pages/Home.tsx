import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { Heart, MessageCircle, Sparkles } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/20 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-bold text-display hover:opacity-80 transition-opacity">
            WanLog
          </Link>
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
              </>
            ) : (
              <a href={getLoginUrl()} className="btn-elegant-accent text-sm">
                ログイン
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-spacing">
        <div className="container max-w-4xl mx-auto">
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-display">
                愛犬との
                <br />
                <span className="text-accent">大切な瞬間を記録</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                愛犬との思い出を共有しましょう。犬好きのための洗練されたプラットフォーム。
              </p>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Link href="/posts/create" className="btn-elegant-accent inline-block">
                  最初の投稿を作成
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()} className="btn-elegant-accent">
                    はじめる
                  </a>
                  <Link href="/posts" className="btn-elegant inline-block">
                    投稿を閲覧
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Decorative divider */}
          <div className="mt-16 pt-16 border-t border-border/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-accent" />
                <h3 className="text-subheading">エレガントなストーリー</h3>
                <p className="text-muted-foreground">
                  愛犬の冒険とマイルストーンについて美しい物語を作成します。
                </p>
              </div>
              <div className="text-center space-y-3">
                <Heart className="w-8 h-8 mx-auto text-accent" />
                <h3 className="text-subheading">つながる・共有する</h3>
                <p className="text-muted-foreground">
                  犬好きな仲間とのいいねとコメントを通じて交流します。
                </p>
              </div>
              <div className="text-center space-y-3">
                <MessageCircle className="w-8 h-8 mx-auto text-accent" />
                <h3 className="text-subheading">コミュニティ</h3>
                <p className="text-muted-foreground">
                  インスピレーションを得られるストーリーを発見し、意味のあるつながりを構築します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Preview */}
      <section className="section-spacing bg-card/50 border-y border-border/20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-headline mb-2">最近のストーリー</h2>
            <p className="text-muted-foreground">コミュニティからの心温まる物語を発見</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elegant group cursor-pointer hover:shadow-lg transition-all">
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5 mb-4 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-accent/30" />
                </div>
                <h3 className="text-subheading mb-2">おすすめストーリー {i}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  時間に捉えられた美しい瞬間。犬好きな仲間に発見されるのを待っています。
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" /> 24
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" /> 8
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/posts" className="btn-elegant inline-block">
              すべてのストーリーを見る
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-headline">あなたのストーリーをシェアする準備はできていますか？</h2>
          <p className="text-lg text-muted-foreground">
            犬好きなコミュニティに参加して、愛犬の旅を記録し始めましょう。
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()} className="inline-block btn-elegant-accent">
              アカウント作成
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 bg-card/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-label mb-4">WanLog</h4>
              <p className="text-sm text-muted-foreground">
                愛犬を祝うための洗練されたプラットフォーム。
              </p>
            </div>
            <div>
              <h4 className="text-label mb-4">探索</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/posts" className="text-muted-foreground hover:text-foreground transition-colors">ストーリー</Link></li>
                <li><Link href="/tags" className="text-muted-foreground hover:text-foreground transition-colors">タグ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-label mb-4">コミュニティ</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">ガイドライン</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">サポート</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-label mb-4">法的</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">プライバシー</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">利用規約</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/20 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 WanLog. すべての権利を保有しています。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
