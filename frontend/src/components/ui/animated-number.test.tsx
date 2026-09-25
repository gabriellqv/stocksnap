import { render, screen, act } from '@testing-library/react';
import { AnimatedNumber } from './animated-number';

describe('AnimatedNumber Component', () => {
  beforeEach(() => {
    let time = 0;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      time += 500;
      cb(time);
      return 1;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renderiza o valor numérico animado', () => {
    act(() => {
      render(<AnimatedNumber value={15} duration={500} />);
    });

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('formata valores usando a função customizada de formatação', () => {
    const mockFormatter = (val: number) => `R$ ${val.toFixed(2)}`;
    act(() => {
      render(<AnimatedNumber value={100} duration={500} formatter={mockFormatter} />);
    });

    expect(screen.getByText('R$ 100.00')).toBeInTheDocument();
  });
});
