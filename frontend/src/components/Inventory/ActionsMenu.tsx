 import React from 'react';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';
import { Product } from '../../types/product';
import Dialog from '@mui/material/Dialog';
import EyeIcon from '../../icons/Eye';
import Alert from '@mui/material/Alert';
import PenIcon from '../../icons/Pen';
import TrashIcon from '../../icons/Trash';
import {
  Button,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import FormEdit from './FormEdit';

const ActionsMenu = (rowData: Product) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleEdit = async () => {
    setEditMode(true);
  };

  const handleDelete = async () => {
    setOpenDialog(true);
  };

const token = localStorage.getItem('token');

interface State extends SnackbarOrigin {
  open: boolean;
}


const [state, setState] = React.useState<State>({
    open: false,
    vertical: 'bottom',
    horizontal: 'right',
  });
  const { vertical, horizontal, open } = state;





  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/medicamentos/${rowData.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`,
        } 
       
      });

      if (response.ok) {
          setState({ ...state, open: true });
      } else {
        alert(` Erro ao eliminar o produto "${rowData.nome}".`);
      }
    } catch (error) {
      console.error(error);
      alert(' Ocorreu um erro de conexão com o servidor.');
    } finally {
      setOpenDialog(false);
    }
  };


 const handleClose = () => {
    setState({ ...state, open: false });
  };

  return (
    <div>
      <div className="flex items-center space-x-3.5">
        {/* Botão Editar */}
        <button className="hover:text-primary" onClick={handleEdit}>
          <PenIcon />
        </button>
        {/* Botão Eliminar */}
        <button className="hover:text-primary" onClick={handleDelete}>
          <TrashIcon />
        </button>
      </div>

      {/* Modal de Edição */}
      {editMode && (
        <Dialog
          open={editMode}
          onClose={() => setEditMode(false)}
          aria-labelledby="form-dialog-title"
        >
          <DialogContent className="dark:bg-boxdark">
            <FormEdit {...rowData} />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Confirmação */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title" sx={{ fontSize: '28px' }}>
          Eliminar
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Tem certeza que deseja eliminar o produto {rowData.nome}?
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: 'flex-end', mt: 3 }}
          >
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="primary"
            >
              Confirmar
            </Button>
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              color="secondary"
            >
              Cancelar
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>


      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        autoHideDuration={3000}
        open={open}
        key={vertical + horizontal}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity="success"    
          variant="filled"
          sx={{ width: '100%' }}
        >
          Produto eliminado com sucesso!
        </Alert>
      </Snackbar>
      
    </div>
  );
};

export default ActionsMenu;
