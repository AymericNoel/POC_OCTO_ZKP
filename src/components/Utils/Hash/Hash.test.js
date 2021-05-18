const { render, screen, fireEvent } = require('@testing-library/react');
import Hash from './Hash';
import React from 'react';
import { HashUtils } from '../../../utils/HashUtils';

describe('Hash components', () => {
  test('Should be empty when page is loaded', () => {
    render(<Hash />);
    const retrievedContent = screen.getByTestId('hash');
    expect(retrievedContent).toHaveTextContent('Hash :');
  });
  
  test('Should calculates the correct hash', () => {
    render(<Hash />);
    const inputContent = screen.getByTestId('hashInput');
    const inputValue = 'abc';
    fireEvent.change(inputContent, { target: { value: inputValue } });

    const correctHash = HashUtils.getHashFromString(inputValue);

    const retrievedContent = screen.getByTestId('hash');

    expect(retrievedContent).toHaveTextContent('Hash : 0x' + correctHash);
  });
});
