"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { authApi } from "../../lib/api-client";
import { useAuthStore } from "../../lib/stores/auth-store";

const schema = z.object({
  username: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type SignInForm = z.infer<typeof schema>;

export default function SignInPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isHydrated && accessToken) {
      router.replace("/boards");
    }
  }, [accessToken, isHydrated, router]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await authApi.signin(values);
      setAuth(result);
      router.replace("/boards");
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message ?? "로그인에 실패했습니다.");
      } else {
        setServerError("로그인에 실패했습니다.");
      }
    }
  });

  if (isHydrated && accessToken) {
    return null;
    // layout effect will redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-slate-900">
            BIGS Front Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="username">이메일</Label>
              <Input
                id="username"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                {...register("username")}
              />
              {errors.username ? (
                <p className="text-xs text-red-600">
                  {errors.username.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
            {serverError ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {serverError}
              </p>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "로그인 중…" : "로그인"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            아직 계정이 없다면{" "}
            <Link
              className="font-medium text-slate-900 underline"
              href="/signup"
            >
              회원가입
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
