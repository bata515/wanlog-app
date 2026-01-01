import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4">
        <div className="space-y-12 text-center">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-display">WanLog</h1>
            <p className="text-lg text-muted-foreground">
              愛犬との大切な瞬間を記録・共有しましょう
            </p>
          </div>

          {/* Login Card */}
          <div className="card-elegant space-y-6">
            <div className="space-y-2">
              <h2 className="text-headline">ログイン</h2>
              <p className="text-muted-foreground">
                アカウントにサインインして、コミュニティに参加しましょう
              </p>
            </div>

            {/* Login Button */}
            <a
              href={getLoginUrl()}
              className="btn-elegant-accent w-full flex items-center justify-center gap-2 py-3"
            >
              <LogIn className="w-5 h-5" />
              Manus でログイン
            </a>

            {/* Features */}
            <div className="space-y-3 pt-6 border-t border-border/20">
              <h3 className="text-subheading">ログイン後にできること</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                  <span>愛犬の写真や思い出をシェア</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                  <span>他のユーザーの投稿にいいねやコメント</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                  <span>犬好きなコミュニティとつながる</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                  <span>プロフィールをカスタマイズ</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Browse Without Login */}
          <div className="space-y-4">
            <p className="text-muted-foreground">ログインせずに閲覧することもできます</p>
            <a href="/" className="btn-elegant w-full">
              ホームに戻る
            </a>
          </div>

          {/* Footer Info */}
          <div className="text-xs text-muted-foreground space-y-2 pt-8 border-t border-border/20">
            <p>WanLog はあなたの愛犬との思い出を大切にします</p>
            <p>安全で楽しいコミュニティをお楽しみください</p>
          </div>
        </div>
      </div>
    </div>
  );
}
