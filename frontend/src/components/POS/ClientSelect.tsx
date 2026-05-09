import {
  Button,
  Grid,
  Grid2,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import api from '../../utils/api';
import { Customer } from '../../types/customer';

type ClientSelectProps = {
  onCustomerSelect: (customer: Customer | null) => void;
};

export function ClientSelect({ onCustomerSelect }: ClientSelectProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFinded, setCustomerFinded] = useState<Customer>();

  const handleButtonClick = async () => {
    try {
      const response = await api.get(`/customers/correo/${customerSearch}`);
      setCustomerFinded(response.data);
      onCustomerSelect(response.data);
    } catch (error) {
      onCustomerSelect(null);
      setCustomerFinded(undefined);
      console.error(error);
    }
  };

  return (
    <Stack direction={'row'} spacing={2} sx={{ p: 1 }}>
      <OutlinedInput
        placeholder="Buscar cliente"
        value={customerSearch}
        onChange={(e) => {
          setCustomerSearch(e.target.value);
        }}
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
      <Button variant="contained" color="primary" onClick={handleButtonClick}>
        Buscar
      </Button>
      <Grid container md={5} xs={6} direction={'column'} spacing={1}>
        <Grid2>
          <Typography className='text-black dark:text-white' variant="h6" sx={{ textAlign: 'right' }}>
            {customerFinded?.nombre_cliente} - {customerFinded?.nit_cliente}
          </Typography>
          <Typography className='text-black dark:text-white' variant="body1" sx={{ textAlign: 'right' }}>
            {customerFinded?.direccion_cliente}
          </Typography>
        </Grid2>
      </Grid>
    </Stack>
  );
}
