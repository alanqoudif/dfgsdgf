"use client"

import { Globe } from "lucide-react"
import { Button } from "./button"

export function LanguageSwitcher() {
  // يمكن إضافة منطق تبديل اللغة هنا
  return (
    <Button variant="ghost" className="rounded-full">
      <Globe className="h-5 w-5" />
    </Button>
  );
} 