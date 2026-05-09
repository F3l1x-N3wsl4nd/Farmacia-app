import {
  Card,
  CardContent,
  FormControl,
  Grid,
  Grid2,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { ProductsGridView } from './ProductsGridView';
import { ProductPos } from '../../types/productsPos';

type PosCenterHelperProps = {
  onSelectProduct: (product: ProductPos) => void;
  transactionType: (type: string) => void;
};

export function PosCenterHelper({
  onSelectProduct,
  transactionType,
}: PosCenterHelperProps) {
  const [searchTerm, setSeaarchTerm] = useState('');
  const [tipoTransaccion, setTipoTransaccion] = useState('V');

  const handleSearchChange = (event: any) => {
    setSeaarchTerm(event.target.value);
  };

  const handleTypeChange = (event: any) => {
    setTipoTransaccion(event.target.value);
    transactionType(event.target.value);
  };

  return (
    <Card
      className="dark:bg-boxdark"
      sx={{
        display: 'block',
        height: '100%',
        width: '100%',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Grid2 container spacing={3} alignItems="center">
            <Grid item md={9} xs={12}>
              <FormControl fullWidth>
                <OutlinedInput
                  placeholder="Buscar producto por nombre"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CCCCCC',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#999999',
                    },
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item md={3} xs={12}>
              <FormControl fullWidth>
                <Select
                  value={tipoTransaccion}
                  onChange={handleTypeChange}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CCCCCC',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#999999',
                    },
                  }}
                >
                  <MenuItem value="V">Venta</MenuItem>
                  <MenuItem value="C">Cotización</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid item md={12} xs={12}>
              <ProductsGridView
                searchTerm={searchTerm}
                onSelectProduct={onSelectProduct}
              />
            </Grid>
          </Grid2>
        </Stack>
      </CardContent>
    </Card>
  );
}
