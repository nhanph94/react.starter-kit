import type { ElementType, PropsWithChildren, ReactNode } from 'react';

export type ProviderDescriptor = [string, ElementType, unknown];
export type ProviderBuilderProps = PropsWithChildren<{ providers: ProviderDescriptor[] }>;

const ProviderBuilder = ({ children, providers }: ProviderBuilderProps) =>
  providers.reduceRight<ReactNode>((acc, [id, Provider, props]) => {
    return (
      <Provider key={id} {...(props ?? {})}>
        {acc}
      </Provider>
    );
  }, children);

export default ProviderBuilder;
