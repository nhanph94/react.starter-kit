import type { ModalOptions, ModalResult, ModalType } from './ModalContainer';

type ModalHandler = (options: ModalOptions) => Promise<ModalResult>;
type ModalMethod = (options: Omit<ModalOptions, 'type'>) => Promise<ModalResult>;
type ModalApi = {
  close: (result?: ModalResult) => void;
  show: (options: ModalOptions) => Promise<ModalResult>;
} & Record<ModalType, ModalMethod>;
type QueuedModal = {
  options: ModalOptions;
  reject: (reason?: unknown) => void;
  resolve: (result: ModalResult) => void;
};

let modalHandler: ModalHandler | undefined;
let closeHandler: ((result?: ModalResult) => void) | undefined;
const queuedModals: QueuedModal[] = [];

const show = (options: ModalOptions) => {
  if (modalHandler) {
    return modalHandler(options);
  }

  return new Promise<ModalResult>((resolve, reject) => {
    queuedModals.push({ options, reject, resolve });
  });
};

export const modal: ModalApi = {
  close: (result) => closeHandler?.(result),
  show,
  info: (options) => show({ ...options, type: 'info' }),
  success: (options) => show({ ...options, type: 'success' }),
  warning: (options) => show({ ...options, type: 'warning' }),
  error: (options) => show({ ...options, type: 'error' }),
};

export const registerModalHandler = (
  handler: ModalHandler,
  close: (result?: ModalResult) => void,
) => {
  modalHandler = handler;
  closeHandler = close;
  for (const queuedModal of queuedModals.splice(0)) {
    void handler(queuedModal.options).then(queuedModal.resolve, queuedModal.reject);
  }

  return () => {
    if (modalHandler === handler) {
      modalHandler = undefined;
      closeHandler = undefined;
    }
  };
};
