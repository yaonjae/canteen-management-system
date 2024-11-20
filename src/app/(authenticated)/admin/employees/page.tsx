"use client";
import DeleteDialog from "@/app/_components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getFormattedDate } from "@/lib/utils";
import PaginationComponent from "@/app/_components/pagination";

const Employees = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: employeeData, refetch } = api.employee.getEmployees.useQuery({
    searchQuery,
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
  });

  const { employees, totalRecords } = employeeData || {};
  const totalPages = Math.ceil((totalRecords || 0) / itemsPerPage);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/add-employee?id=${id}`);
  };

  const confirmDelete = () => {
    if (selectedId !== null) {
      deleteEmployee.mutate({ id: selectedId });
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    }
  };

  const deleteEmployee = api.employee.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Employee deleted successfully!",
        description: getFormattedDate(),
      });
      refetch();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to delete employee. Please try again.",
        description: getFormattedDate(),
      });
    },
  });

  useEffect(() => {
    refetch();
  }, [currentPage]);

  return (
    <Card className="mx-auto max-w-4xl py-5">
      <CardHeader>
        <CardTitle>Employees</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            className="w-60"
            placeholder="Search Last Name"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Button onClick={() => router.push("/admin/add-employee")}>
            ADD
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No employees available.
                </TableCell>
              </TableRow>
            ) : (
              employees?.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>
                    {employee.last_name}, {employee.first_name}
                  </TableCell>
                  <TableCell>{employee.username}</TableCell>
                  <TableCell className="flex gap-2">
                    <Pencil size={15} onClick={() => handleEdit(employee.id)} />
                    <Trash2
                      size={15}
                      color="red"
                      onClick={() => handleDelete(employee.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        selection="Employee"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </Card>
  );
};

export default Employees;
