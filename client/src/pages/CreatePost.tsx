import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2 } from "lucide-react";

export default function CreatePost() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [images, setImages] = useState<Array<{ data: string; filename: string; preview: string }>>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: (data) => {
      setLocation(`/posts/${data.postId}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-12 text-center">
          <h1 className="text-headline mb-4">Sign in to create a post</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to share your story.</p>
          <Button className="btn-elegant-accent">Sign In</Button>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.slice(0, 5 - images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        setImages((prev) => [
          ...prev,
          {
            data: data.split(",")[1],
            filename: file.name,
            preview: data,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in title and content");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPostMutation.mutateAsync({
        title,
        content,
        status,
        images,
        tags,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/20 py-8">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-display mb-2">Create New Story</h1>
          <p className="text-muted-foreground">Share a moment with your beloved companion</p>
        </div>
      </div>

      {/* Form */}
      <section className="section-spacing">
        <div className="container max-w-3xl mx-auto space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-label">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story a title..."
              maxLength={100}
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">{title.length}/100</p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-label">Story</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story..."
              maxLength={10000}
              className="min-h-64"
            />
            <p className="text-sm text-muted-foreground">{content.length}/10000</p>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <label className="text-label">Images (up to 5)</label>
            <div className="border-2 border-dashed border-border/30 rounded-none p-8 text-center hover:border-border/50 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer block">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-foreground font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, WebP up to 5MB each</p>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-card border border-border/20 rounded-none overflow-hidden group">
                    <img src={img.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <label className="text-label">Tags (up to 5)</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Add a tag..."
                maxLength={20}
              />
              <Button onClick={handleAddTag} className="btn-elegant">
                Add
              </Button>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <div key={idx} className="inline-flex items-center gap-2 px-3 py-1 bg-card border border-border/20">
                    <span className="text-sm">#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(idx)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-label">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === "draft"}
                  onChange={() => setStatus("draft")}
                />
                <span>Draft</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === "published"}
                  onChange={() => setStatus("published")}
                />
                <span>Publish</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-8 border-t border-border/20">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="btn-elegant-accent">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Publish"
              )}
            </Button>
            <Button onClick={() => setLocation("/posts")} className="btn-elegant">
              Cancel
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
