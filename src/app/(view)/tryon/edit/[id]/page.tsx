"use client";

import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { UploadIcon, XIcon } from "lucide-react";
import { createTryonSchema, type CreateTryonInput } from "@/lib/zod/tryon";
import { getTryonItem, updateTryonItem } from "@/lib/api/tryon/functions";

type TryonFormData = CreateTryonInput;

export default function Page() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TryonFormData>({
    resolver: zodResolver(createTryonSchema),
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
      waist: "",
      rise: "",
      inseam: "",
      head: "",
      shoe: "",
    },
  });

  const [files, setFiles] = React.useState<File[]>([]);
  const [existingImageUrl, setExistingImageUrl] = React.useState<string | null>(
    null,
  );
  const [originalImageUrl, setOriginalImageUrl] = React.useState<string | null>(
    null,
  );
  const [replacingImage, setReplacingImage] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);

  const params = useParams();
  const router = useRouter();
  const qcl = useQueryClient();
  const id = (params as { id?: string })?.id;

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsFetching(true);

    getTryonItem(id)
      .then((res) => {
        if (!mounted) return;
        const item = res.data;
        reset({
          name: item.name,
          description: item.description ?? "",
          isPublic: item.isPublic,
          type: item.type ?? "",
          size: item.size ?? "",
          fit: item.fit ?? "regular",
          chest: item.chest ?? "",
          shoulder: item.shoulder ?? "",
          sleeve: item.sleeve ?? "",
          waist: item.waist ?? "",
          rise: item.rise ?? "",
          inseam: item.inseam ?? "",
          head: item.head ?? "",
          shoe: item.shoe ?? "",
        });
        setExistingImageUrl(item.image ?? null);
        setOriginalImageUrl(item.image ?? null);
        setReplacingImage(false);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load try-on item");
      })
      .finally(() => setIsFetching(false));

    return () => {
      mounted = false;
    };
  }, [id, reset]);

  React.useEffect(() => {
    if (files.length > 0) {
      setReplacingImage(true);
    }
  }, [files]);

  const onFileValidate = React.useCallback(
    (file: File): string | null => {
      if (files.length >= 1) return "You can only upload up to 1 file";
      if (!file.type.startsWith("image/"))
        return "Only image files are allowed";
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
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

  const { mutate: saveItem, isPending } = useMutation({
    mutationKey: ["update-tryon", id],
    mutationFn: async (data: TryonFormData) => {
      if (!id) throw new Error("Missing try-on item id");
      const imageFile = files.length > 0 ? files[0] : null;
      return updateTryonItem(id, data, imageFile);
    },
    onSuccess: (response: { message: string }) => {
      toast.success(response.message || "Try-on item updated successfully");
      qcl.invalidateQueries({ queryKey: ["tryon-items"] });
      router.back();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update try-on item");
    },
  });

  const onSubmit = (data: TryonFormData) => saveItem(data);

  return (
    <div className="container mx-auto p-6">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="image">Image</FieldLabel>
            {existingImageUrl && !replacingImage ? (
              <div className="mb-3 gap-3">
                <Image
                  unoptimized
                  height={128}
                  width={128}
                  src={existingImageUrl}
                  alt="Existing try-on item"
                  className="h-32 w-32 rounded-md border bg-white/5 object-contain"
                />
                <div className="px-2">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplacingImage(true)}
                    >
                      Change image
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {(!existingImageUrl || replacingImage) && (
              <div>
                <FileUpload
                  value={files}
                  onValueChange={setFiles}
                  onFileValidate={onFileValidate}
                  onFileReject={onFileReject}
                  accept="image/*"
                  maxFiles={1}
                  maxSize={2 * 1024 * 1024}
                  className="w-full"
                  multiple={false}
                >
                  <FileUploadDropzone>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center rounded-full border p-2.5">
                        <UploadIcon className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">
                        Drag and drop files here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Or click to browse (max 1 image, max size 2MB)
                      </p>
                    </div>
                    <FileUploadTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-fit"
                      >
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                          >
                            <XIcon />
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </FileUpload>

                {replacingImage && existingImageUrl ? (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFiles([]);
                        setReplacingImage(false);
                        setExistingImageUrl(originalImageUrl);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              {...register("name")}
              disabled={isSubmitting || isFetching}
            />
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
              disabled={isSubmitting || isFetching}
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
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string | undefined}
                    disabled={isSubmitting || isFetching}
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
                {...register("size")}
                disabled={isSubmitting || isFetching}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fit">Fit</FieldLabel>
              <Controller
                control={control}
                name="fit"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string | undefined}
                    disabled={isSubmitting || isFetching}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slim">Slim</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
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
                {...register("chest")}
                disabled={isSubmitting || isFetching}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="shoulder">Shoulder</FieldLabel>
              <Input
                id="shoulder"
                {...register("shoulder")}
                disabled={isSubmitting || isFetching}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="sleeve">Sleeve</FieldLabel>
              <Input
                id="sleeve"
                {...register("sleeve")}
                disabled={isSubmitting || isFetching}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Field>
              <FieldLabel htmlFor="waist">Waist</FieldLabel>
              <Input
                id="waist"
                {...register("waist")}
                disabled={isSubmitting || isFetching}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="rise">Rise</FieldLabel>
              <Input
                id="rise"
                {...register("rise")}
                disabled={isSubmitting || isFetching}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="inseam">Inseam</FieldLabel>
              <Input
                id="inseam"
                {...register("inseam")}
                disabled={isSubmitting || isFetching}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="head">Head</FieldLabel>
              <Input
                id="head"
                {...register("head")}
                disabled={isSubmitting || isFetching}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="shoe">Shoe</FieldLabel>
              <Input
                id="shoe"
                {...register("shoe")}
                disabled={isSubmitting || isFetching}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="isPublic">Public</FieldLabel>
            <Switch id="isPublic" {...register("isPublic")} />
          </Field>
        </FieldGroup>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || isSubmitting || isFetching}
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
