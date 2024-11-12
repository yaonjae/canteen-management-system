"use client"
import { useState } from "react";
import {
    toast
} from "sonner"
import {
    Button
} from "@/components/ui/button"
import {
    Input
} from "@/components/ui/input"
import { api } from "@/trpc/react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getFormattedDate } from "@/lib/utils";

export default function Category() {
    const utils = api.useUtils();
    const [name, setName] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
    const [categories] = api.category.getCategories.useSuspenseQuery();
    const { toast } = useToast()

    const createCategory = api.category.create.useMutation({
        onSuccess: async () => {
            await utils.category.invalidate();
            toast({
                title: "Category created successfully!",
                description: getFormattedDate(),
            })
            setName('');
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to submit Category. Please try again.",
                description: getFormattedDate(),
            })
        }
    });

    const updateCategory = api.category.updateCategory.useMutation({
        onSuccess: async () => {
            await utils.category.invalidate();
            toast({
                title: "Category updated successfully!",
                description: getFormattedDate(),
            })
            setName('');
            setEditId(null);
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to update Category. Please try again.",
                description: getFormattedDate(),
            })
        }
    });

    const deleteCategory = api.category.deleteCategory.useMutation({
        onSuccess: async () => {
            await utils.category.invalidate();
            toast({
                title: "Category deleted successfully!",
                description: getFormattedDate(),
            })
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to delete Category. Please try again.",
                description: getFormattedDate(),
            })
        }
    });

    const handleSubmit = () => {
        if (name.trim()) {
            if (editId) {
                updateCategory.mutate({ id: editId, name: name });
            } else {
                createCategory.mutate({ name: name });
            }
        } else {
            toast({
                variant: "destructive",
                title: "Category name cannot be empty.",
            })
        }
    };

    const handleEdit = (categoryId: number, categoryName: string) => {
        setEditId(categoryId);
        setName(categoryName);
    };

    const handleDelete = (categoryId: number) => {
        deleteCategory.mutate({ id: categoryId });
    };

    return (
        <Card className="max-w-3xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-start gap-2">
                    <Label className="w-28">Category Name:</Label>
                    <Input
                        className="w-72"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Button onClick={handleSubmit}>
                        {editId ? "Update" : <Plus />}
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-20">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="w-28">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>{category.id}</TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Pencil size={15} onClick={() => handleEdit(category.id, category.name)} />
                                    <Trash2 size={15} color="red" onClick={() => handleDelete(category.id)} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
