"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Pagination } from "../../components/pagination";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { boardApi } from "../../lib/api-client";
import type { BoardSummary } from "../../lib/types";

const PAGE_SIZE = 10;

interface ListState {
  items: BoardSummary[];
  totalPages: number;
  totalElements: number;
  page: number;
}

export default function BoardsPage() {
  const router = useRouter();
  const [list, setList] = useState<ListState>({
    items: [],
    totalPages: 0,
    totalElements: 0,
    page: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async (page = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await boardApi.list({ page, size: PAGE_SIZE });
      setList({
        items: response.content,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        page: response.number,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("목록을 불러오지 못했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList(0);
  }, [fetchList]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await boardApi.delete(id);
      // reload current page, adjust for empty page
      const nextPage =
        list.items.length === 1 && list.page > 0 ? list.page - 1 : list.page;
      await fetchList(nextPage);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "삭제에 실패했습니다.";
      alert(message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">게시글 관리</h1>
          <p className="text-sm text-slate-500">
            게시글을 등록, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <Button onClick={() => router.push("/boards/create")}>
          새 글 작성
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            게시글 목록
          </CardTitle>
          <span className="text-sm text-slate-500">
            총 {list.totalElements}개 게시글
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-slate-500">불러오는 중…</p>
            </div>
          ) : error ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <p className="text-sm text-red-600">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchList(list.page)}
              >
                다시 시도
              </Button>
            </div>
          ) : list.items.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-slate-500">
                등록된 게시글이 없습니다.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">제목</th>
                    <th className="px-4 py-3">카테고리</th>
                    <th className="px-4 py-3">작성일</th>
                    <th className="px-4 py-3 text-right">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                  {list.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/boards/${item.id}`}
                          className="hover:underline"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          {item.category ?? item.boardCategory ?? "UNKNOWN"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/boards/${item.id}/edit`)
                            }
                          >
                            수정
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {list.totalPages > 1 ? (
            <Pagination
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={(nextPage) => void fetchList(nextPage)}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
