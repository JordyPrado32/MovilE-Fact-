import { useEffect, useState } from 'react';
import { FacturaPreparacion } from '../services/facturasMobileService';
import { PuntoEmision, PuntosEmisionData } from '../types/business';

export type DocumentSeriesKind = 'factura' | 'notaCredito' | 'notaDebito' | 'liquidacion' | 'guia';

type FacturaSerieOption = NonNullable<FacturaPreparacion['series']>[number];
type DocumentSerieOption = FacturaSerieOption & { esPrincipal?: boolean };

function numberValue(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function normalizeSerieCode(value?: string | number | null) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? digits.padStart(3, '0').slice(-3) : '';
}

export function normalizeSerieDisplay(value?: string | number | null) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (text.includes('-')) {
    const [establecimiento, punto] = text.split('-');
    return `${normalizeSerieCode(establecimiento)}-${normalizeSerieCode(punto)}`;
  }
  const digits = text.replace(/\D/g, '');
  if (digits.length >= 6) return `${normalizeSerieCode(digits.slice(0, 3))}-${normalizeSerieCode(digits.slice(3, 6))}`;
  return text;
}

export function getPuntoSerie(punto: PuntoEmision) {
  if (punto.establecimiento && punto.puntoEmision) return `${normalizeSerieCode(punto.establecimiento)}-${normalizeSerieCode(punto.puntoEmision)}`;
  const serie = punto.serieFactura ?? punto.serieNotasCred ?? punto.serieGuia ?? '';
  if (serie.includes('-')) return serie;
  return normalizeSerieCode(punto.puntoEmision ?? punto.numCaja);
}

function getPuntoSequenceValue(punto: PuntoEmision, keys: string[]) {
  const row = punto as PuntoEmision & Record<string, unknown>;
  const value = keys.map((key) => row[key]).find((candidate) => candidate !== null && candidate !== undefined && String(candidate).trim());
  if (value === undefined) return '-';
  const numeric = numberValue(value);
  return numeric > 0 ? String(numeric).padStart(9, '0') : String(value);
}

export function getPuntoDocumentSequences(punto: PuntoEmision) {
  const serie = getPuntoSerie(punto) || 'Sin serie';
  return [
    { label: 'Factura', serie: punto.serieFactura || serie, secuencia: getPuntoSequenceForDocument(punto, 'factura') },
    { label: 'Nota credito', serie: punto.serieNotasCred || serie, secuencia: getPuntoSequenceForDocument(punto, 'notaCredito') },
    { label: 'Nota debito', serie: punto.serieNotasDeb || serie, secuencia: getPuntoSequenceForDocument(punto, 'notaDebito') },
    { label: 'Guia', serie: punto.serieGuia || serie, secuencia: getPuntoSequenceForDocument(punto, 'guia') },
    { label: 'Retencion', serie: punto.serieRetencion || serie, secuencia: getPuntoSequenceValue(punto, ['secRetencion', 'secuencialRetencion', 'secuenciaRetencion', 'siguienteRetencion', 'proximoRetencion', 'numRetencion', 'numeroRetencion']) },
    { label: 'Liquidacion', serie: punto.serieLiquidacion || punto.serieLiquidacionCompra || serie, secuencia: getPuntoSequenceForDocument(punto, 'liquidacion') },
  ];
}

export function getSerieValue(item?: DocumentSerieOption) {
  const row = item as (DocumentSerieOption & Record<string, unknown>) | undefined;
  return String(
    item?.serieRaw ??
      item?.serieVisual ??
      row?.serie ??
      row?.Serie ??
      row?.serieFactura ??
      row?.SerieFactura ??
      '',
  );
}

function getSelectedSerie(preparacion: FacturaPreparacion | null, serie: string) {
  const options = preparacion?.series ?? [];
  return options.find((item) => item.serieRaw === serie || item.serieVisual === serie);
}

export function getSerieLabel(preparacion: FacturaPreparacion | null, serie: string, fallback = '001-001') {
  const selected = getSelectedSerie(preparacion, serie);
  return selected?.serieVisual || selected?.serieRaw || serie || preparacion?.caja?.serieFactura || fallback;
}

export function getNextSequence(preparacion: FacturaPreparacion | null, serie: string, fallbackStart = 0) {
  const selected = getSelectedSerie(preparacion, serie);
  const row = selected as Record<string, unknown> | undefined;
  const caja = preparacion?.caja as Record<string, unknown> | null | undefined;
  const candidate = numberValue(
    row?.siguiente ??
      row?.proximo ??
      row?.secuencial ??
      row?.numeroSecuencia ??
      row?.sec ??
      caja?.siguiente ??
      caja?.proximo ??
      caja?.secuencial ??
      caja?.numeroSecuencia ??
      caja?.sec,
  );
  const next = candidate > 0 ? candidate + (row?.siguiente || row?.proximo || caja?.siguiente || caja?.proximo ? 0 : 1) : fallbackStart + 1;
  return String(next).padStart(9, '0');
}

function getSerieCodemisor(preparacion: FacturaPreparacion | null, serie: string) {
  return getSelectedSerie(preparacion, serie)?.codemisor ?? preparacion?.caja?.codemisor;
}

export function getSerieCodemisorFromOptions(options: DocumentSerieOption[], serie: string, preparacion: FacturaPreparacion | null) {
  const selected = options.find((item) => item.serieRaw === serie || item.serieVisual === serie);
  return selected?.codemisor ?? getSerieCodemisor(preparacion, serie);
}

