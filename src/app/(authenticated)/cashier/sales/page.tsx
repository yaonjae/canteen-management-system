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
import reportLogo from "@/app/images/reportlogo.png";
import Image from "next/image";
import { Input } from "@/components/ui/input";

const groupedOrders = new Map<
  string,
  {
    category: string;
    price: number;
    quantity: number;
    totalSales: number;
  }
>();

const Sales = () => {
  const router = useRouter();
  const { user } = useStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [dateRangeProduct, setDateRangeProduct] = useState<
    DateRange | undefined
  >();
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [totalSales, setTotalSales] = useState(0);
  const [totalSalesProduct, setTotalSalesProduct] = useState(0);
  const [productSales, setProductSales] = useState<any[]>([]);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const tableRefProduct = useRef<HTMLDivElement | null>(null);
  const [preparedByOverall, setPreparedByOverall] = useState("");
  const [preparedByProduct, setPreparedByProduct] = useState("");

  const {
    data: products,
    isLoading,
    refetch,
  } = api.transaction.getProducts.useQuery();

  const { data: productSalesData } = api.transaction.getSalesByProduct.useQuery(
    {
      date_range: dateRangeProduct
        ? {
          from: dateRangeProduct.from ?? null,
          to: dateRangeProduct.to ?? null,
        }
        : undefined,
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

  sales.forEach((sale) => {
    sale.Orders.forEach((order) => {
      const productName = order.Product.name;
      const category = order.Product.Category.name;
      const price = order.ProductPrice.amount || 0;
      const quantity = order.quantity;
      const totalSales = price * quantity;

      if (groupedOrders.has(productName)) {
        const existing = groupedOrders.get(productName)!;
        existing.quantity += quantity;
        existing.totalSales += totalSales;
      } else {
        groupedOrders.set(productName, {
          category,
          price,
          quantity,
          totalSales,
        });
      }
    });
  });

  const formattedDateRange = dateRange
    ? `${dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : ""} - ${dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : ""}`
    : "All";

  const formattedDateRangeProduct = dateRangeProduct
    ? `${dateRangeProduct.from ? format(dateRangeProduct.from, "MMM dd, yyyy") : ""} - ${dateRangeProduct.to ? format(dateRangeProduct.to, "MMM dd, yyyy") : ""}`
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
    let total = 0;
    groupedOrders.forEach((order) => {
      total += order.totalSales;
    });
    setTotalSales(total);
  }, [sales]);

  useEffect(() => {
    if (!productSalesData) return;

    const total = productSalesData.reduce((sum, sale) => {
      const price =
        sale.Orders.reduce((c, a) => c + a.ProductPrice.amount, 0) || 0;
      const subtotal = sale.Orders.reduce((c, a) => a.quantity * price + c, 0);
      return sum + subtotal;
    }, 0);

    setTotalSalesProduct(total);
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
              <div className="flex items-center justify-between">
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
                <div className="flex gap-2 justify-center items-center">
                  <Input
                    placeholder="Prepared By..."
                    value={preparedByOverall}
                    onChange={(e) => setPreparedByOverall(e.target.value)}
                  />
                  <Button onClick={() => handlePrint()} disabled={!preparedByOverall.trim()}>
                    Print
                  </Button>
                </div>
              </div>
              <div
                className="no-scroll-print max-h-[500px] overflow-y-auto"
                ref={tableRef}
              >
                <div className="print-block hidden">
                  <div className="relative flex flex-col text-center">
                    <Image
                      src={reportLogo}
                      alt="Login"
                      className="absolute left-36 top-4 size-16"
                    />
                    <p>Republic of the Philippines</p>
                    <p className="font-bold">
                      Bohol Island State University
                      <br />
                      Balilihan Campus
                    </p>
                    <p>Magsija, Balilihan Bohol</p> <br />
                    <p className="font-bold">SALES RECORD</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p>
                        <strong>Date Range:</strong> {formattedDateRange}
                      </p>
                      <p>
                        <strong>Total: </strong>
                        {formatCurrency(totalSales)}
                      </p>
                    </div>
                  </div>
                </div>
                <Table className="min-w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Product Name</TableHead>
                      <TableHead className="w-1/4">Category</TableHead>
                      <TableHead className="w-1/4">Price</TableHead>
                      <TableHead className="w-1/4">Quantity</TableHead>
                      <TableHead className="w-1/4">Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedOrders.size === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No sales available
                        </TableCell>
                      </TableRow>
                    ) : (
                      Array.from(groupedOrders.entries())
                        .filter(([, data]) => data.totalSales > 0)
                        .map(([productName, data]) => (
                          <TableRow key={productName}>
                            <TableCell className="w-1/4">
                              {productName}
                            </TableCell>
                            <TableCell className="w-1/4">
                              {data.category}
                            </TableCell>
                            <TableCell className="w-1/4">
                              {formatCurrency(data.price)}
                            </TableCell>
                            <TableCell className="w-1/4">
                              {data.quantity}
                            </TableCell>
                            <TableCell className="w-1/4">
                              {formatCurrency(data.totalSales)}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
                <div className="print-block hidden">
                  <div className="mt-10 flex w-52 flex-col">
                    <p>Prepared By:</p>
                    <br />
                    <p className="w-full text-center uppercase font-bold">{preparedByOverall || ""}</p>
                    <hr className="border-black" />
                    <p className="w-full text-center">The administrator</p>
                  </div>
                </div>
              </div>
              <div className="">
                <p className="text-end">
                  <strong>Total: </strong>
                  {formatCurrency(totalSales)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="product" className="flex w-full items-start gap-4">
          <Card className="flex-1">
            <CardHeader></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-start">
                  <Label className="w-32">Date Range:</Label>
                  <DatePickerWithRange
                    className="w-[300px]"
                    dateRange={dateRangeProduct}
                    onDateChange={(e) =>
                      setDateRangeProduct({
                        from: e?.from,
                        to: e?.to ? endOfDay(e.to) : undefined,
                      })
                    }
                  />
                </div>
                <div className="flex gap-2 justify-center items-center">
                  <Input
                    placeholder="Prepared By..."
                    value={preparedByProduct}
                    onChange={(e) => setPreparedByProduct(e.target.value)}
                  />
                  <Button onClick={() => handlePrintProduct()} disabled={!preparedByProduct.trim()}>
                    Print
                  </Button>
                </div>
              </div>
              <div
                className="no-scroll-print max-h-[500px] overflow-y-auto"
                ref={tableRefProduct}
              >
                <div className="print-block hidden">
                  <div className="relative flex flex-col text-center">
                    <Image
                      src={reportLogo}
                      alt="Login"
                      className="absolute left-36 top-4 size-16"
                    />
                    <p>Republic of the Philippines</p>
                    <p className="font-bold">
                      Bohol Island State University
                      <br />
                      Balilihan Campus
                    </p>
                    <p>Magsija, Balilihan Bohol</p> <br />
                    <p className="font-bold">SALES RECORD</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p>
                        <strong>Date Range:</strong> {formattedDateRangeProduct}
                      </p>
                      <p>
                        <strong>Total:</strong>{" "}
                        {formatCurrency(totalSalesProduct)}
                      </p>
                    </div>
                  </div>
                </div>
                <Table className="min-w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Product Name</TableHead>
                      <TableHead className="w-1/4">Category</TableHead>
                      <TableHead className="w-1/3">Price</TableHead>
                      <TableHead className="w-1/3">Quantity</TableHead>
                      <TableHead className="w-1/3">Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productSalesData?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No sales available
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {productSalesData
                          ?.filter((sale) => {
                            const subTotal = sale.Orders.reduce(
                              (c, a) => c + a.quantity * a.ProductPrice.amount,
                              0,
                            );
                            return subTotal > 0;
                          })
                          .map((sale) => {
                            const price =
                              sale.Orders[0]?.ProductPrice.amount || 0;
                            const quantity = sale.Orders.reduce(
                              (c, a) => c + a.quantity,
                              0,
                            );
                            const subTotal = sale.Orders.reduce(
                              (c, a) => c + a.quantity * a.ProductPrice.amount,
                              0,
                            );

                            return (
                              <TableRow key={sale.id}>
                                <TableCell className="w-1/4">
                                  {sale.name}
                                </TableCell>
                                <TableCell className="w-1/4">
                                  {sale.Category.name}
                                </TableCell>
                                <TableCell className="w-1/4">
                                  {formatCurrency(price)}
                                </TableCell>
                                <TableCell className="w-1/4">
                                  {quantity}
                                </TableCell>
                                <TableCell className="w-1/4">
                                  {formatCurrency(subTotal)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </>
                    )}
                  </TableBody>
                </Table>
                <div className="print-block hidden">
                  <div className="mt-10 flex w-52 flex-col">
                    <p>Prepared By:</p>
                    <br />
                    <p className="w-full text-center uppercase font-bold">{preparedByProduct || ""}</p>
                    <hr className="border-black" />
                    <p className="w-full text-center">The administrator</p>
                  </div>
                </div>
              </div>
              <div className="">
                <p className="text-end">
                  <strong>Total:</strong> {formatCurrency(totalSalesProduct)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;
