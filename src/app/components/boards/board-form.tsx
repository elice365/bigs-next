"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { API_BASE_URL } from "../../lib/constants";
import type { BoardCategory, CategoryDictionary } from "../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";

const schema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  category: z.string().min(1, "카테고리를 선택해주세요."),
  file: z
    .any()
    .optional()
    .transform((value) => {
      if (value instanceof FileList && value.length > 0) {
        return value[0];
      }
      return null;
    }),
});

type BoardFormFieldValues = z.input<typeof schema>;
export type BoardFormValues = z.infer<typeof schema>;

interface BoardFormProps {
  defaultValues?: {
    title?: string;
    content?: string;
    category?: BoardCategory;
    imageUrl?: string | null;
  };
  categories: CategoryDictionary;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: {
    title: string;
    content: string;
    category: BoardCategory;
    file: File | null;
  }) => Promise<void>;
  serverError?: string | null;
}

export function BoardForm({
  defaultValues,
  categories,
  submitting,
  submitLabel,
  onSubmit,
  serverError,
}: BoardFormProps) {
  const [initialPreview] = useState<string | null>(
    defaultValues?.imageUrl ?? null,
  );
  const [preview, setPreview] = useState<string | null>(initialPreview);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BoardFormFieldValues, undefined, BoardFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      category: defaultValues?.category ?? "NOTICE",
    },
  });

  const file = watch("file");

  useEffect(() => {
    if (file && file instanceof File) {
      const nextPreview = URL.createObjectURL(file);
      setPreview(nextPreview);
      return () => {
        URL.revokeObjectURL(nextPreview);
      };
    }
    if (!file) {
      setPreview(initialPreview);
    }
  }, [file, initialPreview]);

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      content: values.content,
      category: values.category as BoardCategory,
      file: values.file ?? null,
    });
  });

  const resolvedPreview = useMemo(() => {
    if (!preview) return null;
    if (preview.startsWith("blob:") || preview.startsWith("data:")) {
      return preview;
    }
    return `${API_BASE_URL}${preview}`;
  }, [preview]);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleFormSubmit}
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          placeholder="제목을 입력하세요"
          {...register("title")}
        />
        {errors.title ? (
          <p className="text-xs text-red-600">{errors.title.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">카테고리</Label>
        <Select id="category" {...register("category")}>
          {Object.entries(categories).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        {errors.category ? (
          <p className="text-xs text-red-600">{errors.category.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          rows={12}
          placeholder="내용을 입력하세요"
          {...register("content")}
        />
        {errors.content ? (
          <p className="text-xs text-red-600">{errors.content.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">대표 이미지</Label>
        <Input id="file" type="file" accept="image/*" {...register("file")} />
        <p className="text-xs text-slate-500">
          이미지를 선택하지 않으면 기존 이미지를 유지합니다.
        </p>
        {resolvedPreview ? (
          <div className="relative mt-2 overflow-hidden rounded-lg border border-slate-200">
            <Image
              src={resolvedPreview}
              alt="미리보기"
              width={600}
              height={400}
              className="h-auto w-full object-cover"
              unoptimized
            />
          </div>
        ) : null}
      </div>
      {serverError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "처리 중…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
