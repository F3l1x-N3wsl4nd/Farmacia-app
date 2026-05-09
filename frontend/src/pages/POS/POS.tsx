import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { PosView } from '../../components/POS/PosView';

const POS = () => {
  return (
    <>
      <Breadcrumb pageName="POS" />
      <div className="flex flex-col gap-10">
        <PosView />
      </div>
    </>
  );
};

export default POS;
