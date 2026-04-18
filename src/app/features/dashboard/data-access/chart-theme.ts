import { Signal, computed, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

export interface ChartPalette {
  readonly text: string;
  readonly mutedText: string;
  readonly grid: string;
  readonly income: string;
  readonly expense: string;
  readonly surface: string;
}

/** Mirrors the CSS tokens in `styles.scss` (canvas cannot read `light-dark()`). */
const LIGHT: ChartPalette = {
  text: '#1d1b20',
  mutedText: '#49454f',
  grid: 'rgba(29, 27, 32, 0.08)',
  income: '#14804a',
  expense: '#c4314b',
  surface: '#ffffff',
};

const DARK: ChartPalette = {
  text: '#e6e0e9',
  mutedText: '#cac4d0',
  grid: 'rgba(230, 224, 233, 0.1)',
  income: '#5ed69a',
  expense: '#ff8fa3',
  surface: '#141218',
};

/** Chart colors that follow the current theme. Must run in an injection context. */
export function injectChartPalette(): Signal<ChartPalette> {
  const theme = inject(ThemeService);
  return computed(() => (theme.isDark() ? DARK : LIGHT));
}

export const CHART_FONT = { family: 'Inter, Roboto, system-ui, sans-serif', size: 12 };
