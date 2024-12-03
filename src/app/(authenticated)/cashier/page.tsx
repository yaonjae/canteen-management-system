"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoaderCircle, LogOut, Minus, Plus } from "lucide-react";
import { api } from "@/trpc/react";
import CardLoaderCashier from "@/app/_components/card-loader-cashier";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  getFormattedDate,
  getFormattedDateDay,
} from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "@/lib/store/app";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Receipt from "@/app/_components/receipt";

const Cashier = () => {
  const { user } = useStore();
  const { toast } = useToast();
  const { data: categories } = api.product.getCategories.useQuery();
  const { data: customers } = api.cashier.getCustomer.useQuery();
  const {
    data: products,
    isLoading,
    refetch,
  } = api.cashier.getProducts.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [loader, setLoader] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState<number | "">(0);
  const [change, setChange] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [orderSummary, setOrderSummary] = useState<
    Map<string, { count: number; price: number }>
  >(new Map());
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const { data: customerName } = api.customer.getCustomerById.useQuery(
    { id: String(value) },
    { enabled: Boolean(value) },
  );

  const totalAmount = Array.from(orderSummary.values()).reduce(
    (total, { count, price }) => total + count * (isNaN(price) ? 0 : price),
    0,
  );

  const handleIncreaseQuantity = (productName: string) => {
    setOrderSummary((prev) => {
      const newSummary = new Map(prev);
      const currentItem = newSummary.get(productName) || { count: 0, price: 0 };
      newSummary.set(productName, {
        count: currentItem.count + 1,
        price: currentItem.price,
      });
      return newSummary;
    });
  };

  const handleDecreaseQuantity = (productName: string) => {
    setOrderSummary((prev) => {
      const newSummary = new Map(prev);
      const currentItem = newSummary.get(productName) || { count: 0, price: 0 };

      if (currentItem.count === 1) {
        newSummary.delete(productName);
      } else {
        newSummary.set(productName, {
          count: currentItem.count - 1,
          price: currentItem.price,
        });
      }

      if (newSummary.size === 0) {
        setPaymentMode("CASH");
      }

      return newSummary;
    });
  };

  const createOrder = api.cashier.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Order created successfully!",
        description: getFormattedDate(),
      });
      orderSummary.clear();
      setPaymentMode("CASH");
      setLoader(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to create order. Please try again.",
        description: getFormattedDate(),
      });
      setLoader(false);
    },
  });

  const logout = async () => {
    await axios.post("/api/auth/logout");
    window.location.href = "/";
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  const clearOrderSummary = () => {
    setOrderSummary(new Map());
    setPaymentMode("CASH");
  };

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!selectedCategory ||
        product.category_id.toString() === selectedCategory),
  );

  const handleProductClick = (productId: string) => {
    const product = products?.find((prod) => prod.id.toString() === productId);
    if (product) {
      setOrderSummary((prev) => {
        const newSummary = new Map(prev);
        const currentItem = newSummary.get(product.name) || {
          count: 0,
          price: Number(product.amount),
        };
        const validPrice = isNaN(currentItem.price) ? 0 : currentItem.price;
        newSummary.set(product.name, {
          count: currentItem.count + 1,
          price: validPrice,
        });
        return newSummary;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCashReceived(isNaN(value) ? "" : value);
  };

  const onSubmit = async () => {
    if (paymentMode === "CREDIT" && !value) {
      toast({
        variant: "destructive",
        title:
          "Failed to order product. The Customer field is required if the payment mode is Credit. Please try again.",
      });
      return;
    }

    if (
      paymentMode === "CASH" &&
      (typeof cashReceived === "string" ? Number(cashReceived) : cashReceived) <
        totalAmount
    ) {
      toast({
        variant: "destructive",
        title:
          "Failed to order product. Cash received is insufficient. Please try again.",
      });
      return;
    }

    const orderDetails = Array.from(orderSummary.entries()).map(
      ([productName, { count, price }]) => {
        const product = products?.find((prod) => prod.name === productName);
        return {
          productId: product?.id ?? 0,
          quantity: count,
          price: price,
          total: count * price,
        };
      },
    );

    const payload = {
      cashierId: user?.id ?? 0,
      transactionType: paymentMode as "CASH" | "CREDIT",
      totalCost: totalAmount,
      totalPaid: cashReceived || 0,
      orders: orderDetails,
      ...(paymentMode === "CREDIT" && { customerId: value }),
    };

    const lineWidth = 34;

    const centerText = (text: string): string => {
      const padding = Math.floor((lineWidth - text.length) / 2);
      return " ".repeat(padding > 0 ? padding : 0) + text;
    };

    let textData: string[];

    if (paymentMode === "CASH") {
      console.log(getFormattedDateDay());
      
      textData = [
        '\n',
        `${centerText("Canteen Payment")}\n`,
        `${centerText("Management System")}\n\n`,
        `Date: ${getFormattedDateDay()}\n`,
        `Cashier: ${user?.username}\n`,
        `Payment Mode: ${paymentMode}\n`,
        `\nItems:\n`,
        ...Array.from(orderSummary.entries()).map(
          ([productName, { count, price }]) =>
            `${productName} x ${count} = PHP ${(count * price).toFixed(2)}\n`,
        ),
        `\nTotal: PHP ${totalAmount.toFixed(2)}\n`,
        `Received: PHP ${(cashReceived || 0).toFixed(2)}\n`,
        `Change: PHP ${(change > 0 ? change : 0).toFixed(2)}\n`,
        `\nThank you for your purchase!\n`,
        "\n\n\n",
      ];
    } else {
      const fullName = customerName?.first_name + " " + customerName?.last_name;
      textData = [
        '\n',
        `${centerText("Canteen Payment")}\n`,
        `${centerText("Management System")}\n\n`,
        `Date: ${getFormattedDateDay()}\n`,
        `Cashier: ${user?.username}\n`,
        `Customer: ${fullName}\n`,
        `Payment Mode: ${paymentMode}\n`,
        `\nItems:\n`,
        ...Array.from(orderSummary.entries()).map(
          ([productName, { count, price }]) =>
            `${productName} x ${count} = PHP ${(count * price).toFixed(2)}\n`,
        ),
        `\nTotal: PHP ${totalAmount.toFixed(2)}\n`,
        `\nThank you for your purchase!\n`,
        "\n\n\n",
      ];
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        // acceptAllDevices: true,
        filters: [{ name: "POS58DB55A" }],
        optionalServices: ["e7810a71-73ae-499d-8c15-faa9aef0c3f2"],
        // optionalServices: ["49535343-fe7d-4ae5-8fa9-9fafd205e455"],
      });

      if (!device.gatt) {
        throw new Error("Selected device does not support GATT.");
      }

      console.log("Attempting to connect to GATT server...");
      const server = await device.gatt.connect();
      console.log("Connected to GATT server");
      // server.disconnect(); return;
      const service = await server.getPrimaryService(
        "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
        // "49535343-fe7d-4ae5-8fa9-9fafd205e455",
      );
      console.log("Service found");
      const characteristic = await service.getCharacteristic(
        "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f",
        // "49535343-aca3-481c-91ec-d85e28a60318",
      );
      console.log("Characteristic found");

      const encoder = new TextEncoder();
      for (const text of textData) {
        const encodedText = encoder.encode(text);
        await characteristic.writeValue(encodedText);
      }

      console.log("Receipt printed successfully");
      server.disconnect();
      console.log("Disconnected from GATT server");
    } catch (error) {
      console.error("Bluetooth error:", error);
    }

    // await createOrder.mutateAsync({
    //   ...payload,
    // });
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (cashReceived !== "" && !isNaN(cashReceived)) {
      setChange(cashReceived - totalAmount);
    } else {
      setChange(0);
    }
  }, [cashReceived, totalAmount]);

  return (
    <div className="mx-auto max-w-7xl pt-5">
      <div className="flex items-center justify-between">
        <p className="font-bold uppercase">{user?.username}</p>
        <Button onClick={logout}>
          <LogOut />
          Logout
        </Button>
      </div>
      <div className="flex gap-2 py-5">
        <div className="w-8/12 flex-1 space-y-4">
          <div className="flex items-center justify-start gap-2">
            <Input
              className="w-72"
              placeholder="Search Name"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Select
              value={selectedCategory ?? ""}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories?.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap justify-start gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <CardLoaderCashier key={index} />
              ))
            ) : filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative size-48 rounded-lg shadow transition-transform duration-200 ease-in-out hover:scale-105"
                  onClick={() => handleProductClick(product.id.toString())}
                >
                  <img
                    src={product.image_url}
                    alt=""
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <p className="absolute bottom-0 left-0 flex w-full items-center justify-between rounded-b-lg bg-gradient-to-b from-transparent to-blue-950 p-3 pt-14 text-sm text-white">
                    <span>{product.name}</span>
                    <span>{formatCurrency(product.amount)}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="w-full py-10 text-center text-gray-500">
                No products available
              </p>
            )}
          </div>
        </div>
        <Card className="w-4/12 flex-none self-start">
          <CardHeader className="bg-slate-100">
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Review items and total before checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orderSummary.size > 0 ? (
              <div className="pt-5">
                {Array.from(orderSummary.entries()).map(
                  ([productName, { count, price }]) => {
                    const validPrice = isNaN(price) ? 0 : price;
                    return (
                      <div
                        key={productName}
                        className="grid grid-cols-4 items-center py-2"
                      >
                        <p className="col-span-2 flex items-center text-left text-sm">
                          <Plus
                            onClick={() => handleIncreaseQuantity(productName)}
                          />
                          <Minus
                            onClick={() => handleDecreaseQuantity(productName)}
                          />
                          {productName}
                        </p>
                        <p className="text-center text-sm">
                          {count} x {formatCurrency(validPrice)}
                        </p>
                        <p className="text-right text-sm">
                          {formatCurrency(count * validPrice)}
                        </p>
                      </div>
                    );
                  },
                )}
                <Separator />
                <div className="flex items-center justify-between pt-4 font-bold">
                  <p className="text-sm">Total</p>
                  <p className="text-sm">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="space-y-5 pt-7">
                  <RadioGroup
                    defaultValue="CASH"
                    className="flex gap-5"
                    onValueChange={setPaymentMode}
                  >
                    <Label className="w-32">Payment Mode:</Label>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CASH" id="cash" />
                      <Label htmlFor="cash">CASH</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CREDIT" id="credit" />
                      <Label htmlFor="credit">CREDIT</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center justify-start gap-2">
                    <Label className="w-56">Customer:</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                        >
                          {value
                            ? `${customers?.find((customer) => customer.id === value)?.id} | ${customers?.find((customer) => customer.id === value)?.last_name}, ${customers?.find((customer) => customer.id === value)?.first_name}`
                            : "Select Customer"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search ID" />
                          <CommandList>
                            <CommandEmpty>No framework found.</CommandEmpty>
                            <CommandGroup>
                              {customers?.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.id}
                                  onSelect={(currentValue) => {
                                    setValue(
                                      currentValue === value
                                        ? ""
                                        : currentValue,
                                    );
                                    setOpen(false);
                                  }}
                                >
                                  {customer.id} | {customer.last_name},{" "}
                                  {customer.first_name}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      value === customer.id
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  {paymentMode === "CASH" && (
                    <>
                      <div className="flex items-center justify-start gap-2">
                        <Label className="w-56">Cash Received:</Label>
                        <Input
                          value={cashReceived === "" ? "" : cashReceived}
                          onChange={handleChange}
                          placeholder="Enter cash received"
                          type="number"
                        />
                      </div>
                      <div className="flex items-center justify-start gap-2">
                        <Label className="w-56">Change:</Label>
                        <Input
                          value={formatCurrency(change > 0 ? change : 0)}
                          readOnly
                          placeholder="0.00"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="destructive" onClick={clearOrderSummary}>
                    Cancel
                  </Button>
                  <Button onClick={() => onSubmit()}>
                    {loader ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      "Checkout"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="py-5 text-center">No items in the order summary.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cashier;
