
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { Loader2 } from 'lucide-react';

interface ReportFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  userFilter: string;
  setUserFilter: (value: string) => void;
  isAdmin: boolean;
  loading: boolean;
  onRefresh: () => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  dateRange,
  setDateRange,
  userFilter,
  setUserFilter,
  isAdmin,
  loading,
  onRefresh
}) => {
  return (
    <Card className="bg-black/20 border-white/10">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>Defina o período para análise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium block mb-2">Período</label>
            <DatePickerWithRange 
              date={dateRange} 
              setDate={setDateRange} 
            />
          </div>
          
          {isAdmin && (
            <div>
              <label className="text-sm font-medium block mb-2">Usuário</label>
              <Select 
                value={userFilter} 
                onValueChange={setUserFilter}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent className="bg-pagora-dark border-white/10">
                  <SelectGroup>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={onRefresh}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Atualizar dados
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
