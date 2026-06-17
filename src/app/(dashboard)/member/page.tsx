"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function MemberPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [familyInfo, setFamilyInfo] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", phone: "" });
  const [stats, setStats] = useState({ posts: 0, comments: 0, likes: 0 });

  useEffect(() => {
    api.profile.get().then((data) => {
      setProfile(data);
      setForm({ name: data.name || "", bio: data.bio || "", phone: data.phone || "" });
    }).catch(() => {});
    api.family.info().then((data) => {
      if (data.family) setFamilyInfo(data);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.profile.update(form);
      setProfile(updated);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const copyCode = () => {
    if (familyInfo?.family?.inviteCode) {
      navigator.clipboard.writeText(familyInfo.family.inviteCode);
      toast.success("Код скопирован");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
            {profile?.name?.[0] || session?.user?.name?.[0] || "В"}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile?.name || session?.user?.name || "Ваш профиль"}</h1>
            <p className="text-muted-foreground">{profile?.email || session?.user?.email}</p>
          </div>
        </div>
      </motion.div>

      {familyInfo?.family && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Семья</p>
            <p className="font-semibold text-lg">{familyInfo.family.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Код приглашения</p>
            <button onClick={copyCode} className="font-mono font-bold tracking-widest text-lg text-primary hover:opacity-80 transition-all">
              {familyInfo.family.inviteCode}
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6 md:col-span-2">
          <h2 className="font-semibold mb-4">О себе</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Имя</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Телефон</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">О себе</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm resize-none" />
            </div>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50">
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">Статистика</h2>
          <div className="space-y-4">
            {[
              { label: "Посты", value: stats.posts },
              { label: "Комментарии", value: stats.comments },
              { label: "Лайки", value: stats.likes },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="font-semibold">{stat.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Участники семьи</p>
            <div className="space-y-2">
              {(familyInfo?.members || []).map((m: any) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {(m.name || "?")[0]}
                  </div>
                  <span className="truncate">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
