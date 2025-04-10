"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios"
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  // role: z.string(),
  username: z.string().min(5, { message: "Username must be at least 5 characters" }),
  password: z.string().min(5, { message: "Password must be at least 5 characters" }),
});

export default function LoginForm() {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // role: "cashier",
      username: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = await axios.post('/api/auth/login', {
        ...values
      });
      localStorage.setItem("user", JSON.stringify(data.data.user || null));
      if (data.status === 200) {
        toast({
          title: "Login successful",
        });
        setTimeout(function () {
          window.location.href = '/';
        }, 3000)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Incorrect login credentials",
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="px-10 space-y-5 flex flex-col"
      >
        {/* <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit"><LogIn />Login</Button>
      </form>
    </Form>
  );
}