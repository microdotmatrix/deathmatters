import { atom, useAtom } from "jotai";

export const createFormAtom = atom(false);

export const useCreateForm = () => {
  const [open, setOpen] = useAtom(createFormAtom);

  return {
    open,
    setOpen,
  };
};