function getPuntoSerieForDocument(punto: PuntoEmision, kind: DocumentSeriesKind) {
  const row = punto as PuntoEmision & Record<string, unknown>;
  const byKind =
    kind === 'notaCredito' ? punto.serieNotasCred ?? row.serieNotaCredito :
    kind === 'notaDebito' ? punto.serieNotasDeb ?? row.serieNotaDebito :
    kind === 'liquidacion' ? punto.serieLiquidacion ?? punto.serieLiquidacionCompra ?? row.serieLiquidacionCompra :
    kind === 'guia' ? punto.serieGuia :
    punto.serieFactura;
  return String(byKind || getPuntoSerie(punto) || '');
}

function getPuntoSequenceForDocument(punto: PuntoEmision, kind: DocumentSeriesKind) {
  if (kind === 'notaCredito') return getPuntoSequenceValue(punto, ['secNotaCredito', 'secuencialNotaCredito', 'secuenciaNotaCredito', 'siguienteNotaCredito', 'proximoNotaCredito', 'secNC', 'numNotaCredito', 'numeroNotaCredito']);
  if (kind === 'notaDebito') return getPuntoSequenceValue(punto, ['secNotaDebito', 'secuencialNotaDebito', 'secuenciaNotaDebito', 'siguienteNotaDebito', 'proximoNotaDebito', 'secND', 'numNotaDebito', 'numeroNotaDebito']);
  if (kind === 'liquidacion') return getPuntoSequenceValue(punto, ['secLiquidacion', 'secuencialLiquidacion', 'secuenciaLiquidacion', 'siguienteLiquidacion', 'proximoLiquidacion', 'secLiquidacionCompra', 'numLiquidacion', 'numeroLiquidacion']);
  if (kind === 'guia') return getPuntoSequenceValue(punto, ['secGuia', 'secuencialGuia', 'secuenciaGuia', 'siguienteGuia', 'proximoGuia', 'numGuia', 'numeroGuia']);
  return getPuntoSequenceValue(punto, ['secFactura', 'secuencialFactura', 'secuenciaFactura', 'siguienteFactura', 'proximoFactura', 'numFactura', 'numeroFactura', 'sec']);
}

export function getDocumentSerieOptions(preparacion: FacturaPreparacion | null, puntosData: PuntosEmisionData | null, kind: DocumentSeriesKind) {
  const orderedPuntos = [...(puntosData?.cajas ?? [])].sort((a, b) => {
    const principal = Number(Boolean(b.esPrincipal)) - Number(Boolean(a.esPrincipal));
    if (principal !== 0) return principal;
    return Number(a.numCaja ?? 0) - Number(b.numCaja ?? 0);
  });
  const puntos = orderedPuntos
    .map((punto) => {
      const row = punto as PuntoEmision & Record<string, unknown>;
      const serie = normalizeSerieDisplay(getPuntoSerieForDocument(punto, kind));
      if (!serie) return null;
      const secuencia = getPuntoSequenceForDocument(punto, kind);
      return {
        serieRaw: serie,
        serieVisual: serie,
        codemisor: numberValue(row.codemisor ?? row.codEmisor ?? row.codigoEmisor ?? preparacion?.caja?.codemisor) || null,
        sec: secuencia === '-' ? null : numberValue(secuencia),
        numCaja: punto.numCaja,
        esPrincipal: punto.esPrincipal,
      } as DocumentSerieOption;
    })
    .filter(Boolean) as DocumentSerieOption[];

  const prepared = (preparacion?.series ?? []).map((item, index) => {
    const value = normalizeSerieDisplay(getSerieValue(item));
    if (value && !value.toLowerCase().startsWith('serie ')) return { ...item, serieRaw: value, serieVisual: value };
    return puntos.length > 0 ? null : item;
  }).filter((item): item is DocumentSerieOption => Boolean(item));
  const source = puntos.length > 0 ? [...puntos, ...prepared] : prepared;
  const unique = new Map<string, DocumentSerieOption>();
  source.forEach((item) => {
    const key = normalizeSerieDisplay(getSerieValue(item));
    if (key && !unique.has(key)) unique.set(key, { ...item, serieRaw: key, serieVisual: key });
  });

  return Array.from(unique.values());
}

export function usePreferredDocumentSerie(serieOptions: DocumentSerieOption[], currentSerie: string, onSelectSerie: (serie: string) => void) {
  const [appliedKey, setAppliedKey] = useState('');

  useEffect(() => {
    const preferredOption = serieOptions[0];
    const preferred = getSerieValue(preferredOption);
    if (!preferred) return;
    const key = `${preferred}:${preferredOption?.esPrincipal ? 'principal' : 'fallback'}`;
    if (appliedKey === key) return;
    if (preferredOption?.esPrincipal || !currentSerie) onSelectSerie(preferred);
    setAppliedKey(key);
  }, [appliedKey, currentSerie, serieOptions]);
}

export function getSerieLabelFromOptions(options: DocumentSerieOption[], serie: string, fallback: string) {
  const selected = options.find((item) => item.serieRaw === serie || item.serieVisual === serie);
  return selected?.serieVisual || selected?.serieRaw || serie || fallback;
}

export function getNextSequenceFromOptions(options: DocumentSerieOption[], serie: string, fallback: string) {
  const selected = options.find((item) => item.serieRaw === serie || item.serieVisual === serie);
  const row = selected as (DocumentSerieOption & Record<string, unknown>) | undefined;
  const candidate = numberValue(row?.siguiente ?? row?.proximo ?? row?.secuencial ?? row?.numeroSecuencia ?? row?.sec);
  if (selected && candidate <= 0) return '';
  if (candidate <= 0) return fallback;
  const alreadyNext = row?.siguiente || row?.proximo;
  return String(alreadyNext ? candidate : candidate + 1).padStart(9, '0');
}
