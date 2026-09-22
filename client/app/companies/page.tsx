"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  dischargeDate?: string;
};

type Company = {
  _id: string;
  userId: string;
  name: string;
  jobPostUrl?: string;
  status: string;
  deadline?: string;
  createdAt: string;
};

const STATUS_OPTIONS = [
  "지원 전",
  "서류 제출",
  "서류 합격",
  "면접",
  "최종 합격",
  "불합격",
];

export default function CompaniesPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  // ========================================
  // 검색 / 필터
  // ========================================
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");

  const [name, setName] = useState("");
  const [jobPostUrl, setJobPostUrl] = useState("");
  const [deadline, setDeadline] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingUrl, setEditingUrl] = useState("");
  const [editingDeadline, setEditingDeadline] = useState("");

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ========================================
  // 로그인 사용자 확인
  // ========================================
  useEffect(() => {
    const savedUser = localStorage.getItem("homewardUser");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      setUser({
        ...parsedUser,
        id: String(parsedUser.id),
      });
    } catch (error) {
      console.error("사용자 정보 오류:", error);
      localStorage.removeItem("homewardUser");
      router.push("/login");
    }
  }, [router]);

  // ========================================
  // 기업 목록 불러오기
  // ========================================
  useEffect(() => {
    if (!user?.id) return;

    loadCompanies(user.id);
  }, [user]);

  const loadCompanies = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/companies?userId=${encodeURIComponent(userId)}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (data.success) {
        setCompanies(data.companies);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("기업 조회 오류:", error);
      setMessage("기업 목록을 불러오지 못했습니다.");
    }
  };

  // ========================================
  // 검색 + 상태 필터 적용
  // ========================================
  const filteredCompanies = companies.filter((company) => {
    const keyword = searchKeyword.trim().toLowerCase();

    const matchesSearch =
      keyword === "" ||
      company.name.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "전체" ||
      company.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ========================================
  // 기업 등록
  // ========================================
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!user?.id) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    if (!name.trim()) {
      setMessage("기업명을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          name,
          jobPostUrl,
          status: "지원 전",
          deadline: deadline || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCompanies((prev) => [
          data.company,
          ...prev,
        ]);

        setName("");
        setJobPostUrl("");
        setDeadline("");

        setMessage("기업이 등록되었습니다.");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("기업 등록 오류:", error);
      setMessage("기업 등록 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // 기업 수정 시작
  // ========================================
  const startEdit = (company: Company) => {
    setEditingId(company._id);
    setEditingName(company.name);
    setEditingUrl(company.jobPostUrl || "");

    setEditingDeadline(
      company.deadline
        ? new Date(company.deadline)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setMessage("");
  };

  // ========================================
  // 기업 수정 취소
  // ========================================
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingUrl("");
    setEditingDeadline("");
  };

  // ========================================
  // 기업 수정
  // ========================================
  const handleUpdate = async (company: Company) => {
    if (!user?.id) return;

    if (!editingName.trim()) {
      setMessage("기업명을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/companies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: company._id,
          userId: user.id,
          name: editingName,
          jobPostUrl: editingUrl,
          status: company.status,
          deadline: editingDeadline || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCompanies((prev) =>
          prev.map((item) =>
            item._id === company._id
              ? data.company
              : item
          )
        );

        cancelEdit();
        setMessage("기업 정보가 수정되었습니다.");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("기업 수정 오류:", error);
      setMessage("기업 수정 중 오류가 발생했습니다.");
    }
  };

  // ========================================
  // 지원 상태 변경
  // ========================================
  const handleStatusChange = async (
    company: Company,
    newStatus: string
  ) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/companies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: company._id,
          userId: user.id,
          name: company.name,
          jobPostUrl: company.jobPostUrl || "",
          status: newStatus,
          deadline: company.deadline || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCompanies((prev) =>
          prev.map((item) =>
            item._id === company._id
              ? data.company
              : item
          )
        );

        setMessage("지원 상태가 변경되었습니다.");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("상태 변경 오류:", error);
      setMessage("지원 상태 변경 중 오류가 발생했습니다.");
    }
  };

  // ========================================
  // 기업 삭제
  // ========================================
  const handleDelete = async (company: Company) => {
    if (!user?.id) return;

    const confirmed = window.confirm(
      `${company.name} 기업을 삭제하시겠습니까?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/companies", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: company._id,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCompanies((prev) =>
          prev.filter(
            (item) => item._id !== company._id
          )
        );

        setMessage("기업이 삭제되었습니다.");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("기업 삭제 오류:", error);
      setMessage("기업 삭제 중 오류가 발생했습니다.");
    }
  };

  // ========================================
  // 로그아웃
  // ========================================
  const handleLogout = () => {
    localStorage.removeItem("homewardUser");
    window.location.href = "/";
  };

  // ========================================
  // 화면
  // ========================================
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* ========================================
            상단
        ======================================== */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/")}
              className="mb-3 text-sm text-gray-500 hover:text-black"
            >
              ← 홈으로
            </button>

            <h1 className="text-3xl font-bold">
              기업 관리
            </h1>

            <p className="mt-2 text-gray-500">
              지원 기업과 지원 상태를 관리하세요.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-100"
          >
            로그아웃
          </button>
        </div>

        {/* ========================================
            기업 등록
        ======================================== */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            기업 등록
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2"
          >
            {/* 기업명 */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                기업명
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="예: 삼성전자"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* 채용공고 URL */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                채용공고 URL
              </label>

              <input
                type="url"
                value={jobPostUrl}
                onChange={(e) =>
                  setJobPostUrl(e.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* 지원 마감일 */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                지원 마감일
              </label>

              <input
                type="date"
                value={deadline}
                onChange={(e) =>
                  setDeadline(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* 등록 버튼 */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isLoading
                  ? "등록 중..."
                  : "기업 등록"}
              </button>
            </div>
          </form>
        </section>

        {/* ========================================
            메시지
        ======================================== */}
        {message && (
          <p className="mb-6 text-center text-sm font-medium">
            {message}
          </p>
        )}

        {/* ========================================
            기업 목록
        ======================================== */}
        <section>
          {/* 제목 */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              지원 기업
            </h2>

            <span className="text-sm text-gray-500">
              {searchKeyword || statusFilter !== "전체"
                ? `${filteredCompanies.length} / ${companies.length}개`
                : `총 ${companies.length}개`}
            </span>
          </div>

          {/* ========================================
              검색 + 필터
          ======================================== */}
          {companies.length > 0 && (
            <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row">

                {/* 검색 */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) =>
                      setSearchKeyword(e.target.value)
                    }
                    placeholder="🔍 기업명을 검색하세요"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                  />

                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchKeyword("")
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-black"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* 상태 필터 */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="rounded-lg border px-4 py-3 outline-none focus:border-black md:w-48"
                >
                  <option value="전체">
                    전체 상태
                  </option>

                  {STATUS_OPTIONS.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* 필터 초기화 */}
              {(searchKeyword ||
                statusFilter !== "전체") && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {filteredCompanies.length}개의 기업이
                    검색되었습니다.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchKeyword("");
                      setStatusFilter("전체");
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-black"
                  >
                    필터 초기화
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================
              기업 없음
          ======================================== */}
          {companies.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">
                등록된 기업이 없습니다.
              </p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            /* ========================================
               검색 결과 없음
               ======================================== */
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-medium">
                검색 결과가 없습니다.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                기업명이나 지원 상태를 다시 확인해주세요.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchKeyword("");
                  setStatusFilter("전체");
                }}
                className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            /* ========================================
               기업 목록
               ======================================== */
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <div
                  key={company._id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  {editingId === company._id ? (
                    /* ================================
                       수정 화면
                       ================================ */
                    <div className="space-y-4">

                      {/* 기업명 */}
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          기업명
                        </label>

                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) =>
                            setEditingName(e.target.value)
                          }
                          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        />
                      </div>

                      {/* 채용공고 URL */}
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          채용공고 URL
                        </label>

                        <input
                          type="url"
                          value={editingUrl}
                          onChange={(e) =>
                            setEditingUrl(e.target.value)
                          }
                          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        />
                      </div>

                      {/* 지원 마감일 */}
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          지원 마감일
                        </label>

                        <input
                          type="date"
                          value={editingDeadline}
                          onChange={(e) =>
                            setEditingDeadline(
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        />
                      </div>

                      {/* 버튼 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdate(company)
                          }
                          className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                        >
                          저장
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ================================
                       기업 정보
                       ================================ */
                    <div>
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                        {/* 기업 정보 */}
                        <div>
                          <h3 className="text-lg font-bold">
                            {company.name}
                          </h3>

                          {/* 채용공고 */}
                          {company.jobPostUrl && (
                            <a
                              href={company.jobPostUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block text-sm text-blue-600 hover:underline"
                            >
                              채용공고 보기 →
                            </a>
                          )}

                          {/* 지원 마감일 */}
                          {company.deadline && (
                            <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
                              <p className="text-sm font-medium text-gray-700">
                                📅 지원 마감일
                              </p>

                              <p className="mt-1 text-sm text-gray-600">
                                {new Date(
                                  company.deadline
                                ).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 지원 상태 */}
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">
                            지원 상태
                          </label>

                          <select
                            value={
                              company.status ||
                              "지원 전"
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                company,
                                e.target.value
                              )
                            }
                            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
                          >
                            {STATUS_OPTIONS.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>

                      {/* 수정 / 삭제 */}
                      <div className="mt-5 flex gap-2 border-t pt-4">
                        <button
                          onClick={() =>
                            startEdit(company)
                          }
                          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          수정
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(company)
                          }
                          className="rounded-lg border px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}