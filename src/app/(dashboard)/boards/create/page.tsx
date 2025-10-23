"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BoardForm } from "../../../components/boards/board-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { boardApi } from "../../../lib/api-client";
import type { BoardCategory, CategoryDictionary } from "../../../lib/types";

const FALLBACK_CATEGORIES: CategoryDictionary = {
  NOTICE: "공지",
  FREE: "자유",
  QNA: "Q&A",
  ETC: "기타",
};

export default function CreateBoardPage() {
  const router = useRouter();
  const [categories, setCategories] =
    useState<CategoryDictionary>(FALLBACK_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await boardApi.categories();
        if (data && Object.keys(data).length > 0) {
          setCategories(data);
        }
      } catch {
        // ignore and fallback
      } finally {
        setLoadingCategories(false);
      }
    };

    void fetchCategories();
  }, []);

  const handleSubmit = async (payload: {
    title: string;
    content: string;
    category: BoardCategory;
    file: File | null;
  }) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const result = await boardApi.create({
        ...payload,
      });
      router.replace(`/boards/${result.id}`);
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message ?? "게시글 생성에 실패했습니다.");
      } else {
        setServerError("게시글 생성에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">
          새 게시글 작성
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingCategories ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-slate-500">카테고리를 불러오는 중…</p>
          </div>
        ) : (
          <BoardForm
            categories={categories}
            submitting={submitting}
            submitLabel="등록"
            onSubmit={handleSubmit}
            serverError={serverError}
          />
        )}
      </CardContent>
    </Card>
  );
}
