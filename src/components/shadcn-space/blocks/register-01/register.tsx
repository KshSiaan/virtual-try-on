"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const registerSchema = z.object({
  name: z.string().min(2, "Min 2 chars"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Min 6 chars"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);

    try {
      await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
        },
        {
          onError: (error) => {
            toast.error(error.error.message);
          },
          onSuccess: () => {
            toast.success("Registration successful!");
            router.push("/auth/signin");
          },
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-foreground dark:bg-background relative flex min-h-screen items-center justify-center">
      <div className="pointer-events-none absolute inset-0 right-0 hidden overflow-hidden md:block">
        <div className="absolute left-1/1 top-0 h-650 w-650 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
        <div className="absolute left-1/1 top-0 h-175 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground dark:bg-background" />
      </div>

      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-0 md:py-20">
        <Card className="relative max-w-lg px-6 py-8 sm:p-12">
          <CardHeader className="gap-6 p-0 text-center">
            <div className="mx-auto">
              <Link href="/">
                <Image src="/logo.png" height={64} width={64} alt="icon" />
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl font-medium text-card-foreground">
                Signup to Virtual Try-On
              </CardTitle>
              <CardDescription className="text-sm font-normal text-muted-foreground">
                Signup to your account now
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup className="gap-6">
                <div className="flex flex-col gap-4">
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="name"
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Name*
                    </FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="enter your name"
                      {...register("name")}
                      disabled={isSubmitting}
                      className="dark:bg-background h-9 shadow-xs"
                    />
                    {errors.name && (
                      <span className="text-sm text-red-500">
                        {errors.name.message}
                      </span>
                    )}
                  </Field>

                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="email"
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Email*
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@shadcnspace.com"
                      {...register("email")}
                      disabled={isSubmitting}
                      className="dark:bg-background h-9 shadow-xs"
                    />
                    {errors.email && (
                      <span className="text-sm text-red-500">
                        {errors.email.message}
                      </span>
                    )}
                  </Field>

                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="password"
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Password*
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      {...register("password")}
                      disabled={isSubmitting}
                      className="dark:bg-background h-9 shadow-xs"
                    />
                    {errors.password && (
                      <span className="text-sm text-red-500">
                        {errors.password.message}
                      </span>
                    )}
                  </Field>
                </div>

                <Field className="gap-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="h-10 cursor-pointer rounded-lg hover:bg-primary/80 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Signing up..." : "Sign up"}
                  </Button>
                  <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/auth/signin"
                      className="font-medium text-card-foreground no-underline!"
                    >
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RegisterForm;
