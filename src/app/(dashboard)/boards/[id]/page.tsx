"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { boardApi } from "../../../lib/api-client";
import { API_BASE_URL } from "../../../lib/constants";
import type { BoardDetail } from "../../../lib/types";

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idParam = params?.id;
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = idParam ? Number(idParam) : Number.NaN;

  useEffect(() => {
    if (!idParam) {
      return;
    }
    const fetchBoard = async () => {
      if (Number.isNaN(id)) {
        setError("잘못된 게시글 ID 입니다.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await boardApi.get(id);
        setBoard(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("게시글을 불러오지 못했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBoard();
  }, [id, idParam]);

  const handleDelete = async () => {
    if (!board) return;
    const confirmed = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await boardApi.delete(board.id);
      router.replace("/boards");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "삭제에 실패했습니다.";
      alert(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <p className="text-sm text-slate-500">불러오는 중…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            뒤로가기
          </Button>
          <Button onClick={() => router.refresh()}>새로고침</Button>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-red-600">게시글을 찾을 수 없습니다.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            뒤로가기
          </Button>
          <Button onClick={() => router.replace("/boards")}>목록으로</Button>
        </div>
      </div>
    );
  }

  const category = board.boardCategory ?? board.category ?? "UNKNOWN";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">{category}</Badge>
          <CardTitle className="text-2xl font-semibold text-slate-900">
            {board.title}
          </CardTitle>
          <p className="text-sm text-slate-500">
            작성일 {new Date(board.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/boards/${board.id}/edit`)}
          >
            수정
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <article className="whitespace-pre-wrap text-slate-700 leading-relaxed">
          {board.content}
        </article>
        {board.imageUrl ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Image
              src={`${board.imageUrl.startsWith("http") ? "" : API_BASE_URL}${board.imageUrl}`}
              alt={board.title}
              width={800}
              height={600}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            목록으로
          </Button>
          <Link
            href="/boards"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            목록 보기
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
