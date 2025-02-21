"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { bfhlFormSchema, type BfhlResponse } from "./lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type FilterType = "numbers" | "alphabets" | "highest";

export default function Home() {
  const { toast } = useToast();
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [result, setResult] = useState<BfhlResponse | null>(null);

  const form = useForm({
    resolver: zodResolver(bfhlFormSchema),
    defaultValues: {
      data: `{"data": []}`
    }
  });

  const processArray = useMutation({
    mutationFn: async (data: string[]) => {
      const response = await fetch('/api/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        description: "Array processed successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to process array",
      });
    }
  });

  const onSubmit = (values: { data: string }) => {
    try {
      const jsonInput = JSON.parse(values.data);
      if (Array.isArray(jsonInput.data)) {
        processArray.mutate(jsonInput.data);
      } else {
        throw new Error("Invalid JSON format");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Invalid JSON input format. Expected: { \"data\": [\"value1\", \"value2\", ...] }",
      });
    }
  };

  const toggleFilter = (filter: FilterType) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const getFilteredData = () => {
    if (!result) return [];

    // If no filters are active, show all unique items
    if (activeFilters.length === 0) {
      const allItems = new Set([...result.numbers, ...result.alphabets]);
      return Array.from(allItems);
    }

    // Create a Set to store unique filtered items
    const filteredSet = new Set<string>();

    if (activeFilters.includes("numbers")) {
      result.numbers.forEach(num => filteredSet.add(num));
    }
    if (activeFilters.includes("alphabets")) {
      result.alphabets.forEach(alpha => filteredSet.add(alpha));
    }
    if (activeFilters.includes("highest")) {
      result.highest_alphabet.forEach(high => filteredSet.add(high));
    }

    return Array.from(filteredSet);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>API Input Processor</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder='Enter JSON request: { "data": ["M", "1", "334", "4", "B"] }'
                          className="min-h-[100px] font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={processArray.isPending}
                >
                  Process Array
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Filtered Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Select filters to view specific data:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["numbers", "alphabets", "highest"].map((filter) => (
                    <Badge
                      key={filter}
                      variant={activeFilters.includes(filter as FilterType) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter(filter as FilterType)}
                    >
                      {filter}
                      {activeFilters.includes(filter as FilterType) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {getFilteredData().map((item, index) => (
                  <div
                    key={index}
                    className="bg-muted p-3 rounded-md text-center font-mono"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>User ID: {result.user_id}</p>
                <p>Email: {result.email}</p>
                <p>Roll Number: {result.roll_number}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}