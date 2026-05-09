import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import PenIcon from '../../icons/Pen';
import TrashIcon from '../../icons/Trash';
import {
  Button,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { User } from '../../types/user';
import api from '../../utils/api';

const ActionsMenu = ({
  rowData,
  onActionComplete,
}: {
  rowData: User;
  onActionComplete: () => void;
}) => {
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

  const handleConfirmDelete = async () => {
    try {
      await api.put(`/users/${rowData.id_usuario}`);
      setOpenDialog(false);
      onActionComplete();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-3.5">
        <button className="hover:text-primary" onClick={handleEdit}>
          <PenIcon />
        </button>
        <button className="hover:text-primary" onClick={handleDelete}>
          <TrashIcon />
        </button>
      </div>
      {editMode && (
        <Dialog
          open={editMode}
          onClose={() => setEditMode(false)}
          aria-labelledby="form-dialog-title"
        >
          <DialogContent className="dark:bg-boxdark">
            <h1>Editar usuario</h1>
          </DialogContent>
        </Dialog>
      )}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title" sx={{ fontSize: '28px' }}>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            ¿Está seguro de eliminar este usuario?
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
    </div>
  );
};

export default ActionsMenu;
