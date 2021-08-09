import {useContext} from 'react';
import {ApplicationContext} from '../contexts/application';
import {Toast} from 'react-bootstrap';
import {removeToast} from '../contexts/reducers/remove-toast';
import {ReduceActionName} from '../interfaces/enums/reduce-action-names';

export default function Toaster() {
  const {state: {toaster}, dispatch} = useContext(ApplicationContext);

  function onClose(i: number) {
    dispatch(removeToast(i));
  }

  return (
    <>
      {toaster.map((toast, i) =>
                     <div className="position-absolute w-100 d-flex justify-content-end pt-5" style={{right: '1rem'}}>
                       <div className="w-25 pb-3 pr-3 d-flex justify-content-end">
                         <Toast onClose={() => onClose(i)} show={true} key={i} className={toast.type.padStart(toast.type.length + 3, `bg-`)}>
                           {toast.title &&
                           <Toast.Header closeLabel=""><strong className="me-auto">{toast.title}</strong></Toast.Header>}
                           <Toast.Body>{toast.content}</Toast.Body>
                         </Toast>
                       </div>
                     </div>
      )}
    </>
  )
}
