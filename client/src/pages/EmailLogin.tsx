import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Link } from 'wouter';

export default function EmailLogin() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        toast.success('ログインしました');
        setLocation('/posts');
      } else {
        setErrors({ form: 'メールアドレスまたはパスワードが正しくありません' });
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'ログインに失敗しました';
      setErrors({ form: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-serif text-center">メールでログイン</CardTitle>
          <CardDescription className="text-center">
            メールアドレスとパスワードでログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <Alert variant="destructive">
                <AlertDescription>{errors.form}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                メールアドレス <span className="text-destructive">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                パスワード <span className="text-destructive">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="パスワード"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>

            <div className="space-y-2 text-center text-sm">
              <p>
                アカウントをお持ちでない方は{' '}
                <Link href="/register" className="text-accent hover:underline">
                  こちらから登録
                </Link>
              </p>
              <p>
                <Link href="/login" className="text-accent hover:underline">
                  OAuth でログイン
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
