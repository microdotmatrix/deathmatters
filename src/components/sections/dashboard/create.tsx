"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { useCreateForm } from "@/lib/state";
import { CreateForm } from "./form";

export const CreatePortal = () => {
  const { open, setOpen } = useCreateForm();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          Create New <Icon icon="mdi:plus" className="-mt-0.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="mb-4">
          <DialogTitle>Create New Entry</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new entry
          </DialogDescription>
        </DialogHeader>
        <CreateForm />
      </DialogContent>
    </Dialog>
  );
};
