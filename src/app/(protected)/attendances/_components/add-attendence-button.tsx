"use client";

import { Plus, Siren } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { professionalsTable, patientsTable } from "@/db/schema";
import AddEmergencyAttendanceForm from "./add-attendance-form";

interface AddAttendanceButtonProps {
  patients: (typeof patientsTable.$inferSelect)[];
  professionals: (typeof professionalsTable.$inferSelect)[];
}

const AddAttendanceButton = ({
  patients,
  professionals,
}: AddAttendanceButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Siren className="h-4 w-4" />
          Emergência
        </Button>
      </DialogTrigger>
      <AddEmergencyAttendanceForm
        isOpen={isOpen}
        patients={patients}
        professionals={professionals}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddAttendanceButton;
