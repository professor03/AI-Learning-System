import type { SlideLayout } from './presentation-schema';

export interface ElementPosition {
    x: number | string;
    y: number | string;
    w: number | string;
    h: number | string;
    align?: 'left' | 'center' | 'right';
    fontSize?: number;
}

export interface LayoutDefinition {
    title: ElementPosition;
    subtitle?: ElementPosition;
    body?: ElementPosition; // Main text area (bullets, main point)
    image?: ElementPosition;
    chart?: ElementPosition;
}

export const LAYOUT_MAP: Record<SlideLayout, LayoutDefinition> = {
    'title': {
        title: { x: '5%', y: '40%', w: '90%', h: '20%', align: 'center', fontSize: 44 },
        subtitle: { x: '10%', y: '60%', w: '80%', h: '10%', align: 'center', fontSize: 24 },
    },
    'section-header': {
        title: { x: '5%', y: '45%', w: '90%', h: '15%', align: 'center', fontSize: 36 },
        subtitle: { x: '10%', y: '60%', w: '80%', h: '10%', align: 'center', fontSize: 20 },
    },
    'split_left': {
        title: { x: '52%', y: '5%', w: '43%', h: '15%', align: 'left', fontSize: 32 },
        body: { x: '52%', y: '25%', w: '43%', h: '65%', align: 'left', fontSize: 18 },
        image: { x: '2%', y: '10%', w: '45%', h: '80%' },
        chart: { x: '2%', y: '10%', w: '45%', h: '80%' },
    },
    'split_right': {
        title: { x: '5%', y: '5%', w: '43%', h: '15%', align: 'left', fontSize: 32 },
        body: { x: '5%', y: '25%', w: '43%', h: '65%', align: 'left', fontSize: 18 },
        image: { x: '52%', y: '10%', w: '45%', h: '80%' },
        chart: { x: '52%', y: '10%', w: '45%', h: '80%' },
    },
    'bullet-points': {
        title: { x: '5%', y: '5%', w: '90%', h: '15%', align: 'left', fontSize: 36 },
        body: { x: '5%', y: '25%', w: '90%', h: '65%', align: 'left', fontSize: 20 },
    },
    'image_focus': {
        title: { x: '5%', y: '80%', w: '90%', h: '10%', align: 'center', fontSize: 36 },
        image: { x: '0%', y: '0%', w: '100%', h: '100%' },
    },
    'statistic-focus': {
        title: { x: '5%', y: '5%', w: '90%', h: '15%', align: 'center', fontSize: 32 },
        body: { x: '10%', y: '30%', w: '80%', h: '40%', align: 'center', fontSize: 60 }, // Big number
    },
    // Fallbacks for others
    'agenda': {
        title: { x: '5%', y: '5%', w: '90%', h: '15%', align: 'left', fontSize: 36 },
        body: { x: '10%', y: '25%', w: '80%', h: '65%', align: 'left', fontSize: 20 },
    },
    'scqa': {
        title: { x: '5%', y: '5%', w: '90%', h: '15%', align: 'left', fontSize: 36 },
        body: { x: '5%', y: '25%', w: '90%', h: '65%', align: 'left', fontSize: 18 },
    },
    'bento-grid': {
        title: { x: '5%', y: '5%', w: '90%', h: '15%', align: 'left', fontSize: 36 },
        body: { x: '5%', y: '25%', w: '45%', h: '65%', align: 'left', fontSize: 18 },
        image: { x: '55%', y: '25%', w: '40%', h: '65%' },
    },
    'data-chart': {
        title: { x: '5%', y: '5%', w: '90%', h: '10%', align: 'center', fontSize: 32 },
        chart: { x: '10%', y: '20%', w: '80%', h: '70%' },
    },
    'process-diagram': {
        title: { x: '5%', y: '5%', w: '90%', h: '10%', align: 'center', fontSize: 32 },
        image: { x: '5%', y: '20%', w: '90%', h: '70%' }, // Mermaid rendered as image
    },
    'quote': {
        title: { x: '10%', y: '30%', w: '80%', h: '40%', align: 'center', fontSize: 40 },
        subtitle: { x: '20%', y: '75%', w: '60%', h: '10%', align: 'center', fontSize: 24 },
    },
    'conclusion': {
        title: { x: '5%', y: '40%', w: '90%', h: '20%', align: 'center', fontSize: 44 },
        subtitle: { x: '10%', y: '60%', w: '80%', h: '10%', align: 'center', fontSize: 24 },
    },
    'timeline': {
        title: { x: '5%', y: '5%', w: '90%', h: '15%', align: 'left', fontSize: 36 },
        body: { x: '5%', y: '25%', w: '90%', h: '65%', align: 'left', fontSize: 18 },
    },
    'comparison': {
        title: { x: '5%', y: '5%', w: '90%', h: '15%', align: 'center', fontSize: 36 },
        body: { x: '5%', y: '25%', w: '45%', h: '65%', align: 'left', fontSize: 18 },
        image: { x: '55%', y: '25%', w: '40%', h: '65%' },
    },
    'team-grid': {
        title: { x: '5%', y: '5%', w: '90%', h: '15%', align: 'left', fontSize: 36 },
        body: { x: '5%', y: '25%', w: '90%', h: '65%', align: 'left', fontSize: 18 },
    },
    'feature-grid-3': {
        title: { x: '5%', y: '5%', w: '90%', h: '15%', align: 'left', fontSize: 36 },
        body: { x: '5%', y: '25%', w: '90%', h: '65%', align: 'left', fontSize: 18 },
    },
    'feature-grid-4': {
        title: { x: '5%', y: '5%', w: '90%', h: '15%', align: 'left', fontSize: 36 },
        body: { x: '5%', y: '25%', w: '90%', h: '65%', align: 'left', fontSize: 18 },
    },
    'call-to-action': {
        title: { x: '5%', y: '40%', w: '90%', h: '20%', align: 'center', fontSize: 48 },
        subtitle: { x: '10%', y: '65%', w: '80%', h: '10%', align: 'center', fontSize: 24 },
    },
};
