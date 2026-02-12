import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState, useRef } from "react";
import { holidaySchema, type Holiday } from "@shared/schema";

const formSchema = z.object({
  hoursPerDay: z.number().min(1, "Hours per day must be at least 1").max(24, "Hours per day cannot exceed 24"),
  daysPerWeek: z.number().min(1, "Days per week must be at least 1").max(7, "Days per week cannot exceed 7"),
  holidays: z.array(holidaySchema),
});

type FormValues = z.infer<typeof formSchema>;

interface CapacitySettingsProps {
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

export default function CapacitySettings({
  initialData,
  onSubmit,
  onCancel,
}: CapacitySettingsProps) {
  const [holidayStartDate, setHolidayStartDate] = useState("");
  const [holidayEndDate, setHolidayEndDate] = useState("");
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hoursPerDay: initialData?.hoursPerDay || 8,
      daysPerWeek: initialData?.daysPerWeek || 5,
      holidays: initialData?.holidays || [],
    },
  });

  const holidays = form.watch("holidays");

  const handleAddHoliday = () => {
    const startValue = startDateRef.current?.value || holidayStartDate;
    const endValue = endDateRef.current?.value || holidayEndDate;
    
    if (startValue && endValue) {
      if (new Date(startValue) > new Date(endValue)) {
        return;
      }
      
      const newHoliday: Holiday = {
        id: crypto.randomUUID(),
        startDate: startValue,
        endDate: endValue,
      };
      
      form.setValue("holidays", [...holidays, newHoliday]);
      setHolidayStartDate("");
      setHolidayEndDate("");
      if (startDateRef.current) startDateRef.current.value = "";
      if (endDateRef.current) endDateRef.current.value = "";
    }
  };

  const handleRemoveHoliday = (idToRemove: string) => {
    form.setValue("holidays", holidays.filter(h => h.id !== idToRemove));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hoursPerDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hours per Day</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    data-testid="input-hours-per-day"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="daysPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days per Week</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    data-testid="input-days-per-week"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel>Holiday Periods</FormLabel>
          <FormDescription>
            Add date ranges that should be marked as holidays in the timeline
          </FormDescription>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-2 flex-1 min-w-[200px]">
              <Input
                ref={startDateRef}
                type="date"
                value={holidayStartDate}
                onChange={(e) => setHolidayStartDate(e.target.value)}
                placeholder="Start date"
                data-testid="input-holiday-start-date"
              />
              <Input
                ref={endDateRef}
                type="date"
                value={holidayEndDate}
                onChange={(e) => setHolidayEndDate(e.target.value)}
                placeholder="End date"
                data-testid="input-holiday-end-date"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddHoliday}
              variant="secondary"
              data-testid="button-add-holiday"
            >
              Add
            </Button>
          </div>

          {holidays.length > 0 && (
            <div className="space-y-2 mt-3">
              {holidays.map((holiday) => {
                const startDate = new Date(holiday.startDate + 'T00:00:00');
                const endDate = new Date(holiday.endDate + 'T00:00:00');
                const isSingleDay = holiday.startDate === holiday.endDate;
                
                return (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                    data-testid={`holiday-item-${holiday.id}`}
                  >
                    <span className="text-sm">
                      {isSingleDay 
                        ? startDate.toLocaleDateString()
                        : `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                      }
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveHoliday(holiday.id)}
                      className="h-6 w-6"
                      data-testid={`button-remove-holiday-${holiday.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-testid="button-cancel-settings"
          >
            Cancel
          </Button>
          <Button type="submit" data-testid="button-save-settings">
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}
