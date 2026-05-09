import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Grid2,
  Tooltip,
  Typography,
} from '@mui/material';
import api from '../../utils/api';
import { useEffect, useState } from 'react';
import { ProductPos } from '../../types/productsPos';

type ProductsGridViewProps = {
  searchTerm: string;
  onSelectProduct: (product: ProductPos) => void;
};

export function ProductsGridView({
  searchTerm,
  onSelectProduct,
}: ProductsGridViewProps) {
  const [productsData, setProductsData] = useState<ProductPos[]>([]);
  const agency = localStorage.getItem('agency_employee');
  const agencyId = agency ? parseInt(agency, 10) : null;
  const api_url = import.meta.env.VITE_API_URL

  useEffect(() => {
    api
      .get('/products')
      .then(async (response) => {
        const products = response.data;

        const productPromises = products.map(
          (product: Omit<ProductPos, 'quantity'>) =>
            api
              .get(`/stocks/existencias_sucursal`, {
                params: {
                  id_producto: product.id_producto,
                  id_sucursal: agencyId,
                },
              })
              .then((existenceResponse) => ({
                ...product,
                imagen: product.imagen.replace('http://localhost:3000', api_url),
                existences: existenceResponse?.data ?? 0,
                quantity: 1,
              }))
              .catch((error) => {
                console.error(
                  `Error obteniendo existencias de producto ${product.id_producto}`,
                  error,
                );
                return { ...product, existences: 0, quantity: 1 };
              }),
        );

        const productsWithExistences = await Promise.all(productPromises);

        setProductsData(productsWithExistences);
      })
      .catch((error) => {
        console.error('Error obteniendo productos', error);
      });
  }, []);

  const filteredProducts = productsData.filter((product) =>
    product.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box
      sx={{
        mt: 3,
        mx: 'auto',
        maxWidth: 1200,
        height: 'calc(100vh - 320px)',
        overflowY: 'auto',
      }}
    >
      <Grid2 container spacing={3}>
        {filteredProducts
          .filter((product) => product.existences > 0)
          .map((product) => {
            return (
              <Grid
                key={product.id_producto}
                item
                xs={12}
                sm={6}
                md={4}
                lg={4}
                sx={{ '&:hover': { cursor: 'pointer' } }}
                onClick={() => onSelectProduct(product)}
              >
                <Tooltip title={`Disponible: ${product.existences} unidades`}>
                  <Card
                    className="dark:bg-boxdark"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      boxShadow: 'var(--mui-shadows-16)',
                      '&:hover': { boxShadow: 'var(--mui-shadows-16)' },
                    }}
                  >
                    {product.imagen !== 'http://localhost:3000/' ? (
                      <CardMedia
                        component="img"
                        image={product.imagen}
                        alt={product.imagen}
                        sx={{ width: 'auto', height: 110, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 110,
                          bgcolor: 'var(--mui-palette-background-level2)',
                        }}
                      />
                    )}
                    <CardContent>
                      <Typography noWrap variant="subtitle2"  className='text-black dark:text-white'>
                        {product.nombre_producto}
                      </Typography>
                      <Typography
                         className='text-black dark:text-white'
                        variant="caption"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {product.nombre_categoria}
                      </Typography>
                      <Typography  className='text-black dark:text-white' variant="h6">
                        {new Intl.NumberFormat('es-GT', {
                          style: 'currency',
                          currency: 'GTQ',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        }).format(product.precio_venta)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            );
          })}
      </Grid2>
    </Box>
  );
}
