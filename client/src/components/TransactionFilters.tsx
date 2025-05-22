import React from "react";
import { Box, TextField, MenuItem, Button } from "@mui/material";
import { CATEGORIES } from "../constants.tsx";

interface FilterValues {
  startDate: string;
  endDate: string;
  type: string;
  category: string;
}

interface Props {
  filters: FilterValues;
  onFilterChange: (name: string, value: string) => void;
  onReset: () => void;
}

const TransactionFilters: React.FC<Props> = ({
  filters,
  onFilterChange,
  onReset
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
      <TextField
        label="Od daty"
        type="date"
        name="startDate"
        value={filters.startDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        sx={{ flexGrow: 1, minWidth: "150px" }}
      />
      <TextField
        label="Do daty"
        type="date"
        name="endDate"
        value={filters.endDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        sx={{ flexGrow: 1, minWidth: "150px" }}
      />
      <TextField
        label="Typ"
        select
        name="type"
        value={filters.type}
        onChange={handleChange}
        sx={{ flexGrow: 1, minWidth: "150px" }}
      >
        <MenuItem value="">Wszystkie</MenuItem>
        <MenuItem value="income">Przychód</MenuItem>
        <MenuItem value="expense">Wydatek</MenuItem>
      </TextField>
      <TextField
        label="Kategoria"
        select
        name="category"
        value={filters.category}
        onChange={handleChange}
        sx={{ flexGrow: 1, minWidth: "150px" }}
      >
        <MenuItem value="">Wszystkie</MenuItem>
        {CATEGORIES.map(cat => (
          <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
        ))}
      </TextField>
      <Button
        variant="outlined"
        onClick={onReset}
        sx={{ flexGrow: 0 }}
      >
        Wyczyść filtry
      </Button>
    </Box>
  );
};

export default TransactionFilters;