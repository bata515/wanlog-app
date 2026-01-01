import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [previewImage, setPreviewImage] = useState(user?.profileImage || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      alert("Profile updated successfully!");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-12 text-center">
          <h1 className="text-headline mb-4">Sign in to view your profile</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to manage your profile.</p>
          <Button className="btn-elegant-accent">Sign In</Button>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        setPreviewImage(data);
        setProfileImage(data.split(",")[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateProfileMutation.mutateAsync({
        username: username || undefined,
        bio: bio || undefined,
        profileImage: profileImage || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      {/* Header */}
      <div className="border-b border-border/20 py-8">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-display mb-2">マイプロフィール</h1>
          <p className="text-muted-foreground">アカウント情報を管理</p>
        </div>
      </div>

      {/* Form */}
      <section className="section-spacing">
        <div className="container max-w-3xl mx-auto space-y-8">
          {/* Profile Picture */}
          <div className="space-y-4">
            <label className="text-label">Profile Picture</label>
            <div className="flex gap-8 items-start">
              <div className="w-32 h-32 bg-card border border-border/20 rounded-none overflow-hidden flex-shrink-0">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div className="border-2 border-dashed border-border/30 rounded-none p-6 text-center hover:border-border/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label htmlFor="profile-image-upload" className="cursor-pointer block">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-foreground font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB</p>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-label">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username..."
              maxLength={20}
            />
            <p className="text-sm text-muted-foreground">{username.length}/20</p>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label className="text-label">Email</label>
            <Input
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">Your email cannot be changed</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-label">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself and your dog..."
              maxLength={500}
              className="min-h-32"
            />
            <p className="text-sm text-muted-foreground">{bio.length}/500</p>
          </div>

          {/* Account Info */}
          <div className="card-elegant space-y-4">
            <h3 className="text-subheading">Account Information</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-label">Member Since:</span>{" "}
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="text-label">Last Signed In:</span>{" "}
                {user?.lastSignedIn && new Date(user.lastSignedIn).toLocaleDateString()}
              </p>
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
                "Save Changes"
              )}
            </Button>
            <Button onClick={() => setLocation("/")} className="btn-elegant">
              Cancel
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
