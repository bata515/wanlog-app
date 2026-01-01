import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Heart, MessageCircle, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";

export default function PostDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const postId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { data: post, isLoading, refetch } = trpc.posts.getById.useQuery({ id: postId });
  const { data: likeStatus } = trpc.likes.isLiked.useQuery({ postId });
  const toggleLikeMutation = trpc.likes.toggle.useMutation({
    onSuccess: () => refetch(),
  });
  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setCommentText("");
      refetch();
    },
  });
  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => setLocation("/posts"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-12 text-center">
          <h1 className="text-headline mb-4">Post not found</h1>
          <Link href="/posts">
            <a className="btn-elegant inline-block">Back to Posts</a>
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === post.userId;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      {/* Header */}
      <div className="border-b border-border/20 py-8">
        <div className="container max-w-3xl mx-auto">
          <Link href="/posts" className="text-label text-muted-foreground hover:text-foreground mb-4 inline-block">
            ← ストーリー一覧に戻る
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-display mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.updatedAt !== post.createdAt && (
                  <span>更新 {new Date(post.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            {isAuthor && (
              <div className="flex gap-2">
                <Link href={`/posts/${post.id}/edit`} className="btn-elegant p-2 inline-block">
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    if (confirm("この投稿を削除してもよろしいですか？")) {
                      deletePostMutation.mutate({ id: post.id });
                    }
                  }}
                  className="btn-elegant p-2 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="section-spacing">
        <div className="container max-w-3xl mx-auto">
          {/* Images Gallery */}
          {post.images && post.images.length > 0 && (
            <div className="mb-12">
              <div className="aspect-video bg-card border border-border/20 rounded-none overflow-hidden mb-4">
                <img
                  src={post.images[0].url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {post.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {post.images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-card border border-border/20 rounded-none overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                      <img
                        src={img.url}
                        alt={`${post.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post Content */}
          <div className="prose prose-sm max-w-none mb-12">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-12 pb-12 border-b border-border/20">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag.tagId} href={`/tags/${tag.tagId}`} className="inline-block px-3 py-1 bg-card border border-border/20 text-sm hover:border-accent transition-colors">
                    #{tag.tagId}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Engagement */}
          <div className="flex items-center gap-8 mb-12 pb-12 border-b border-border/20">
            <button
              onClick={() => toggleLikeMutation.mutate({ postId })}
              className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${likeStatus?.liked ? "fill-current text-accent" : ""}`}
              />
              <span>{post.likeCount}</span>
            </button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="w-6 h-6" />
              <span>{post.commentCount}</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-8">
            <h2 className="text-headline">コメント</h2>

            {/* Comment Form */}
            {user ? (
              <div className="card-elegant space-y-4">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="あなたの感想を共有してください..."
                  className="min-h-24"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {commentText.length}/500
                  </span>
                  <button
                    onClick={() => {
                      if (commentText.trim()) {
                        setIsSubmittingComment(true);
                        createCommentMutation.mutate(
                          { postId, content: commentText },
                          {
                            onSettled: () => setIsSubmittingComment(false),
                          }
                        );
                      }
                    }}
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="btn-elegant-accent disabled:opacity-50"
                  >
                    {isSubmittingComment ? "投稿中..." : "コメントを投稿"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-elegant text-center py-8">
                <p className="text-muted-foreground mb-4">コメントを残すにはサインインしてください</p>
                <Link href={`/login?redirect=/posts/${post.id}`} className="btn-elegant-accent inline-block">
                  サインイン
                </Link>
              </div>
            )}

            {/* Comments List */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-6">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="card-elegant">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">User {comment.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {user?.id === comment.userId && (
                        <button className="text-destructive hover:opacity-70">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>まだコメントがありません。最初に感想を共有してみましょう！</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
