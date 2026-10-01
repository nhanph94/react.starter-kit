import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { registerModalHandler } from './modal';

export type ModalButton = {
  className?: string;
  id: string;
  label: string;
  onClick?: () => void | Promise<void>;
};

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalType = 'info' | 'success' | 'warning' | 'error';
export type ModalResult = string | undefined;

export type ModalOptions = {
  buttons?: ModalButton[];
  description?: ReactNode;
  icon?: ReactNode | false;
  size?: ModalSize;
  title?: ReactNode;
  type?: ModalType;
};

type PendingModal = ModalOptions & {
  reject: (reason?: unknown) => void;
  resolve: (result: ModalResult) => void;
};

type ClosingOutcome = { error: unknown } | { result: ModalResult } | null;

const modalSizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'w-11/12 max-w-none',
};

const modalTypeConfig: Record<
  ModalType,
  { icon: ReactNode; iconClassName: string; title: string }
> = {
  info: {
    icon: <span className="text-2xl">ℹ</span>,
    iconClassName: 'text-info',
    title: 'Information',
  },
  success: {
    icon: <span className="text-2xl">✓</span>,
    iconClassName: 'text-success',
    title: 'Success',
  },
  warning: {
    icon: <span className="text-2xl">⚠</span>,
    iconClassName: 'text-warning',
    title: 'Warning',
  },
  error: { icon: <span className="text-2xl">✕</span>, iconClassName: 'text-error', title: 'Error' },
};

export const ModalContainer = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pendingModalRef = useRef<PendingModal | null>(null);
  const queuedModalsRef = useRef<PendingModal[]>([]);
  const closingOutcomeRef = useRef<ClosingOutcome>(null);
  const isProcessingRef = useRef(false);
  const processingActionRef = useRef<symbol | null>(null);
  const [pendingModal, setPendingModal] = useState<PendingModal | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showNextConfirmation = useCallback(() => {
    const nextModal = queuedModalsRef.current.shift() ?? null;
    pendingModalRef.current = nextModal;
    setPendingModal(nextModal);
  }, []);

  const settle = useCallback(
    (result: ModalResult) => {
      pendingModalRef.current?.resolve(result);
      showNextConfirmation();
    },
    [showNextConfirmation],
  );

  const reject = useCallback(
    (error: unknown) => {
      pendingModalRef.current?.reject(error);
      showNextConfirmation();
    },
    [showNextConfirmation],
  );

  const show = useCallback((options: ModalOptions) => {
    return new Promise<ModalResult>((resolve, reject) => {
      const modal = { ...options, reject, resolve };

      if (pendingModalRef.current) {
        queuedModalsRef.current.push(modal);
        return;
      }

      pendingModalRef.current = modal;
      setPendingModal(modal);
    });
  }, []);

  const close = useCallback(
    (result?: ModalResult) => {
      if (!pendingModalRef.current) return;

      isProcessingRef.current = false;
      processingActionRef.current = null;
      setIsProcessing(false);

      const dialog = dialogRef.current;
      if (!dialog?.open) {
        settle(result);
        return;
      }

      closingOutcomeRef.current = { result };
      dialog.close();
    },
    [settle],
  );

  useEffect(() => registerModalHandler(show, close), [close, show]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !pendingModal) return;

    if (!dialog.open) {
      dialog.showModal();
    }
  }, [pendingModal]);

  const handleClose = () => {
    const outcome = closingOutcomeRef.current;
    closingOutcomeRef.current = null;

    if (outcome && 'error' in outcome) {
      reject(outcome.error);
      return;
    }

    settle(outcome?.result);
  };

  const preventDismissalWhileProcessing = (event: { preventDefault: () => void }) => {
    if (isProcessingRef.current) {
      event.preventDefault();
    }
  };

  const handleButtonClick = async (button: ModalButton) => {
    if (isProcessingRef.current) return;

    const activeModal = pendingModalRef.current;
    const action = Symbol('modal-action');
    isProcessingRef.current = true;
    processingActionRef.current = action;
    setIsProcessing(true);
    try {
      await button.onClick?.();
      if (pendingModalRef.current !== activeModal) return;

      closingOutcomeRef.current = { result: button.id };
      dialogRef.current?.close();
    } catch (error) {
      if (pendingModalRef.current !== activeModal) return;

      closingOutcomeRef.current = { error };
      dialogRef.current?.close();
    } finally {
      if (processingActionRef.current === action) {
        isProcessingRef.current = false;
        processingActionRef.current = null;
        setIsProcessing(false);
      }
    }
  };

  const type = pendingModal?.type ?? 'info';
  const typeConfig = modalTypeConfig[type];
  const icon = pendingModal?.icon === false ? null : (pendingModal?.icon ?? typeConfig.icon);
  const buttons: ModalButton[] = pendingModal?.buttons ?? [
    { className: 'btn btn-primary', id: 'close', label: 'Close' },
  ];
  const size = pendingModal?.size ?? 'md';

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onCancel={preventDismissalWhileProcessing}
      onClose={handleClose}
      aria-labelledby="modal-dialog-title"
    >
      <div className={`modal-box ${modalSizeClasses[size]}`}>
        <div className="flex items-start gap-3">
          {icon && <div className={`shrink-0 ${typeConfig.iconClassName}`}>{icon}</div>}
          <div className="min-w-0 flex-1">
            <h2 id="modal-dialog-title" className="text-lg font-bold">
              {pendingModal?.title ?? typeConfig.title}
            </h2>
            {pendingModal?.description && <div className="pt-3">{pendingModal.description}</div>}
          </div>
        </div>
        <div className="modal-action">
          {buttons.map((button) => (
            <button
              key={button.id}
              type="button"
              className={button.className ?? 'btn'}
              disabled={isProcessing}
              onClick={() => handleButtonClick(button)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={preventDismissalWhileProcessing}>
        <button type="submit" aria-label="Close modal">
          Close
        </button>
      </form>
    </dialog>
  );
};
