"use client"
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
import { useState } from "react"

export default function Category() {
    const utils = api.useUtils();
    const [name, setName] = useState('');
    const [categories] = api.category.getCategories.useSuspenseQuery();

    const createCategory = api.category.create.useMutation({
        onSuccess: async () => {
            await utils.category.invalidate();
            toast.success("Category created successfully!");
            setName('');
        },
        onError: () => {
            toast.error("Failed to submit Category. Please try again.");
        }
    });

    const handleSubmit = () => {
        if (name.trim()) {
            createCategory.mutate({ name: name });
        } else {
            toast.error("Category name cannot be empty.");
        }
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
                    <Button onClick={handleSubmit}><Plus /></Button>
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
                                <TableCell className="flex gap-2"><Pencil size={15} /><Trash2 size={15} color="red" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}