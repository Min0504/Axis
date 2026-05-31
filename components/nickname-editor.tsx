"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const MAX_NICKNAME = 20;

export default function NicknameEditor({
  initialNickname,
  fallback
}: {
  initialNickname: string | null;
  fallback: string;
}) {
  const [nickname, setNickname] = useState(initialNickname ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const display = nickname.trim() || fallback;

  async function save() {
    const value = nickname.trim().slice(0, MAX_NICKNAME);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    setSaving(true);
    setError("");

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setError("로그인이 필요합니다.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ nickname: value || null })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setError("저장하지 못했습니다.");
      return;
    }

    setNickname(value);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="nickname-view">
        <h1>{display}님</h1>
        <button type="button" className="nickname-edit" onClick={() => setEditing(true)}>
          별명 수정
        </button>
      </div>
    );
  }

  return (
    <div className="nickname-edit-row">
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="별명을 입력하세요"
        maxLength={MAX_NICKNAME}
        disabled={saving}
        autoFocus
      />
      <div className="nickname-actions">
        <button type="button" className="btn-primary" onClick={() => void save()} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            setNickname(initialNickname ?? "");
            setEditing(false);
            setError("");
          }}
          disabled={saving}
        >
          취소
        </button>
      </div>
      {error && <p className="hint error">{error}</p>}
    </div>
  );
}
