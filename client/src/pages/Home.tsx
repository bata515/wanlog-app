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
          <Link href="/">
            <a className="text-2xl font-bold text-display hover:opacity-80 transition-opacity">
              WanLog
            </a>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/tags">
              <a className="text-label hover:text-accent transition-colors">Tags</a>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <a className="text-label hover:text-accent transition-colors">Dashboard</a>
                </Link>
                <Link href="/profile">
                  <a className="text-label hover:text-accent transition-colors">Profile</a>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()} className="btn-elegant-accent text-sm">
                Sign In
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
                Celebrate Your
                <br />
                <span className="text-accent">Beloved Companion</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Share the precious moments with your furry friend. A refined platform for dog lovers to document, celebrate, and connect.
              </p>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Link href="/posts/create">
                  <a className="btn-elegant-accent">Create Your First Post</a>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()} className="btn-elegant-accent">
                    Get Started
                  </a>
                  <Link href="/posts">
                    <a className="btn-elegant">Explore Posts</a>
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
                <h3 className="text-subheading">Elegant Stories</h3>
                <p className="text-muted-foreground">
                  Craft beautiful narratives about your dog's adventures and milestones.
                </p>
              </div>
              <div className="text-center space-y-3">
                <Heart className="w-8 h-8 mx-auto text-accent" />
                <h3 className="text-subheading">Connect & Share</h3>
                <p className="text-muted-foreground">
                  Engage with fellow dog enthusiasts through likes and thoughtful comments.
                </p>
              </div>
              <div className="text-center space-y-3">
                <MessageCircle className="w-8 h-8 mx-auto text-accent" />
                <h3 className="text-subheading">Community</h3>
                <p className="text-muted-foreground">
                  Discover inspiring stories and build meaningful connections.
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
            <h2 className="text-headline mb-2">Recent Stories</h2>
            <p className="text-muted-foreground">Discover heartwarming tales from our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elegant group cursor-pointer hover:shadow-lg transition-all">
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5 mb-4 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-accent/30" />
                </div>
                <h3 className="text-subheading mb-2">Featured Story {i}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  A beautiful moment captured in time, waiting to be discovered by fellow dog lovers.
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
            <Link href="/posts">
              <a className="btn-elegant">View All Stories</a>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-headline">Ready to Share Your Story?</h2>
          <p className="text-lg text-muted-foreground">
            Join our community of dog lovers and start documenting your beloved companion's journey today.
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()} className="inline-block btn-elegant-accent">
              Create Account
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
                A refined platform for celebrating your beloved companion.
              </p>
            </div>
            <div>
              <h4 className="text-label mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/posts"><a className="text-muted-foreground hover:text-foreground transition-colors">Stories</a></Link></li>
                <li><Link href="/tags"><a className="text-muted-foreground hover:text-foreground transition-colors">Tags</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-label mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Guidelines</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-label mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/20 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 WanLog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
