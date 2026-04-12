// src/app/(protected)/attendances/[attendanceId]/_components/certificate-step.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface CertificateStepProps {
  initialData?: any;
}

export function CertificateStep({ initialData }: CertificateStepProps) {
  const [enabled, setEnabled] = useState(
    !!initialData?.days && initialData?.days > 0,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Atestado Médico</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Emitir atestado
            </span>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled ? (
          <>
            <div className="space-y-2">
              <Label>Dias de afastamento</Label>
              <Input
                type="number"
                name="days"
                min="1"
                max="30"
                placeholder="Quantidade de dias"
                defaultValue={initialData?.days}
              />
            </div>

            <div className="space-y-2">
              <Label>CID-10</Label>
              <Input
                name="cidCode"
                placeholder="Código da doença (ex: J00)"
                defaultValue={initialData?.cidCode}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição do CID</Label>
              <Input
                name="cidDescription"
                placeholder="Descrição da doença"
                defaultValue={initialData?.cidDescription}
              />
            </div>

            <div className="space-y-2">
              <Label>Recomendações</Label>
              <Textarea
                name="recommendation"
                placeholder="Recomendações durante o afastamento..."
                rows={2}
                defaultValue={initialData?.recommendation}
              />
            </div>
          </>
        ) : (
          <input type="hidden" name="days" value="0" />
        )}
      </CardContent>
    </Card>
  );
}
