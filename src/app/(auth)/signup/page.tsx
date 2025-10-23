"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const passwordPattern =
  /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!%*#?&])[A-Za-z\d!%*#?&]{8,}$/;

const schema = z
  .object({
    username: z
      .string()
      .min(1, "이메일을 입력해주세요.")
      .email("올바른 이메일 형식이 아닙니다."),
    name: z.string().min(1, "이름을 입력해주세요."),
    password: z
      .string()
      .regex(
        passwordPattern,
        "8자 이상, 숫자/영문/특수문자 조합이어야 합니다.",
      ),
    confirmPassword: z.string().min(1, "비밀번호를 다시 입력해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "비밀번호가 일치하지 않습니다.",
  });

type SignUpForm = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await authApi.signup(values);
      setSuccessMessage("회원가입이 완료되었습니다. 이제 로그인해주세요.");
      reset({
        username: values.username,
        name: values.name,
        password: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        router.push("/signin");
      }, 800);
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message ?? "회원가입에 실패했습니다.");
      } else {
        setServerError("회원가입에 실패했습니다.");
      }
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-slate-900">
            회원가입
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="space-y-2 sm:col-span-2">
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
              <Label htmlFor="name">이름</Label>
              <Input id="name" autoComplete="name" {...register("name")} />
              {errors.name ? (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  8자 이상, 숫자/영문/특수문자(!%*#?&) 각각 1개 이상 포함
                </p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
            {serverError ? (
              <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {serverError}
              </p>
            ) : null}
            {successMessage ? (
              <p className="sm:col-span-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "가입 중…" : "회원가입"}
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            이미 계정이 있다면{" "}
            <Link
              className="font-medium text-slate-900 underline"
              href="/signin"
            >
              로그인
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
