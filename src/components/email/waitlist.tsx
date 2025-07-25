"use client";

import { waitlistAction } from "@/lib/actions/email";
import { ActionState } from "@/types/state";
import { useActionState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Icon } from "../ui/icon";
import { Input } from "../ui/input";

export const WaitlistSignup = () => {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    waitlistAction,
    {
      error: "",
    }
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="text-base md:text-lg md:px-12 md:py-8 shadow-lg shadow-sky-300/40 hover:shadow-sky-400/50 transition-shadow duration-500"
        >
          Join Waitlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Waitlist</DialogTitle>
          <DialogDescription>
            {state.success
              ? "Thank you!"
              : "Enter your email to be notified when FinalSpaces is available."}
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          {state.success ? (
            <Alert>
              <Icon icon="mdi:email-check" className="mr-2 size-6" />
              <AlertTitle>
                Please check your email for a confirmation message.
              </AlertTitle>
              <AlertDescription>
                <p>
                  Once confirmed, you will be notified when FinalSpaces is
                  available.
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center gap-1">
              <Input
                type="email"
                name="email"
                defaultValue={state.email}
                placeholder="example@email.com"
                required
              />
              <Button type="submit" variant="outline" disabled={pending}>
                Submit
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
