// src/app/(protected)/questionnaires/layout.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function QuestionnairesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { title: "Campos", href: "/question-fields" },
    { title: "Templates", href: "/questionnaire-templates" },
    { title: "Meus Questionários", href: "/my-questionnaires" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b">
        <Tabs value={pathname} className="w-full">
          <TabsList className="h-auto w-full justify-start gap-4 bg-transparent p-0">
            {tabs.map((tab) => (
              <Link key={tab.href} href={tab.href}>
                <TabsTrigger
                  value={tab.href}
                  className="data-[state=active]:border-primary rounded-none px-4 py-2 data-[state=active]:border-b-2"
                >
                  {tab.title}
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {children}
    </div>
  );
}
