"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BoardForm } from "../../../../components/boards/board-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { boardApi } from "../../../../lib/api-client";
import type {
  BoardCategory,
  BoardDetail,
  CategoryDictionary,
} from "../../../../lib/types";

const FALLBACK_CATEGORIES: CategoryDictionary = {
  NOTICE: "공지",
  FREE: "자유",
  QNA: "Q&A",
  ETC: "기타",
};

export default function EditBoardPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idParam = params?.id;
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [categories, setCategories] =
    useState<CategoryDictionary>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const id = idParam ? Number(idParam) : Number.NaN;

  useEffect(() => {
    if (!idParam) {
      return;
    }
    const fetchData = async () => {
      if (Number.isNaN(id)) {
        setBoard(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [detail, cats] = await Promise.all([
          boardApi.get(id),
          boardApi.categories().catch(() => FALLBACK_CATEGORIES),
        ]);
        setBoard(detail);
        setCategories(cats);
      } catch (error) {
        console.error(error);
        setBoard(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [id, idParam]);

  const handleSubmit = async (payload: {
    title: string;
    content: string;
    category: BoardCategory;
    file: File | null;
  }) => {
    if (!board) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const result = await boardApi.update(board.id, {
        ...payload,
      });
      router.replace(`/boards/${result.id}`);
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message ?? "게시글 수정에 실패했습니다.");
      } else {
        setServerError("게시글 수정에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">
          게시글 수정
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-slate-500">게시글 정보를 불러오는 중…</p>
          </div>
        ) : !board ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-red-600">
              게시글 정보를 찾을 수 없습니다.
            </p>
          </div>
        ) : (
          <BoardForm
            defaultValues={{
              title: board.title,
              content: board.content,
              category: board.boardCategory ?? board.category,
              imageUrl: board.imageUrl ?? null,
            }}
            categories={categories}
            submitting={submitting}
            submitLabel="수정 완료"
            onSubmit={handleSubmit}
            serverError={serverError}
          />
        )}
      </CardContent>
    </Card>
  );
}
