import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement, useEffect, useState } from 'react';
import { beforeAll, expect, test } from 'vitest';

import { ModalContainer, modal } from '@/libs/react/modal';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

const renderWithModal = (ui: ReactElement) =>
  render(
    <>
      <ModalContainer />
      {ui}
    </>,
  );

const ConfirmationTriggers = () => {
  const [results, setResults] = useState<Record<string, string | undefined>>({});

  const requestConfirmation = (id: string, title: string) => {
    void modal
      .show({
        title,
        buttons: [
          { id: 'cancel', label: 'Cancel' },
          { id: 'confirm', label: 'Confirm' },
        ],
      })
      .then((result) => {
        setResults((current) => ({ ...current, [id]: result }));
      });
  };

  return (
    <>
      <button type="button" onClick={() => requestConfirmation('first', 'First confirmation')}>
        Open first confirmation
      </button>
      <button type="button" onClick={() => requestConfirmation('second', 'Second confirmation')}>
        Open second confirmation
      </button>
      <output>First result: {String(results.first)}</output>
      <output>Second result: {String(results.second)}</output>
    </>
  );
};

test('queues confirmation requests until the active dialog closes', async () => {
  const user = userEvent.setup();
  renderWithModal(<ConfirmationTriggers />);

  await user.click(screen.getByRole('button', { name: 'Open first confirmation' }));
  await user.click(screen.getByRole('button', { name: 'Open second confirmation' }));
  await user.click(screen.getByRole('button', { name: 'Confirm' }));

  expect(await screen.findByText('Second confirmation')).toBeInTheDocument();
  expect(await screen.findByText('First result: confirm')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(await screen.findByText('Second result: cancel')).toBeInTheDocument();
});

test('accepts a confirmation requested from a descendant mount effect', async () => {
  const user = userEvent.setup();

  const MountEffectConfirmation = () => {
    const [result, setResult] = useState<string>();

    useEffect(() => {
      void modal.show({ title: 'Mount effect confirmation' }).then(setResult);
    }, []);

    return <output>Mount effect result: {String(result)}</output>;
  };

  renderWithModal(<MountEffectConfirmation />);

  expect(await screen.findByText('Mount effect confirmation')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Close' }));
  expect(await screen.findByText('Mount effect result: close')).toBeInTheDocument();
});

test('applies the requested modal size', async () => {
  const user = userEvent.setup();

  renderWithModal(
    <button
      type="button"
      onClick={() => {
        void modal.show({ size: 'xl', title: 'Extra large confirmation' });
      }}
    >
      Open extra large confirmation
    </button>,
  );

  await user.click(screen.getByRole('button', { name: 'Open extra large confirmation' }));

  expect(await screen.findByText('Extra large confirmation')).toBeInTheDocument();
  expect(document.querySelector('.modal-box')).toHaveClass('max-w-4xl');
});

test('closes the active modal when its body calls modal.close', async () => {
  const user = userEvent.setup();
  let result: string | undefined;

  const FormBody = () => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        modal.close('submitted');
      }}
    >
      <button type="submit">Submit form</button>
    </form>
  );

  renderWithModal(
    <button
      type="button"
      onClick={() => {
        void modal.show({ description: <FormBody /> }).then((actionId) => {
          result = actionId;
        });
      }}
    >
      Open form modal
    </button>,
  );

  await user.click(screen.getByRole('button', { name: 'Open form modal' }));
  await user.click(screen.getByRole('button', { name: 'Submit form' }));

  await waitFor(() => {
    expect(result).toBe('submitted');
  });
  expect(document.querySelector('dialog')).not.toHaveAttribute('open');
});

