"use client";

// React import intentionally omitted — JSX supported by runtime
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon, XIcon } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClosetItem } from "@/lib/api/closet/functions";
import { createClosetSchema, type CreateClosetInput } from "@/lib/zod/closet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
} from "@/components/ui/select";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
} from "@/components/ui/file-upload";
import React from "react";

type ClosetFormData = CreateClosetInput;

export default function Add() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClosetFormData>({
    resolver: zodResolver(createClosetSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
      type: "",
      size: "",
      fit: "regular",
      chest: "",
      shoulder: "",
      sleeve: "",
    },
  });
  const [files, setFiles] = React.useState<File[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const qcl = useQueryClient();
  const onFileValidate = React.useCallback(
    (file: File): string | null => {
      // Validate max files
      if (files.length >= 1) {
        return "You can only upload up to 1 file";
      }

      // Validate file type (only images)
      if (!file.type.startsWith("image/")) {
        return "Only image files are allowed";
      }

      // Validate file size (max 2MB)
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_SIZE) {
        return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`;
      }

      return null;
    },
    [files],
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const { mutate: createCloset, isPending } = useMutation({
    mutationKey: ["create-closet"],
    mutationFn: async (data: ClosetFormData) => {
      const imageFile = files.length > 0 ? files[0] : null;
      return await createClosetItem(data, imageFile);
    },
    onSuccess: (response: { message: string; data?: unknown }) => {
      toast.success(response.message || "Closet item created successfully!");
      reset();
      qcl.invalidateQueries({ queryKey: ["closet-items"] });
      setFiles([]);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create closet item");
    },
  });

  const onSubmit = (data: ClosetFormData) => {
    createCloset(data);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon /> Add Clothing
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:min-w-[70dvw] lg:min-h-[80dvh]">
        <DialogHeader>
          <DialogTitle>New Clothing</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4 max-h-[70dvh] overflow-y-auto"
          onSubmit={handleSubmit((data) => onSubmit(data as ClosetFormData))}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="image">Image URL</FieldLabel>
              <FileUpload
                value={files}
                onValueChange={setFiles}
                onFileValidate={onFileValidate}
                onFileReject={onFileReject}
                accept="image/*"
                maxFiles={1}
                maxSize={2 * 1024 * 1024} // 2MB
                className="w-full "
                multiple={false}
              >
                <FileUploadDropzone>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                      <UploadIcon className="size-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm">
                      Drag & drop files here
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Or click to browse (max 1 file, only images, max size 2MB)
                    </p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2 w-fit">
                      Browse files
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>
                <FileUploadTrigger />
                <FileUploadList>
                  {files.map((file) => (
                    <FileUploadItem key={file.name} value={file}>
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemDelete asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <XIcon />
                        </Button>
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  ))}
                </FileUploadList>
              </FileUpload>
            </Field>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" {...register("name")} disabled={isSubmitting} />
              {errors.name && (
                <span className="text-sm text-red-500">
                  {errors.name.message}
                </span>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                {...register("description")}
                disabled={isSubmitting}
              />
              {errors.description && (
                <span className="text-sm text-red-500">
                  {errors.description.message}
                </span>
              )}
            </Field>

            <div className="grid grid-cols-3 gap-2">
              <Field>
                <FieldLabel htmlFor="type">Type</FieldLabel>
                <Controller
                  control={control}
                  name="type"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({
                    field,
                  }: {
                    field: {
                      onChange: (...args: unknown[]) => void;
                      value: unknown;
                    };
                  }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value as string | undefined}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="footwear">Footwear</SelectItem>
                        <SelectItem value="hat">Hat</SelectItem>
                        <SelectItem value="accessory">Accessory</SelectItem>
                        <SelectSeparator />
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="size">Size</FieldLabel>
                <Input
                  id="size"
                  placeholder="S,M,L,XL,XXL"
                  {...register("size")}
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="fit">Fit</FieldLabel>
                <Controller
                  control={control}
                  name="fit"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({
                    field,
                  }: {
                    field: {
                      onChange: (...args: unknown[]) => void;
                      value: unknown;
                    };
                  }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value as string | undefined}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slim">Slim</SelectItem>
                        <SelectItem value="regular">
                          Regular (Default)
                        </SelectItem>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Field>
                <FieldLabel htmlFor="chest">Chest</FieldLabel>
                <Input
                  id="chest"
                  type="number"
                  placeholder="0"
                  {...register("chest")}
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="shoulder">Shoulder</FieldLabel>
                <Input
                  id="shoulder"
                  placeholder="0"
                  type="number"
                  {...register("shoulder")}
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="sleeve">Sleeve</FieldLabel>
                <Input
                  id="sleeve"
                  type="number"
                  placeholder="0"
                  {...register("sleeve")}
                  disabled={isSubmitting}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="isPublic">Public</FieldLabel>
              <Switch id="isPublic" {...register("isPublic")} />
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSubmitting || isPending}>
              {isSubmitting || isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
