"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [dischargeDate, setDischargeDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 6자 이상 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          dischargeDate: dischargeDate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "회원가입 중 오류가 발생했습니다."
        );
        return;
      }

      alert("회원가입이 완료되었습니다.");

      router.push("/login");
    } catch (error) {
      console.error("회원가입 오류:", error);

      setError(
        "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">

          <Link
            href="/"
            className="text-3xl font-bold tracking-tight text-gray-900 transition hover:text-blue-600"
          >
            Homeward
          </Link>

          <p className="mt-2 text-sm text-gray-500">
            Career & D-Day Management
          </p>

        </div>

        {/* Signup Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">

          <div className="mb-8">

            <h1 className="text-2xl font-bold text-gray-900">
              회원가입
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Homeward와 함께 취업 준비를 시작해보세요.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}
            <div>

              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                이름
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                autoComplete="name"
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

            </div>

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                이메일
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상 입력하세요"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

            </div>

            {/* Password Confirm */}
            <div>

              <label
                htmlFor="passwordConfirm"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                비밀번호 확인
              </label>

              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) =>
                  setPasswordConfirm(e.target.value)
                }
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

            </div>

            {/* Discharge Date */}
            <div>

              <label
                htmlFor="dischargeDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                전역 예정일
                <span className="ml-2 text-xs font-normal text-gray-400">
                  선택사항
                </span>
              </label>

              <input
                id="dischargeDate"
                type="date"
                value={dischargeDate}
                onChange={(e) =>
                  setDischargeDate(e.target.value)
                }
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <p className="mt-2 text-xs text-gray-400">
                입력하면 대시보드에서 전역 D-Day를 확인할 수 있습니다.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>

              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? "회원가입 중..." : "회원가입"}
            </button>

          </form>

          {/* Login */}
          <div className="mt-8 border-t border-gray-100 pt-6 text-center">

            <p className="text-sm text-gray-500">
              이미 계정이 있으신가요?
            </p>

            <Link
              href="/login"
              className="mt-2 inline-block text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              로그인하기 →
            </Link>

          </div>

        </div>

        {/* Back */}
        <div className="mt-6 text-center">

          <Link
            href="/"
            className="text-sm text-gray-400 transition hover:text-gray-600"
          >
            ← 홈으로 돌아가기
          </Link>

        </div>

      </div>

    </main>
  );
}