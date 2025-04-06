"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import formatDate, { formatCurrency } from "@/lib/utils";
import { endOfDay, format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import PaginationComponent from "@/app/_components/pagination";
import { useStore } from "@/lib/store/app";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Sales = () => {
  const router = useRouter();
  const { user } = useStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [productSales, setProductSales] = useState<any[]>([]);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const tableRefProduct = useRef<HTMLDivElement | null>(null);

  const {
    data: products,
    isLoading,
    refetch,
  } = api.transaction.getProducts.useQuery();

  const { data: productSalesData, isLoading: isProductSalesLoading } =
    api.transaction.getSalesByProduct.useQuery(
      {
        productId: selectedProduct ? parseInt(selectedProduct) : 0,
        date_range: dateRange
          ? { from: dateRange.from ?? null, to: dateRange.to ?? null }
          : undefined,
      },
      {
        enabled: !!selectedProduct,
      },
    );

  const { data: productOverviewData } =
    api.transaction.getSalesByProductOverview.useQuery(
      {
        productId: selectedProduct ? parseInt(selectedProduct) : 0,
        date_range: dateRange
          ? { from: dateRange.from ?? null, to: dateRange.to ?? null }
          : undefined,
      },
      {
        enabled: !!selectedProduct,
      },
    );

  const {
    data: {
      transaction: sales = [],
      totalcost = 0,
      totalcash = 0,
      totalcredit = 0,
      totalCount = 0,
    } = {},
  } = api.transaction.getAllSales.useQuery({
    date_range: dateRange
      ? { from: dateRange.from ?? null, to: dateRange.to ?? null }
      : undefined,
  });

  const { data: overviewData } = api.transaction.getSales.useQuery({
    date_range: dateRange
      ? { from: dateRange.from ?? null, to: dateRange.to ?? null }
      : undefined,
    page: 1,
    itemsPerPage: 100000,
  });

  const formattedDateRange = dateRange
    ? `${dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : ""} - ${dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : ""}`
    : "All";

  const handlePrint = useReactToPrint({
    contentRef: tableRef,
    documentTitle: "Sales Report",
  });

  const handlePrintProduct = useReactToPrint({
    contentRef: tableRefProduct,
    documentTitle: "Sales Report",
  });

  useEffect(() => {
    if (productSalesData) {
      setProductSales(productSalesData.transactions); // Set the fetched product sales to the state
    }
  }, [productSalesData]);

  return (
    <div className="mx-auto max-w-7xl items-start space-y-5 py-5">
      <div className="flex items-center justify-between">
        <p className="font-bold uppercase">{user?.username}</p>
        <Button onClick={() => router.push("/cashier")}>Back</Button>
      </div>
      <Tabs defaultValue="overall">
        <div className="flex items-center justify-between">
          <TabsList className="flex w-80">
            <TabsTrigger value="overall" className="flex-1">
              Overall
            </TabsTrigger>
            <TabsTrigger value="product" className="flex-1">
              Product
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overall" className="flex w-full items-start gap-4">
          <Card className="flex-1">
            <CardHeader></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-start">
                <Label className="w-32">Date Range:</Label>
                <DatePickerWithRange
                  className="w-[300px]"
                  dateRange={dateRange}
                  onDateChange={(e) =>
                    setDateRange({
                      from: e?.from,
                      to: e?.to ? endOfDay(e.to) : undefined,
                    })
                  }
                />
              </div>
              <div className="max-h-96 overflow-y-auto" ref={tableRef}>
                <div className="print-block hidden">
                  <div className="flex justify-between">
                    <div>
                      <p>
                        <strong>Date Range:</strong> {formattedDateRange}
                      </p>
                      <p>
                        <strong>Total:</strong>{" "}
                        {formatCurrency(overviewData?.totalcost || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <Table className="min-w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Payment Mode</TableHead>
                      <TableHead className="w-1/3">Total Cost</TableHead>
                      <TableHead className="w-1/3">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No sales available
                        </TableCell>
                      </TableRow>
                    ) : (
                      sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="w-1/3">
                            {sale.transaction_type}
                          </TableCell>
                          <TableCell className="w-1/3">
                            {formatCurrency(sale.total_cost)}
                          </TableCell>
                          <TableCell className="w-1/3">
                            {formatDate(sale.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-none">
            <CardHeader className="rounded-t bg-slate-100">
              <CardTitle className="text-lg">Overview</CardTitle>
              <CardDescription>
                {dateRange ? formattedDateRange : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="w-96 space-y-2 pt-5">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">Transaction Count</p>
                <p>{overviewData?.totalCount || 0}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">Total Cash</p>
                <p>{overviewData?.totalcash || 0}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">Total Credit</p>
                <p>{overviewData?.totalcredit || 0}</p>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-sm">
                <p className="font-bold">Total</p>
                <p>{formatCurrency(overviewData?.totalcost || 0)}</p>
              </div>
              <div className="flex w-full justify-end pt-3">
                <Button onClick={() => handlePrint()}>Print</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="product" className="flex w-full items-start gap-4">
          <Card className="flex-1">
            <CardHeader></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-start">
                <Label className="w-32">Product:</Label>
                <Select onValueChange={setSelectedProduct}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading">Loading...</SelectItem>
                    ) : (
                      products?.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
                          {product.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="max-h-96 overflow-y-auto" ref={tableRefProduct}>
                <div className="print-block hidden">
                  <div className="flex justify-between">
                    <div>
                      <p>
                        <strong>Product: </strong>
                        {products?.find(
                          (product) =>
                            product.id.toString() === selectedProduct,
                        )?.name || "N/A"}
                      </p>
                      <p>
                        <strong>Total:</strong>{" "}
                        {formatCurrency(productOverviewData?.totalcost || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <Table className="min-w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Payment Mode</TableHead>
                      <TableHead className="w-1/3">Total Cost</TableHead>
                      <TableHead className="w-1/3">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isProductSalesLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          Loading product sales...
                        </TableCell>
                      </TableRow>
                    ) : productSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No sales for this product
                        </TableCell>
                      </TableRow>
                    ) : (
                      productSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="w-1/3">
                            {sale.transaction_type}
                          </TableCell>
                          <TableCell className="w-1/3">
                            {formatCurrency(sale.total_cost)}
                          </TableCell>
                          <TableCell className="w-1/3">
                            {formatDate(sale.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-none">
            <CardHeader className="rounded-t bg-slate-100">
              <CardTitle className="text-lg">Product Sales Overview</CardTitle>
              <CardDescription>
                {dateRange ? formattedDateRange : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="w-96 space-y-2 pt-5">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">Transaction Count</p>
                <p>{productOverviewData?.totalCount || 0}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">Total Cash</p>
                <p>{productOverviewData?.totalcash || 0}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">Total Credit</p>
                <p>{productOverviewData?.totalcredit || 0}</p>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-sm">
                <p className="font-bold">Total</p>
                <p>{formatCurrency(productOverviewData?.totalcost || 0)}</p>
              </div>
              <div className="flex w-full justify-end pt-3">
                <Button onClick={() => handlePrintProduct()}>Print</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;
