import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Dummy', () => {
  it('renders dummy component', () => {
    try {
      render(<div>Hello Test</div>);
      expect(screen.getByText('Hello Test')).toBeInTheDocument();
    } catch (err) {
      console.error('FAIL: Dummy render or expect crashed', err);
      throw err;
    }
  });
});
