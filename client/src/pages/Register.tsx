import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Link } from 'wouter';

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = trpc.auth.register.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'ユーザー名は必須です';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'ユーザー名は3〜20文字である必要があります';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'ユーザー名は英数字とアンダースコアのみ使用可能です';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上である必要があります';
    } else if (!/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = 'パスワードは大文字、小文字、数字を含む必要があります';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
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
      const result = await registerMutation.mutateAsync({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        toast.success('登録が完了しました。ログインしてください。');
        setLocation('/login');
      }
    } catch (error: any) {
      const errorMessage = error?.message || '登録に失敗しました';
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
          <CardTitle className="text-2xl font-serif text-center">新規登録</CardTitle>
          <CardDescription className="text-center">
            WanLog に参加して、愛犬の思い出を共有しましょう
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
              <label htmlFor="username" className="text-sm font-medium">
                ユーザー名 <span className="text-destructive">*</span>
              </label>
              <Input
                id="username"
                name="username"
                placeholder="例: dog_lover_123"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.username ? 'border-destructive' : ''}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
            </div>

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
                placeholder="8文字以上（大文字、小文字、数字を含む）"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                パスワード（確認） <span className="text-destructive">*</span>
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="パスワードを再度入力"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? '登録中...' : '登録する'}
            </Button>

            <div className="text-center text-sm">
              <p>
                すでにアカウントをお持ちですか？{' '}
                <Link href="/login" className="text-accent hover:underline">
                  ログイン
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
