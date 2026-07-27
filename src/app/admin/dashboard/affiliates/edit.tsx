"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PencilIcon, UploadIcon, XIcon } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAffiliateItem, type AffiliateProduct } from "@/lib/api/affiliates/functions";
import { createAffiliateSchema, type CreateAffiliateInput } from "@/lib/zod/affiliate";
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

export default function Edit({ item }: { item: AffiliateProduct }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAffiliateInput>({
    resolver: zodResolver(createAffiliateSchema),
    defaultValues: {
      name: item.name,
      description: item.description ?? "",
      type: item.type ?? "",
      size: item.size ?? "",
      fit: item.fit ?? "regular",
      chest: item.chest ?? "",
      shoulder: item.shoulder ?? "",
      sleeve: item.sleeve ?? "",
      affiliateUrl: item.affiliateUrl,
      brand: item.brand ?? "",
      price: item.price ?? undefined,
      currency: item.currency ?? "USD",
      storeName: item.storeName ?? "",
      isActive: item.isActive,
    },
  });

  const [files, setFiles] = React.useState<File[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const qcl = useQueryClient();

  const onFileValidate = React.useCallback(
    (file: File): string | null => {
      if (files.length >= 1) return "You can only upload up to 1 file";
      if (!file.type.startsWith("image/")) return "Only image files are allowed";
      if (file.size > 2 * 1024 * 1024) return "File size must be less than 2MB";
      return null;
    },
    [files],
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const { mutate: editAffiliate, isPending } = useMutation({
    mutationKey: ["edit-affiliate", item.id],
    mutationFn: async (data: CreateAffiliateInput) => {
      const imageFile = files.length > 0 ? files[0] : null;
      return await updateAffiliateItem(item.id, data, imageFile);
    },
    onSuccess: (response: { message: string; data?: unknown }) => {
      toast.success(response.message || "Affiliate item updated successfully!");
      qcl.invalidateQueries({ queryKey: ["affiliate-items"] });
      setFiles([]);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update affiliate item");
    },
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PencilIcon className="size-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:min-w-[70dvw] lg:min-h-[80dvh]">
        <DialogHeader>
          <DialogTitle>Edit Affiliate Product</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4 max-h-[70dvh] overflow-y-auto"
          onSubmit={handleSubmit((data) => editAffiliate(data))}
        >
          <FieldGroup>
            <Field>
              <FieldLabel>Replace Image (optional)</FieldLabel>
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
                    <p className="font-medium text-sm">Drag & drop to replace image</p>
                    <p className="text-muted-foreground text-xs">
                      Leave empty to keep existing image
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
              <FieldLabel htmlFor={`edit-name-${item.id}`}>Name</FieldLabel>
              <Input id={`edit-name-${item.id}`} {...register("name")} disabled={isSubmitting} />
              {errors.name && (
                <span className="text-sm text-red-500">{errors.name.message}</span>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor={`edit-desc-${item.id}`}>Description</FieldLabel>
              <Textarea id={`edit-desc-${item.id}`} {...register("description")} disabled={isSubmitting} />
            </Field>

            <Field>
              <FieldLabel htmlFor={`edit-url-${item.id}`}>Affiliate URL</FieldLabel>
              <Input
                id={`edit-url-${item.id}`}
                type="url"
                placeholder="https://store.com/product/..."
                {...register("affiliateUrl")}
                disabled={isSubmitting}
              />
              {errors.affiliateUrl && (
                <span className="text-sm text-red-500">{errors.affiliateUrl.message}</span>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel>Brand</FieldLabel>
                <Input placeholder="Nike, Zara..." {...register("brand")} disabled={isSubmitting} />
              </Field>
              <Field>
                <FieldLabel>Store Name</FieldLabel>
                <Input placeholder="Amazon, Zalando..." {...register("storeName")} disabled={isSubmitting} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel>Price</FieldLabel>
                <Input type="number" min="0" placeholder="0" {...register("price", { setValueAs: (v) => v === "" || v == null ? undefined : Number(v) })} disabled={isSubmitting} />
              </Field>
              <Field>
                <FieldLabel>Currency</FieldLabel>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }: { field: { onChange: (...args: unknown[]) => void; value: unknown } }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value as string | undefined}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="BDT">BDT</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }: { field: { onChange: (...args: unknown[]) => void; value: unknown } }) => (
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
                <FieldLabel>Size</FieldLabel>
                <Input placeholder="S,M,L,XL,XXL" {...register("size")} disabled={isSubmitting} />
              </Field>
              <Field>
                <FieldLabel>Fit</FieldLabel>
                <Controller
                  control={control}
                  name="fit"
                  render={({ field }: { field: { onChange: (...args: unknown[]) => void; value: unknown } }) => (
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
                <FieldLabel>Chest</FieldLabel>
                <Input type="number" placeholder="0" {...register("chest")} disabled={isSubmitting} />
              </Field>
              <Field>
                <FieldLabel>Shoulder</FieldLabel>
                <Input type="number" placeholder="0" {...register("shoulder")} disabled={isSubmitting} />
              </Field>
              <Field>
                <FieldLabel>Sleeve</FieldLabel>
                <Input type="number" placeholder="0" {...register("sleeve")} disabled={isSubmitting} />
              </Field>
            </div>

            <Field>
              <FieldLabel>Active (visible in feed)</FieldLabel>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSubmitting || isPending}>
              {isSubmitting || isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