test('does not let an action from a closed modal close the next modal', async () => {
  const user = userEvent.setup();
  let finishFirstAction: (() => void) | undefined;
  let finishSecondAction: (() => void) | undefined;
  let firstActionFinished = false;
  const firstAction = new Promise<void>((resolve) => {
    finishFirstAction = resolve;
  });
  const secondAction = new Promise<void>((resolve) => {
    finishSecondAction = resolve;
  });
  const results: string[] = [];

  renderWithModal(
    <>
      <button
        type="button"
        onClick={() => {
          void modal
            .show({
              title: 'First modal',
              buttons: [
                {
                  id: 'run-first',
                  label: 'Run first action',
                  onClick: async () => {
                    await firstAction;
                    firstActionFinished = true;
                  },
                },
              ],
            })
            .then((result) => results.push(`first:${result}`));
        }}
      >
        Open first modal
      </button>
      <button type="button" onClick={() => modal.close('manual')}>
        Close active modal
      </button>
      <button
        type="button"
        onClick={() => {
          void modal
            .show({
              title: 'Second modal',
              buttons: [
                { id: 'run-second', label: 'Run second action', onClick: () => secondAction },
              ],
            })
            .then((result) => results.push(`second:${result}`));
        }}
      >
        Open second modal
      </button>
    </>,
  );

  await user.click(screen.getByRole('button', { name: 'Open first modal' }));
  await user.click(screen.getByRole('button', { name: 'Run first action' }));
  await user.click(screen.getByRole('button', { name: 'Close active modal' }));
  await user.click(screen.getByRole('button', { name: 'Open second modal' }));

  expect(await screen.findByText('Second modal')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Run second action' }));
  finishFirstAction?.();

  await waitFor(() => {
    expect(results).toContain('first:manual');
    expect(firstActionFinished).toBe(true);
  });

  const dialog = document.querySelector('dialog');
  const cancelEvent = new Event('cancel', { cancelable: true });
  dialog?.dispatchEvent(cancelEvent);
  expect(cancelEvent.defaultPrevented).toBe(true);

  finishSecondAction?.();
  await waitFor(() => expect(results).toContain('second:run-second'));
});

test('prevents Escape from dismissing a modal while its action is processing', async () => {
  const user = userEvent.setup();
  let finishAction: (() => void) | undefined;
  let result: string | undefined;
  const action = new Promise<void>((resolve) => {
    finishAction = resolve;
  });

  renderWithModal(
    <button
      type="button"
      onClick={() => {
        void modal
          .show({ buttons: [{ id: 'run', label: 'Run action', onClick: () => action }] })
          .then((actionId) => {
            result = actionId;
          });
      }}
    >
      Open processing confirmation
    </button>,
  );

  await user.click(screen.getByRole('button', { name: 'Open processing confirmation' }));
  await user.click(screen.getByRole('button', { name: 'Run action' }));

  const dialog = document.querySelector('dialog');
  const cancelEvent = new Event('cancel', { cancelable: true });
  dialog?.dispatchEvent(cancelEvent);

  expect(cancelEvent.defaultPrevented).toBe(true);

  finishAction?.();
  await waitFor(() => {
    expect(result).toBe('run');
  });
});

test('rejects the confirmation when its button action fails', async () => {
  const user = userEvent.setup();

  const FailedActionConfirmation = () => {
    const [errorMessage, setErrorMessage] = useState('');

    return (
      <>
        <button
          type="button"
          onClick={() => {
            void modal
              .show({
                buttons: [
                  {
                    id: 'fail',
                    label: 'Fail action',
                    onClick: async () => {
                      throw new Error('Action failed');
                    },
                  },
                ],
              })
              .catch((error: Error) => {
                setErrorMessage(error.message);
              });
          }}
        >
          Open failed action confirmation
        </button>
        <output>Failure: {errorMessage}</output>
      </>
    );
  };

  renderWithModal(<FailedActionConfirmation />);

  await user.click(screen.getByRole('button', { name: 'Open failed action confirmation' }));
  await user.click(screen.getByRole('button', { name: 'Fail action' }));

  expect(await screen.findByText('Failure: Action failed')).toBeInTheDocument();
  expect(document.querySelector('dialog')).not.toHaveAttribute('open');
});
