import React from "react";
import { Printer } from "react-thermal-printer";

type OrderSummaryItem = {
  productName: string;
  count: number;
  price: number;
};

type ReceiptProps = {
  cashierName: string;
  transactionType: string;
  orderSummary: Map<string, OrderSummaryItem>;
  totalAmount: number;
  cashReceived?: number;
  change?: number;
  customerName?: string;
};

const Receipt: React.FC<ReceiptProps> = ({
  cashierName,
  transactionType,
  orderSummary,
  totalAmount,
  cashReceived,
  change,
  customerName,
}) => {
  const formattedDate = new Date().toLocaleString();
  const MAX_CHARS = 32;

  const centerText = (text: string) => {
    const padding = Math.max(0, (MAX_CHARS - text.length) / 2);
    return text.padStart(Math.floor(padding + text.length)).padEnd(MAX_CHARS);
  };

  return (
    <Printer type="epson">
      <text>{centerText("Company Name")}</text>
      <text>{centerText("Address Line 1")}</text>
      <text>{centerText("Address Line 2")}</text>
      <text>{centerText(formattedDate)}</text>
      <text>{centerText("====================")}</text>
      <text>
        Cashier: {cashierName}
        {"\n"}Transaction: {transactionType}
      </text>
      {customerName && <text>Customer: {customerName}</text>}
      <text>{centerText("--------------------")}</text>
      {Array.from(orderSummary.entries()).map(([productName, { count, price }]) => (
        <text key={productName}>
          {productName} {count} x {price.toFixed(2)} = {(count * price).toFixed(2)}
        </text>
      ))}
      <text>{centerText("====================")}</text>
      <text>
        Total: {totalAmount.toFixed(2)}
        {cashReceived !== undefined && `\nCash Received: ${cashReceived.toFixed(2)}`}
        {change !== undefined && `\nChange: ${change.toFixed(2)}`}
      </text>
      <text>{centerText("====================")}</text>
      <text>{centerText("Thank you for your purchase!")}</text>
    </Printer>
  );
};

export default Receipt;