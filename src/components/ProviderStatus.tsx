"use client";

type ProviderStatusProps = {
  providers: Array<{
    provider: string;
    modelOrGroup: string;
    estimatedCost?: string | null;
    fallbackUsed?: boolean;
  }>;
  warnings?: string[];
};

export default function ProviderStatus({ providers, warnings }: ProviderStatusProps) {
  return (
    <div className="rounded-2xl bg-surface-2 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Proveedores y modelos</h3>
        <span className="badge">No exponemos claves</span>
      </div>
      <div className="mt-4 space-y-3">
        {providers.map((provider, index) => (
          <div key={`${provider.provider}-${index}`} className="rounded-xl bg-surface px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white">{provider.provider}</p>
              <span className="text-xs text-muted">{provider.modelOrGroup}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {provider.fallbackUsed ? "Fallback usado. " : ""}
              {provider.estimatedCost ? `Coste estimado: ${provider.estimatedCost}. ` : ""}
              Ejecutado en modo mock.
            </p>
          </div>
        ))}
      </div>
      {warnings && warnings.length > 0 && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-warning">
          {warnings.map((warning, index) => (
            <li key={`${warning}-${index}`}>{warning}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
