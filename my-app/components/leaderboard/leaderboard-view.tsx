"use client";

import { useState } from "react";
import { Medal, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContestStandingsView } from "./contest-standings";
import { DepartmentLeaderboard } from "./department-leaderboard";

export function LeaderboardView({ initialContestId, initialTab }: { initialContestId?: string; initialTab?: "contest" | "department" }) {
  const [tab, setTab] = useState(initialTab ?? "contest");
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "contest" | "department")}>
      <TabsList className="mb-4">
        <TabsTrigger value="contest">
          <Trophy /> Contest standings
        </TabsTrigger>
        <TabsTrigger value="department">
          <Medal /> Department
        </TabsTrigger>
      </TabsList>
      <TabsContent value="contest">
        <ContestStandingsView initialContestId={initialContestId} />
      </TabsContent>
      <TabsContent value="department">
        <DepartmentLeaderboard />
      </TabsContent>
    </Tabs>
  );
}
