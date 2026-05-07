"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UploadIcon, XIcon } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWishlistItem,
  getWishlistItem,
  updateWishlistItem,
} from "@/lib/api/wishlist/functions";
import {
  createWishlistSchema,
  type CreateWishlistInput,
} from "@/lib/zod/wishlist";
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

type WishlistFormData = CreateWishlistInput;

export default function EditWishlistPage() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WishlistFormData>({
    resolver: zodResolver(createWishlistSchema),
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
      url: "",
      priority: "medium",
    },
  });
  const [files, setFiles] = React.useState<File[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [existingImageUrl, setExistingImageUrl] = React.useState<string | null>(
    null,
  );
  const [originalImageUrl, setOriginalImageUrl] = React.useState<string | null>(
    null,
  );
  const [replacingImage, setReplacingImage] = React.useState(false);
  const qcl = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const id = (params as { id?: string })?.id;

  const onFileValidate = React.useCallback(
    (file: File): string | null => {
      if (files.length >= 1) {
        return "You can only upload up to 1 file";
      }

      if (!file.type.startsWith("image/")) {
        return "Only image files are allowed";
      }

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

  React.useEffect(() => {
    if (files.length > 0) {
      setReplacingImage(true);
    }
  }, [files]);

  const { mutate: createWishlist, isPending } = useMutation({
    mutationKey: ["create-wishlist"],
    mutationFn: async (data: WishlistFormData) => {
      const imageFile = files.length > 0 ? files[0] : null;
      if (id) {
        return await updateWishlistItem(id, data, imageFile);
      }
      return await createWishlistItem(data, imageFile);
    },
    onSuccess: (response: { message: string; data?: unknown }) => {
      toast.success(response.message || "Wishlist item saved successfully!");
      reset();
      qcl.invalidateQueries({ queryKey: ["wishlist-items"] });
      setFiles([]);
      router.back();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save wishlist item");
    },
  });

  const onSubmit = (data: WishlistFormData) => {
    createWishlist(data);
  };

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsFetching(true);
    getWishlistItem(id)
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
          url: item.url ?? "",
          priority: (item.priority as "low" | "medium" | "high") ?? "medium",
        });
        setExistingImageUrl(item.image ?? null);
        setOriginalImageUrl(item.image ?? null);
        setReplacingImage(false);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load wishlist item");
      })
      .finally(() => setIsFetching(false));
    return () => {
      mounted = false;
    };
  }, [id, reset]);

  return (
    <div className="p-6 container mx-auto">
      <form
        className="space-y-4"
        onSubmit={handleSubmit((data) => onSubmit(data as WishlistFormData))}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="image">Image</FieldLabel>
            {existingImageUrl && !replacingImage ? (
              <div className="mb-3 flex items-start gap-3">
                <div className="relative h-32 w-32 rounded-md overflow-hidden border bg-white/5">
                  <Image
                    src={existingImageUrl as string}
                    alt="Existing wishlist item"
                    fill
                    sizes="128px"
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm">Current image</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplacingImage(true)}
                    >
                      Change image
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        /* keep image — no-op */
                      }}
                    >
                      Keep image
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
                        Or click to browse (max 1 file, only images, max size
                        2MB)
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
                      <SelectItem value="regular">Regular (Default)</SelectItem>
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
            <FieldLabel htmlFor="priority">Priority</FieldLabel>
            <Controller
              control={control}
              name="priority"
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
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium (Default)</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="url">Product URL</FieldLabel>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/product"
              {...register("url")}
              disabled={isSubmitting}
            />
            {errors.url && (
              <span className="text-sm text-red-500">{errors.url.message}</span>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="isPublic">Public</FieldLabel>
            <Switch id="isPublic" {...register("isPublic")} />
          </Field>
        </FieldGroup>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isSubmitting || isPending || isFetching}
          >
            {isSubmitting || isPending
              ? id
                ? "Updating..."
                : "Creating..."
              : id
                ? "Update"
                : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
