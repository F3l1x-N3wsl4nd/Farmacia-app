export interface CreateProductTransferDto {
    id_transferencia: number;
  descripcion_transferencia: string;
  estado: number;
  created_at: string;
  updated_at: string;
  DetalleTransferencia: TransferDetail[];
  id_estado_transferencia: {
    id_estado_transferencia: number;
    nombre_estado_transferencia: string;
    estado: number;
  };
  sucursal_Entrante: {
    id_sucursal: number;
    nombre_sucursal: string;
    direccion_detallada: string;
    telefono: string;
    correo: string;
  };
  }
  
 export interface TransferDetail {
    id_detalle_transferencia: number;
    cantidad_transferencia: number;
    created_at: string;
    updated_at: string;
    nombre_producto: string; // Nuevo campo
  }