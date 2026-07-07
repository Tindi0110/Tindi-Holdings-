import { useMutation } from "@tanstack/react-query";
import { uploadFile, deleteFile } from "../core/storage.service";
import { toast } from "sonner";

export function useUploadFile() {
  return useMutation({
    mutationFn: (payload: any) => uploadFile({ data: payload }),
    onSuccess: () => {
      toast.success("File uploaded successfully!");
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: (payload: { bucket: string; path: string }) => deleteFile({ data: payload }),
    onSuccess: () => {
      toast.success("File deleted successfully!");
    },
    onError: (e: Error) => toast.error(e.message)
  });
}