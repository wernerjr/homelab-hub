import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders title and children', () => {
    render(
      <Card title="Métricas">
        <div>conteúdo</div>
      </Card>
    );

    expect(screen.getByText('Métricas')).toBeInTheDocument();
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
  });
});
