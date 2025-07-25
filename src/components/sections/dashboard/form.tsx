"use client";

import { AnimatedInput } from "@/components/elements/form/animated-input";
import { FileUploader } from "@/components/elements/form/image-upload";
import { useUploadThing } from "@/components/elements/uploads";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Icon } from "@/components/ui/icon";
import { LocationPicker } from "@/components/ui/location-picker";
import { createDeceased } from "@/lib/actions/user";
import { useCreateForm } from "@/lib/state";
import { ActionState } from "@/types/state";
import { format } from "date-fns";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const CreateForm = () => {
  const { setOpen } = useCreateForm();
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [deathDate, setDeathDate] = useState<Date | null>(null);
  const [birthLocation, setBirthLocation] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, pending] = useActionState<ActionState, FormData>(
    createDeceased,
    {
      error: "",
      success: "",
    }
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      formRef.current?.reset();
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      toast.success("Image uploaded successfully");
      setImage(res[0]?.ufsUrl);
    },
    onUploadError: (error) => {
      toast.error("Error uploading image");
    },
  });

  return (
    <form action={action} className="flex flex-col gap-4" ref={formRef}>
      <AnimatedInput
        name="name"
        type="text"
        label="Name"
        placeholder="John Doe"
        defaultValue={state.name}
      />

      <div className="flex items-center gap-4">
        <DatePicker
          label="Date of Birth"
          date={birthDate!}
          setDate={setBirthDate}
          width="flex-1 h-10"
        />
        <DatePicker
          label="Date of Death"
          date={deathDate!}
          setDate={setDeathDate}
          width="flex-1 h-10"
        />
        <input
          type="hidden"
          name="birthDate"
          defaultValue={format(birthDate!, "yyyy-MM-dd")}
        />
        <input
          type="hidden"
          name="deathDate"
          defaultValue={format(deathDate!, "yyyy-MM-dd")}
        />
      </div>
      <LocationPicker
        variant="inline"
        placeholder="Place of Birth"
        onChange={(location) => {
          setBirthLocation(location);
          console.log("Selected:", location);
        }}
      />
      <input type="hidden" name="birthLocation" defaultValue={birthLocation!} />
      <div className="flex items-center gap-4">
        <FileUploader
          maxFiles={1}
          accept={["image/*"]}
          maxSize={1024 * 1024 * 2}
          onFilesReady={(files) => {
            startUpload(files);
          }}
        />
        <input type="hidden" name="image" defaultValue={image!} />
      </div>
      <div className="flex items-center gap-2 w-full">
        <Button
          type="submit"
          disabled={pending || isUploading}
          className="grow"
        >
          {pending || isUploading ? (
            <Icon icon="svg-spinners:3-dots-fade" />
          ) : (
            "Create"
          )}
        </Button>
        <Button
          variant="outline"
          type="reset"
          onClick={() => {
            setBirthDate(null);
            setDeathDate(null);
            setBirthLocation(null);
            setImage(null);
            formRef.current?.reset();
          }}
          className="grow"
        >
          Reset
        </Button>
      </div>
    </form>
  );
};
